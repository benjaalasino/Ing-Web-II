const dotenv = require('dotenv');

dotenv.config();

module.exports = {
    port: Number(process.env.PORT || 3000),
    jwtSecret: process.env.JWT_SECRET || 'dev-only-change-this-secret',
    databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/cuentas_claras',
    azureDocumentIntelligenceEndpoint: process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT,
    azureDocumentIntelligenceKey: process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY,
    resendApiKey: process.env.RESEND_API_KEY || '',
    appUrl: process.env.APP_URL || 'http://localhost:3000',
    appFrom: process.env.APP_FROM || 'Cuentas Claras <noreply@cuentasclaras.com>'
};
