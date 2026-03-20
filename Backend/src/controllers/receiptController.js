const { analyzeWithAzureInvoiceModel } = require('../services/azureDocumentService');
const { mapExtractedInvoice } = require('../services/receiptMapperService');

const extractReceiptData = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ message: 'Debes enviar una imagen en el campo invoiceImage.' });
            return;
        }

        const analysisResult = await analyzeWithAzureInvoiceModel(req.file.buffer, req.file.mimetype);
        const extractedData = mapExtractedInvoice(analysisResult);
        const rawText = analysisResult.analyzeResult && analysisResult.analyzeResult.content
            ? analysisResult.analyzeResult.content
            : '';

        res.json({
            extractedData,
            rawText
        });
    } catch (error) {
        res.status(500).json({ message: error.message || 'No se pudo extraer la factura.' });
    }
};

module.exports = {
    extractReceiptData
};
