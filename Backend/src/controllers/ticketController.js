const { geminiApiKey } = require('../config/env');

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent';

const uploadTicket = async (req, res) => {
    if (!req.file) {
        res.status(400).json({ statusCode: 400, message: 'Debes enviar una imagen en el campo image.' });
        return;
    }

    if (!geminiApiKey) {
        res.status(201).json({
            commerce: null,
            date: null,
            amount: null,
            warning: 'OCR no configurado. Agrega GEMINI_API_KEY en las variables de entorno.'
        });
        return;
    }

    const base64Image = req.file.buffer.toString('base64');

    const response = await fetch(`${GEMINI_URL}?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{
                parts: [
                    {
                        text: 'Analiza este ticket o factura y extrae: nombre del comercio (commerce), fecha en formato YYYY-MM-DD (date), y monto total numérico sin símbolos de moneda (amount). Devuelve SOLO un JSON válido con la estructura: {"commerce": "...", "date": "...", "amount": 0.0}. Si no encuentras un campo usa null.'
                    },
                    {
                        inline_data: {
                            mime_type: req.file.mimetype,
                            data: base64Image
                        }
                    }
                ]
            }],
            generationConfig: {
                temperature: 0.1,
                responseMimeType: 'application/json'
            }
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error del servicio OCR: ${errorText}`);
    }

    const geminiData = await response.json();
    console.log('[OCR] Gemini finish reason:', geminiData.candidates?.[0]?.finishReason);

    const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
        res.status(201).json({
            commerce: null,
            date: null,
            amount: null,
            warning: 'No se pudo procesar la imagen. Completa los campos manualmente.'
        });
        return;
    }

    let data;
    try {
        data = JSON.parse(text);
    } catch {
        console.error('[OCR] Gemini did not return valid JSON:', text);
        res.status(201).json({
            commerce: null,
            date: null,
            amount: null,
            warning: 'La respuesta del OCR no es válida. Completa los campos manualmente.'
        });
        return;
    }

    console.log('[OCR] Parsed data:', JSON.stringify(data));

    res.status(201).json({
        commerce: data.commerce || null,
        date: data.date || null,
        amount: data.amount != null ? Number(data.amount) : null
    });
};

module.exports = { uploadTicket };
