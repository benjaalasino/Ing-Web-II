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

    // Auto-advance & paste support
    window.ui.setupCodeDigits(codeInputs);

    // Verify button
    btnVerify.addEventListener('click', async function () {
        var code = window.ui.getCodeValue(codeInputs);
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
    btnResend.addEventListener('click', function () {
        window.ui.withLoading(btnResend, 'Enviando...', 'Reenviar código', async function () {
            var data = await window.apiFetch('/auth/resend-verification', {
                method: 'POST',
                body: JSON.stringify({ email: email })
            });
            window.ui.showMessage(verifyMsg, data.message, 'success');
        }).catch(function (err) {
            window.ui.showMessage(verifyMsg, err.message, 'error');
        });
    });

    // Manual email entry (no email in URL)
    document.getElementById('btnSendCode').addEventListener('click', function () {
        var manualEmail = document.getElementById('inputEmailManual').value.trim();
        var msgDiv = document.getElementById('sendCodeMsg');
        if (!manualEmail) return;

        window.ui.withLoading(document.getElementById('btnSendCode'), 'Enviando...', 'Enviar código', async function () {
            var data = await window.apiFetch('/auth/resend-verification', {
                method: 'POST',
                body: JSON.stringify({ email: manualEmail })
            });
            email = manualEmail;
            displayEmail.textContent = email;
            window.ui.showMessage(msgDiv, data.message, 'success');
            setTimeout(function () { show(stateCode); }, 1200);
        }).catch(function (err) {
            window.ui.showMessage(document.getElementById('sendCodeMsg'), err.message, 'error');
        });
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
