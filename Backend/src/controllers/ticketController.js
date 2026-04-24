const { openaiApiKey } = require('../config/env');

const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

const uploadTicket = async (req, res) => {
    if (!req.file) {
        res.status(400).json({ statusCode: 400, message: 'Debes enviar una imagen en el campo image.' });
        return;
    }

    if (!openaiApiKey) {
        res.status(201).json({
            commerce: null,
            date: null,
            amount: null,
            warning: 'OCR no configurado. Agrega OPENAI_API_KEY en las variables de entorno.'
        });
        return;
    }

    const base64Image = req.file.buffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${base64Image}`;

    const response = await fetch(OPENAI_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiApiKey}`
        },
        body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: 'Analiza este ticket o factura y extrae: nombre del comercio (commerce), fecha en formato YYYY-MM-DD (date), y monto total numérico sin símbolos de moneda (amount). Devuelve SOLO un JSON válido con la estructura: {"commerce": "...", "date": "...", "amount": 0.0}. Si no encuentras un campo usa null.'
                        },
                        {
                            type: 'image_url',
                            image_url: { url: dataUrl }
                        }
                    ]
                }
            ],
            response_format: { type: 'json_object' },
            max_tokens: 200,
            temperature: 0.1
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error del servicio OCR: ${errorText}`);
    }

    const openaiData = await response.json();
    console.log('[OCR] OpenAI usage:', JSON.stringify(openaiData.usage));

    const text = openaiData.choices?.[0]?.message?.content;

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
        console.error('[OCR] OpenAI did not return valid JSON:', text);
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
