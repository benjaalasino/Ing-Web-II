const { n8nOcrWebhookUrl } = require('../config/env');

const uploadTicket = async (req, res) => {
    if (!req.file) {
        res.status(400).json({ statusCode: 400, message: 'Debes enviar una imagen en el campo image.' });
        return;
    }

    if (!n8nOcrWebhookUrl) {
        res.status(201).json({
            commerce: null,
            date: null,
            amount: null,
            warning: 'OCR no configurado. Completa los campos manualmente.'
        });
        return;
    }

    const base64Image = req.file.buffer.toString('base64');

    const response = await fetch(n8nOcrWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            image: base64Image,
            mimeType: req.file.mimetype,
            fileName: req.file.originalname
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error del servicio OCR: ${errorText}`);
    }

    const data = await response.json();

    res.status(201).json({
        commerce: data.commerce || null,
        date: data.date || null,
        amount: data.amount != null ? Number(data.amount) : null
    });
};

module.exports = {
    uploadTicket
};
