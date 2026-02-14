import { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../api/client';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('postx_admin_token');
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const userData = await apiRequest('/auth/me');
            if (!userData.is_platform_admin) {
                throw new Error('Acceso restringido a administradores de plataforma');
            }
            setUser(userData);
        } catch (err) {
            console.error('Auth check failed:', err);
            localStorage.removeItem('postx_admin_token');
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        const trimmedEmail = email.trim();
        try {
            console.log('Intentando login para:', trimmedEmail);
            const data = await apiRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email: trimmedEmail, password }),
            });

            const token = data.access_token;
            if (!token) {
                throw new Error('El servidor no devolvió un token de acceso');
            }

            localStorage.setItem('postx_admin_token', token);
            console.log('Login exitoso, verificando permisos de administrador...');

            // After login, we need to check if they are actually a platform admin
            // Pass token explicitly to avoid any sync issues with localStorage
            const userData = await apiRequest('/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('Datos de usuario recibidos:', userData);

            if (!userData.is_platform_admin) {
                localStorage.removeItem('postx_admin_token');
                throw new Error('Acceso restringido a administradores de plataforma');
            }

            setUser(userData);
            return true;
        } catch (err) {
            console.error('Error en el proceso de login:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('postx_admin_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, error, login, logout, setError }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
