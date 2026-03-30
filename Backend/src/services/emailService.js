const { Resend } = require('resend');
const { resendApiKey, appFrom } = require('../config/env');

const resend = resendApiKey ? new Resend(resendApiKey) : null;

const sendVerificationCode = async (to, code) => {
    if (!resend) {
        console.log(`[Dev] RESEND_API_KEY not set. Verification code for ${to}: ${code}`);
        return;
    }

    console.log(`[Email] Sending verification code to ${to} from ${appFrom}`);

    const html = `${code}`;

    const { data, error } = await resend.emails.send({
        from: appFrom,
        to: [to],
        subject: `${code} — Código de verificación — Cuentas Claras`,
        html
    });

    if (error) {
        console.error(`[Email] Resend error:`, error);
        throw new Error(`Resend: ${error.message}`);
    }

    console.log(`[Email] Verification code sent to ${to} (id: ${data.id})`);
};

module.exports = { sendVerificationCode };
