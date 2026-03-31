const dotenv = require('dotenv');

dotenv.config();

module.exports = {
    port: Number(process.env.PORT || 3000),
    jwtSecret: process.env.JWT_SECRET || 'dev-only-change-this-secret',
    databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:lYewpuzNXAzTfJTxkNqvgrjPkPHeNNAi@hopper.proxy.rlwy.net:25392/railway',
    n8nWebhookUrl: process.env.N8N_WEBHOOK_URL || 'https://primary-production-1bf44.up.railway.app/webhook/1792b800-adc9-4d38-a7cc-f69017532c19',
    n8nOcrWebhookUrl: process.env.N8N_OCR_WEBHOOK_URL || 'https://primary-production-1bf44.up.railway.app/webhook/8c523dec-142e-42a3-8e07-ba9b16febef3',
    appUrl: process.env.APP_URL || 'http://localhost:3000'
};
