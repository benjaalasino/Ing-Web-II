const dotenv = require('dotenv');

dotenv.config();

module.exports = {
    port: Number(process.env.PORT || 3000),
    jwtSecret: process.env.JWT_SECRET || 'dev-only-change-this-secret',
    azureDocumentIntelligenceEndpoint: process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT,
    azureDocumentIntelligenceKey: process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY
};
