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

/* ── MercadoPago connection ── */
const mpStatus = document.getElementById('mpStatus');
const mpMessage = document.getElementById('mpMessage');
const mpTokenForm = document.getElementById('mpTokenForm');
const inputMpToken = document.getElementById('inputMpToken');
const btnMpSaveToken = document.getElementById('btnMpSaveToken');

const renderMpStatus = async () => {
    try {
        const { connected } = await window.apiFetch('/mercadopago/status');
        if (connected) {
            mpStatus.innerHTML = `
                <p style="color:var(--primary);font-weight:600">✓ Cuenta conectada</p>
                <p style="font-size:.8rem;color:var(--muted);margin-top:.25rem">Tus gastos se registran automáticamente vía webhook.</p>
                <div style="margin-top:.75rem">
                    <button id="btnMpDisconnect" class="btn btn-secondary" type="button">Desconectar</button>
                </div>`;
            mpTokenForm.classList.add('hidden');
            document.getElementById('btnMpDisconnect').addEventListener('click', disconnectMp);
        } else {
            mpStatus.innerHTML = '';
            mpTokenForm.classList.remove('hidden');
        }
    } catch (error) {
        mpStatus.innerHTML = `<p style="color:var(--danger)">No se pudo verificar el estado.</p>`;
    }
};

btnMpSaveToken.addEventListener('click', async () => {
    const token = inputMpToken.value.trim();
    if (!token) {
        show(mpMessage, 'Ingresá tu Access Token.', 'error');
        return;
    }
    try {
        const data = await window.apiFetch('/mercadopago/connect', {
            method: 'POST',
            body: JSON.stringify({ accessToken: token })
        });
        show(mpMessage, data.message, 'success');
        inputMpToken.value = '';
        renderMpStatus();
    } catch (error) {
        show(mpMessage, error.message, 'error');
    }
});

const disconnectMp = async () => {
    try {
        await window.apiFetch('/mercadopago/disconnect', { method: 'POST' });
        show(mpMessage, 'Cuenta desconectada.', 'success');
        renderMpStatus();
    } catch (error) {
        show(mpMessage, error.message, 'error');
    }
};

renderMpStatus();
