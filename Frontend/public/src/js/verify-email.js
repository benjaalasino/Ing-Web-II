(function () {
    var stateCode = document.getElementById('stateCode');
    var stateSuccess = document.getElementById('stateSuccess');
    var stateNoEmail = document.getElementById('stateNoEmail');
    var displayEmail = document.getElementById('displayEmail');
    var btnVerify = document.getElementById('btnVerify');
    var btnResend = document.getElementById('btnResend');
    var verifyMsg = document.getElementById('verifyMsg');
    var codeInputs = [
        document.getElementById('c1'), document.getElementById('c2'),
        document.getElementById('c3'), document.getElementById('c4'),
        document.getElementById('c5'), document.getElementById('c6')
    ];

    var email = new URLSearchParams(window.location.search).get('email') || '';

    function hideAll() {
        stateCode.classList.add('hidden');
        stateSuccess.classList.add('hidden');
        stateNoEmail.classList.add('hidden');
    }

    function show(el) {
        hideAll();
        el.classList.remove('hidden');
    }

    function getCode() {
        return codeInputs.map(function (i) { return i.value; }).join('');
    }

    // Auto-advance & paste support
    codeInputs.forEach(function (input, idx) {
        input.addEventListener('input', function () {
            input.value = input.value.replace(/\D/g, '').slice(0, 1);
            if (input.value && idx < 5) codeInputs[idx + 1].focus();
        });
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Backspace' && !input.value && idx > 0) {
                codeInputs[idx - 1].focus();
            }
        });
        input.addEventListener('paste', function (e) {
            e.preventDefault();
            var paste = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 6);
            for (var i = 0; i < 6; i++) {
                codeInputs[i].value = paste[i] || '';
            }
            if (paste.length > 0) codeInputs[Math.min(paste.length, 5)].focus();
        });
    });

    // Verify button
    btnVerify.addEventListener('click', async function () {
        var code = getCode();
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
                body: JSON.stringify({ email: email, code: code })
            });
            show(stateSuccess);
        } catch (err) {
            window.ui.showMessage(verifyMsg, err.message, 'error');
            btnVerify.disabled = false;
            btnVerify.textContent = 'Verificar';
        }
    });

    // Resend button
    btnResend.addEventListener('click', async function () {
        btnResend.disabled = true;
        btnResend.textContent = 'Enviando...';
        try {
            var data = await window.apiFetch('/auth/resend-verification', {
                method: 'POST',
                body: JSON.stringify({ email: email })
            });
            window.ui.showMessage(verifyMsg, data.message, 'success');
        } catch (err) {
            window.ui.showMessage(verifyMsg, err.message, 'error');
        } finally {
            btnResend.disabled = false;
            btnResend.textContent = 'Reenviar código';
        }
    });

    // Manual email entry (no email in URL)
    document.getElementById('btnSendCode').addEventListener('click', async function () {
        var manualEmail = document.getElementById('inputEmailManual').value.trim();
        var msgDiv = document.getElementById('sendCodeMsg');
        if (!manualEmail) return;

        this.disabled = true;
        this.textContent = 'Enviando...';
        try {
            var data = await window.apiFetch('/auth/resend-verification', {
                method: 'POST',
                body: JSON.stringify({ email: manualEmail })
            });
            email = manualEmail;
            displayEmail.textContent = email;
            window.ui.showMessage(msgDiv, data.message, 'success');
            setTimeout(function () { show(stateCode); }, 1200);
        } catch (err) {
            window.ui.showMessage(msgDiv, err.message, 'error');
        } finally {
            document.getElementById('btnSendCode').disabled = false;
            document.getElementById('btnSendCode').textContent = 'Enviar código';
        }
    });

    // Init
    if (email) {
        displayEmail.textContent = email;
        show(stateCode);
        codeInputs[0].focus();
    } else {
        show(stateNoEmail);
    }
})();
