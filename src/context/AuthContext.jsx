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

    const getDeviceId = () => {
        let deviceId = localStorage.getItem('postx_admin_device_id');
        if (!deviceId) {
            deviceId = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15);
            localStorage.setItem('postx_admin_device_id', deviceId);
        }
        return deviceId;
    };

    const login = async (email, password) => {
        setLoading(true);
        setError(null);
        const trimmedEmail = email.trim();
        try {
            console.log('Intentando login para:', trimmedEmail);
            const data = await apiRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    email: trimmedEmail,
                    password,
                    device_id: getDeviceId(),
                    device_name: navigator.userAgent
                }),
            });

            if (data.action === '2fa_required') {
                return { status: '2fa_required' };
            }

            const token = data.access_token;
            if (!token) {
                throw new Error('El servidor no devolvió un token de acceso');
            }

            localStorage.setItem('postx_admin_token', token);
            console.log('Login exitoso, verificando permisos de administrador...');

            const userData = await apiRequest('/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!userData.is_platform_admin) {
                localStorage.removeItem('postx_admin_token');
                throw new Error('Acceso restringido a administradores de plataforma');
            }

            setUser(userData);
            return { status: 'success' };
        } catch (err) {
            console.error('Error en el proceso de login:', err);
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const verify2FA = async (email, code) => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiRequest('/auth/verify-2fa', {
                method: 'POST',
                body: JSON.stringify({
                    email: email.trim(),
                    code,
                    device_id: getDeviceId(),
                    device_name: navigator.userAgent
                }),
            });

            const token = data.access_token;
            if (!token) {
                throw new Error('El servidor no devolvió un token de acceso tras verificar 2FA');
            }

            localStorage.setItem('postx_admin_token', token);

            const userData = await apiRequest('/auth/me', {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!userData.is_platform_admin) {
                localStorage.removeItem('postx_admin_token');
                throw new Error('Acceso restringido a administradores de plataforma');
            }

            setUser(userData);
            return { status: 'success' };
        } catch (err) {
            console.error('Error en verificación 2FA:', err);
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
        <AuthContext.Provider value={{ user, loading, error, login, verify2FA, logout, setError }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
