const { azureDocumentIntelligenceEndpoint, azureDocumentIntelligenceKey } = require('../config/env');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const normalizeEndpoint = (endpoint) => endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;

const analyzeWithAzureInvoiceModel = async (buffer, mimeType) => {
    if (!azureDocumentIntelligenceEndpoint || !azureDocumentIntelligenceKey) {
        throw new Error('Faltan variables de entorno de Azure Document Intelligence.');
    }

    const endpoint = normalizeEndpoint(azureDocumentIntelligenceEndpoint);
    const analyzeUrl = `${endpoint}/documentintelligence/documentModels/prebuilt-invoice:analyze?api-version=2024-11-30&locale=es-AR`;

    const startResponse = await fetch(analyzeUrl, {
        method: 'POST',
        headers: {
            'Ocp-Apim-Subscription-Key': azureDocumentIntelligenceKey,
            'Content-Type': mimeType
        },
        body: buffer
    });

    if (!startResponse.ok) {
        const errorBody = await startResponse.text();
        throw new Error(`Error iniciando analisis OCR: ${errorBody}`);
    }

    const operationLocation = startResponse.headers.get('operation-location');
    if (!operationLocation) {
        throw new Error('No se recibio operation-location desde Azure.');
    }

    for (let i = 0; i < 25; i += 1) {
        await sleep(1000);

        const pollResponse = await fetch(operationLocation, {
            method: 'GET',
            headers: {
                'Ocp-Apim-Subscription-Key': azureDocumentIntelligenceKey
            }
        });

        if (!pollResponse.ok) {
            const errorBody = await pollResponse.text();
            throw new Error(`Error consultando analisis OCR: ${errorBody}`);
        }

        const result = await pollResponse.json();
        const status = String(result.status || '').toLowerCase();

        if (status === 'succeeded') {
            return result;
        }

        if (status === 'failed') {
            throw new Error('Azure no pudo procesar la factura.');
        }
    }

    throw new Error('Tiempo de espera agotado en la extraccion OCR.');
};

module.exports = {
    analyzeWithAzureInvoiceModel
};
