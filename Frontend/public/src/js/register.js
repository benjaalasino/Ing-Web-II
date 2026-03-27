const registerForm = document.getElementById('registerForm');
const btnRegister = document.getElementById('btnRegister');
const inputName = document.getElementById('inputName');
const inputEmail = document.getElementById('inputEmail');
const inputPassword = document.getElementById('inputPassword');
const inputConfirmPassword = document.getElementById('inputConfirmPassword');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');

if (window.auth.getToken()) {
    window.location.href = window.auth.getHomeByRole(window.auth.getRole());
}

const validate = () => {
    const name = inputName.value.trim();
    const email = inputEmail.value.trim();
    const password = inputPassword.value;
    const confirm = inputConfirmPassword.value;

    if (!name || !email || !password || !confirm) {
        return 'Todos los campos son obligatorios.';
    }

    if (name.length < 2) {
        return 'El nombre debe tener al menos 2 caracteres.';
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
        return 'El email no tiene formato valido.';
    }

    if (password.length < 6) {
        return 'La contraseña debe tener al menos 6 caracteres.';
    }

    if (password !== confirm) {
        return 'Las contraseñas no coinciden.';
    }

    return null;
};

registerForm.addEventListener('input', () => window.ui.hideMessage(errorMessage));

btnRegister.addEventListener('click', async () => {
    window.ui.hideMessage(errorMessage);
    window.ui.hideMessage(successMessage);

    const validationError = validate();
    if (validationError) {
        window.ui.showMessage(errorMessage, validationError, 'error');
        return;
    }

    btnRegister.disabled = true;
    btnRegister.textContent = 'Registrando...';

    try {
        await window.apiFetch('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                name: inputName.value.trim(),
                email: inputEmail.value.trim(),
                password: inputPassword.value
            })
        });

        window.ui.showMessage(successMessage, 'Cuenta creada exitosamente. Redirigiendo...', 'success');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    } catch (error) {
        window.ui.showMessage(errorMessage, error.message, 'error');
        btnRegister.disabled = false;
        btnRegister.textContent = 'Registrarse';
    }
});
