# AGENT_postx_admin.md

## Contexto
Estás trabajando dentro de la carpeta `postx-admin` — un repo independiente para la interfaz de administración interna de PostX, una plataforma SaaS de gestión de postproducción cinematográfica.

Esta interfaz es exclusiva para el Platform Admin (Leonard, dueño de PostX). Nunca será visible para los clientes. Se desplegará en Railway como un servicio separado en `admin.postx.mx`.

El backend de PostX ya existe y está corriendo en producción. Esta interfaz solo consume su API — no modifica el backend.

---

## Stack a usar
- **React + Vite** — rápido, ligero, fácil de deployar en Railway
- **Tailwind CSS** — para estilos sin overhead
- **Sin librerías de UI complejas** — componentes propios, interfaz oscura y limpia acorde al design system de PostX (colores: fondo `#0D1117`, acento `#00B4D8`, texto `#F3F4F6`)

---

## Lo que debe construir

### 1. Estructura de archivos

```
postx-admin/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── Dockerfile
├── .env.example
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── api/
    │   └── client.js
    ├── context/
    │   └── AuthContext.jsx
    ├── pages/
    │   ├── LoginPage.jsx
    │   ├── DashboardPage.jsx
    │   ├── ProjectsPage.jsx
    │   └── UsersPage.jsx
    └── components/
        ├── Sidebar.jsx
        ├── ProtectedRoute.jsx
        └── StatCard.jsx
```

---

### 2. Autenticación

- Login con email y password contra `POST /auth/login` del backend de PostX
- Guardar el JWT en `localStorage`
- Al iniciar, verificar el token con `GET /auth/me`
- Si `is_platform_admin` es `false` o el token es inválido, redirigir al login con mensaje de error: *"Acceso restringido a administradores de plataforma"*
- Logout limpia el token y redirige al login

**`src/api/client.js`** — cliente HTTP base:
```javascript
const BASE_URL = import.meta.env.VITE_API_URL;

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('postx_admin_token');
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || `HTTP ${res.status}`);
  }
  return res.json();
}
```

---

### 3. Páginas

#### Login (`/`)
- Formulario centrado con logo PostX
- Campos: email, password
- Botón "Entrar"
- Manejo de error si no es Platform Admin
- Design oscuro acorde al sistema de PostX

#### Dashboard (`/dashboard`)
- 4 stat cards:
  - Total de proyectos
  - Total de usuarios registrados
  - Proyectos activos (licencia activa)
  - Proyectos bloqueados (licencia inactiva)
- Datos obtenidos de `GET /admin/projects` y `GET /admin/users`

#### Proyectos (`/projects`)
- Tabla con todos los proyectos:
  - Nombre, tipo (FEATURE/SERIES), fecha de creación, estado de licencia
- Botones por fila:
  - **Activar licencia** → `POST /admin/projects/{id}/activate`
  - **Desactivar licencia** → `POST /admin/projects/{id}/deactivate`
- Indicador visual de estado: verde = activo, rojo = bloqueado

#### Usuarios (`/users`)
- Tabla con todos los usuarios:
  - Email, fecha de registro, estado (activo/suspendido)
- Botones por fila:
  - **Suspender** → `POST /admin/users/{id}/suspend`
  - **Reactivar** → `POST /admin/users/{id}/reactivate`

---

### 4. Sidebar de navegación

Links:
- Dashboard
- Proyectos
- Usuarios
- Cerrar sesión (logout)

Mostrar en el footer del sidebar: `leonard@postx.mx` y el badge `Platform Admin`

---

### 5. Dockerfile para Railway

```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
RUN printf 'server {\n\
    listen 8080;\n\
    location / {\n\
    root /usr/share/nginx/html;\n\
    index index.html;\n\
    try_files $uri $uri/ /index.html;\n\
    }\n\
    }\n' > /etc/nginx/conf.d/default.conf
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
```

---

### 6. Variables de entorno

Crear `.env.example`:
```
VITE_API_URL=https://postx-backend-production.up.railway.app
```

---

## Reglas importantes para el agente

- **Todo el código en un solo repo** — no crear subcarpetas innecesarias
- **No usar librerías de autenticación externas** — JWT manual con localStorage
- **Siempre verificar `is_platform_admin`** antes de mostrar cualquier contenido
- **Design oscuro** — fondo `#0D1117`, acento `#00B4D8`, texto `#F3F4F6`
- **Manejo de errores en todas las llamadas API** — mostrar mensaje claro si algo falla
- **No hardcodear URLs** — siempre usar `VITE_API_URL` del `.env`
- **Responsive básico** — funciona en desktop, no necesita ser mobile-first

---

## Resultado esperado

Al terminar, el agente debe poder correr:

```bash
npm install
npm run dev
```

Y ver la interfaz funcionando en `http://localhost:5173` conectada al backend de producción de PostX.

El deploy a Railway se hace con un simple push al repo — el Dockerfile ya está incluido.
