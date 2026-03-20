const BASE_URL = import.meta.env.VITE_API_URL;

// Parsea timestamps del backend (UTC sin Z) a hora local del browser
export function parseDate(ts) {
    if (!ts) return null;
    return new Date(ts.endsWith('Z') || ts.includes('+') ? ts : ts + 'Z');
}

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

    if (res.status === 204) return null;
    return res.json();
}
