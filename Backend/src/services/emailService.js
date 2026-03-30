const { n8nWebhookUrl } = require('../config/env');

const sendVerificationCode = async (to, code) => {
    if (!n8nWebhookUrl) {
        console.log(`[Dev] N8N_WEBHOOK_URL not set. Verification code for ${to}: ${code}`);
        return;
    }

    console.log(`[Email] Sending verification code to ${to} via n8n`);

    const res = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, code })
    });

    if (!res.ok) {
        const body = await res.text();
        console.error(`[Email] n8n webhook error (${res.status}):`, body);
        throw new Error(`n8n webhook ${res.status}: ${body}`);
    }

    console.log(`[Email] Verification code sent to ${to} via n8n`);
};

module.exports = { sendVerificationCode };
