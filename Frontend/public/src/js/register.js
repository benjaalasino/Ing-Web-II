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

btnRegister.addEventListener('click', () => {
    window.ui.hideMessage(errorMessage);
    window.ui.hideMessage(successMessage);

    const validationError = validate();
    if (validationError) {
        window.ui.showMessage(errorMessage, validationError, 'error');
        return;
    }

    window.ui.withLoading(btnRegister, 'Registrando...', 'Registrarse', async () => {
        await window.apiFetch('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                name: inputName.value.trim(),
                email: inputEmail.value.trim(),
                password: inputPassword.value
            })
        });

        showVerifyStep(inputEmail.value.trim());
    }).catch((error) => {
        window.ui.showMessage(errorMessage, error.message, 'error');
    });
});

// ── Verification step (inline) ──
var registeredEmail = '';
var verifyStep = document.getElementById('verifyStep');
var verifyEmailLabel = document.getElementById('verifyEmail');
var codeDigits = document.querySelectorAll('.code-digit');
var btnVerify = document.getElementById('btnVerify');
var btnResendCode = document.getElementById('btnResendCode');
var verifyMsg = document.getElementById('verifyMsg');

function showVerifyStep(email) {
    registeredEmail = email;
    registerForm.classList.add('hidden');
    errorMessage.classList.add('hidden');
    successMessage.classList.add('hidden');
    document.querySelector('.auth-footer').classList.add('hidden');
    document.querySelector('.section-title').textContent = 'Verificá tu email';
    verifyEmailLabel.textContent = email;
    verifyStep.classList.remove('hidden');
    codeDigits[0].focus();
}

window.ui.setupCodeDigits(codeDigits);

btnVerify.addEventListener('click', async function () {
    var code = window.ui.getCodeValue(codeDigits);
    if (code.length !== 6) {
        window.ui.showMessage(verifyMsg, 'Ingresá los 6 dígitos.', 'error');
        return;
    }
    btnVerify.disabled = true;
    btnVerify.textContent = 'Verificando...';
    window.ui.hideMessage(verifyMsg);

    try {
        await window.apiFetch('/auth/verify-email', {
            method: 'POST',
            body: JSON.stringify({ email: registeredEmail, code: code })
        });
        window.ui.showMessage(verifyMsg, 'Email verificado. Redirigiendo al login...', 'success');
        setTimeout(function () { window.location.href = 'login.html'; }, 1500);
    } catch (err) {
        window.ui.showMessage(verifyMsg, err.message, 'error');
        btnVerify.disabled = false;
        btnVerify.textContent = 'Verificar';
    }
});

btnResendCode.addEventListener('click', function () {
    window.ui.withLoading(btnResendCode, 'Enviando...', 'Reenviar', async () => {
        var data = await window.apiFetch('/auth/resend-verification', {
            method: 'POST',
            body: JSON.stringify({ email: registeredEmail })
        });
        window.ui.showMessage(verifyMsg, data.message, 'success');
    }).catch(function (err) {
        window.ui.showMessage(verifyMsg, err.message, 'error');
    });
});
