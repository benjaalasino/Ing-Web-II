const API_BASE_URL = 'http://localhost:3000/api';
const DEMO_USER = {
    name: 'Benjamin Demo',
    email: 'benja@gastoclaro.com',
    password: '123456'
};

const form = document.getElementById('loginForm');
const message = document.getElementById('loginMessage');

const isDemoCredentials = (payload) => {
    return payload.email.toLowerCase() === DEMO_USER.email && payload.password === DEMO_USER.password;
};

const saveSession = (user) => {
    localStorage.setItem('gc_current_user', JSON.stringify({
        name: user.name,
        email: user.email,
        loginAt: new Date().toISOString()
    }));
};

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    message.textContent = 'Validando credenciales...';

    const formData = new FormData(form);
    const payload = {
        email: String(formData.get('email') || '').trim(),
        password: String(formData.get('password') || '')
    };

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok) {
            message.textContent = data.message || 'No se pudo iniciar sesion.';
            return;
        }

        saveSession(data.user);
        message.textContent = `Bienvenido, ${data.user.name}. Login correcto.`;
        form.reset();

        setTimeout(() => {
            window.location.href = 'upload.html';
        }, 500);
    } catch (error) {
        if (isDemoCredentials(payload)) {
            saveSession(DEMO_USER);
            message.textContent = `Bienvenido, ${DEMO_USER.name}. Login demo correcto.`;
            form.reset();

            setTimeout(() => {
                window.location.href = 'upload.html';
            }, 500);
            return;
        }

        message.textContent = 'Credenciales invalidas. Usa demo: benja@gastoclaro.com / 123456.';
    }
});
