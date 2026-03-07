# PostX Admin Panel — Instrucciones para Claude

## Stack
- **Frontend:** React 19 + Vite + Tailwind CSS + Lucide React + React Router v7
- **API:** Fetch centralizado en `src/api/client.js` (`apiRequest`, `parseDate`)
- **Auth:** Context API + localStorage (`postx_admin_token`)
- **UI:** Sin librerías de componentes — todo custom con Tailwind. Color accent: `#B4FA32`

## Estructura
```
src/
├── api/client.js          # Cliente HTTP + parseDate
├── context/AuthContext.jsx
├── components/
│   ├── Sidebar.jsx
│   ├── ProtectedRoute.jsx
│   └── StatCard.jsx
└── pages/                 # Una página por ruta
```

## Estrategia de ramas — LEER ANTES DE ACTUAR

| Rama | Propósito | Deploy |
|------|-----------|--------|
| `main` | Producción (`admin.postx.mx`) | Railway — automático |
| `develop` | Staging y pruebas | Railway staging |
| `feature/visual-revamp` | Revisión local del nuevo aspecto gráfico (aún no definido) | Solo local |

### Reglas críticas
1. **Verificar siempre la rama actual** antes de editar o commitear cualquier archivo.
2. **NUNCA hacer merge hacia `main` sin autorización explícita** del usuario.
3. **NUNCA hacer merge hacia `develop` sin autorización explícita** del usuario.
4. Los cambios de `feature/visual-revamp` son experimentos visuales locales — no mezclar con producción.
5. Si hay que aplicar un fix urgente en producción, trabajar sobre `main` directamente (previa confirmación).
6. Push a `origin` solo cuando el usuario lo solicite explícitamente.

## Repo relacionado
El backend y el frontend Flutter están en `C:/Users/leona/desktop/Postx/` (repo separado).
Misma estrategia de ramas aplica allá.

## Convenciones de código
- Componentes: PascalCase, un archivo por página
- Estado: `useState` local, sin Redux ni Zustand
- Errores: banner inline `bg-red-500/10 border border-red-500/20`
- Loading: `<Loader2 className="animate-spin" />`
- Modales: `fixed inset-0 z-50 bg-black/70 backdrop-blur-sm`
- Confirmaciones destructivas: `confirm()` nativo

## Commits
- Ruff lint corre automáticamente en pre-commit (solo para archivos backend si se tocan)
- Formato: `feat:`, `fix:`, `chore:` en inglés
- **No agregar `Co-Authored-By: Claude` ni ninguna firma de Claude en los commits**
- **No agregar comentarios en el código que identifiquen a Claude como autor**
