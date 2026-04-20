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

    const rawText = await response.text();
    console.log('[OCR] n8n raw response:', rawText);

    let data;
    try {
        data = JSON.parse(rawText);
    } catch {
        console.error('[OCR] n8n did not return valid JSON:', rawText);
        res.status(201).json({
            commerce: null,
            date: null,
            amount: null,
            warning: 'La respuesta del OCR no es válida. Completa los campos manualmente.'
        });
        return;
    }

    // n8n puede devolver un array o un objeto
    const item = Array.isArray(data) ? data[0] : data;
    console.log('[OCR] Parsed item:', JSON.stringify(item));

    res.status(201).json({
        commerce: item.commerce || null,
        date: item.date || null,
        amount: item.amount != null ? Number(item.amount) : null
    });
};

module.exports = {
    uploadTicket
};
