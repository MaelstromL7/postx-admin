const BASE_URL = import.meta.env.VITE_API_URL;

export async function apiRequest(path, options = {}) {
    const token = localStorage.getItem('postx_admin_token');
    const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'any',
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
