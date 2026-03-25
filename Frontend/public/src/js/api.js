const API_BASE = 'http://localhost:3000/api';

const apiFetch = async (endpoint, options = {}) => {
    const token = window.auth.getToken();
    const isFormData = options.body instanceof FormData;

    const headers = {
        ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    let response;
    try {
        response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers
        });
    } catch (error) {
        throw new Error('No se pudo conectar con el backend. Verifica que este corriendo en http://localhost:3000');
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        if (response.status === 401) {
            window.auth.logout();
            throw new Error('Sesion expirada.');
        }

        throw new Error(data.message || 'No se pudo completar la solicitud.');
    }

    return data;
};

window.apiFetch = apiFetch;
