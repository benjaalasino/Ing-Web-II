const loginForm = document.getElementById('loginForm');
const inputEmail = document.getElementById('inputEmail');
const inputPassword = document.getElementById('inputPassword');
const btnLogin = document.getElementById('btnLogin');
const errorMessage = document.getElementById('errorMessage');

if (window.auth.getToken()) {
    window.location.href = window.auth.getHomeByRole(window.auth.getRole());
}

loginForm.addEventListener('input', () => window.ui.hideMessage(errorMessage));

btnLogin.addEventListener('click', async () => {
    window.ui.hideMessage(errorMessage);

    btnLogin.disabled = true;
    btnLogin.textContent = 'Ingresando...';

    try {
        const data = await window.apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                email: inputEmail.value.trim(),
                password: inputPassword.value
            })
        });

        window.auth.saveAuth(data);
        window.location.href = window.auth.getHomeByRole(data.role);
    } catch (error) {
        window.ui.showMessage(errorMessage, error.message, 'error');
        btnLogin.disabled = false;
        btnLogin.textContent = 'Entrar';
    }
});
