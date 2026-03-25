const { analyzeWithAzureInvoiceModel } = require('../services/azureDocumentService');
const { mapExtractedInvoice } = require('../services/receiptMapperService');

const normalizeDate = (value) => {
    if (!value) {
        return null;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return value;
    }
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return null;
    }
    return date.toISOString().slice(0, 10);
};

const parseAmount = (value) => {
    if (value === null || value === undefined) {
        return null;
    }
    const numeric = Number(String(value).replace(/[^\d.,-]/g, '').replace(',', '.'));
    return Number.isFinite(numeric) ? numeric : null;
};

const uploadTicket = async (req, res) => {
    if (!req.file) {
        res.status(400).json({ statusCode: 400, message: 'Debes enviar una imagen en el campo image.' });
        return;
    }

    try {
        const analysisResult = await analyzeWithAzureInvoiceModel(req.file.buffer, req.file.mimetype);
        const extractedData = mapExtractedInvoice(analysisResult);

        res.status(201).json({
            commerce: extractedData.vendorName,
            date: normalizeDate(extractedData.invoiceDate),
            amount: parseAmount(extractedData.invoiceTotal),
            imageUrl: null
        });
    } catch (error) {
        // Fallback para entornos locales sin OCR configurado.
        res.status(201).json({
            commerce: null,
            date: null,
            amount: null,
            imageUrl: null,
            warning: 'No se pudo procesar con IA en este entorno, completa los campos manualmente.'
        });
    }
};

module.exports = {
    uploadTicket
};
