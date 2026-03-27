if (!window.auth.checkAuth()) {
    throw new Error('No autorizado');
}

window.layout.renderHeader('profile.html');

const inputProfileName = document.getElementById('inputProfileName');
const inputProfileEmail = document.getElementById('inputProfileEmail');
const inputProfileRole = document.getElementById('inputProfileRole');
const btnSaveProfile = document.getElementById('btnSaveProfile');
const profileMessage = document.getElementById('profileMessage');

const inputCurrentPassword = document.getElementById('inputCurrentPassword');
const inputNewPassword = document.getElementById('inputNewPassword');
const inputConfirmNewPassword = document.getElementById('inputConfirmNewPassword');
const btnChangePassword = document.getElementById('btnChangePassword');
const passwordMessage = document.getElementById('passwordMessage');

const show = (node, text, type) => window.ui.showMessage(node, text, type);

const loadProfile = async () => {
    const data = await window.apiFetch('/profile');
    inputProfileName.value = data.name;
    inputProfileEmail.value = data.email;
    inputProfileRole.value = data.role === 'advisor' ? 'Asesor' : 'Usuario';
};

btnSaveProfile.addEventListener('click', async () => {
    try {
        const data = await window.apiFetch('/profile', {
            method: 'PUT',
            body: JSON.stringify({
                name: inputProfileName.value.trim(),
                email: inputProfileEmail.value.trim()
            })
        });

        localStorage.setItem('userName', data.user.name);
        show(profileMessage, 'Perfil actualizado.', 'success');
        window.layout.renderHeader('profile.html');
    } catch (error) {
        show(profileMessage, error.message, 'error');
    }
});

btnChangePassword.addEventListener('click', async () => {
    if (inputNewPassword.value.length < 6) {
        show(passwordMessage, 'La nueva contraseña debe tener al menos 6 caracteres.', 'error');
        return;
    }

    if (inputNewPassword.value !== inputConfirmNewPassword.value) {
        show(passwordMessage, 'Las contraseñas no coinciden.', 'error');
        return;
    }

    try {
        await window.apiFetch('/profile', {
            method: 'PUT',
            body: JSON.stringify({
                currentPassword: inputCurrentPassword.value,
                password: inputNewPassword.value
            })
        });

        inputCurrentPassword.value = '';
        inputNewPassword.value = '';
        inputConfirmNewPassword.value = '';
        show(passwordMessage, 'Contraseña actualizada.', 'success');
    } catch (error) {
        show(passwordMessage, error.message, 'error');
    }
});

loadProfile().catch((error) => show(profileMessage, error.message, 'error'));
