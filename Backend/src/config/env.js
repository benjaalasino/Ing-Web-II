const dotenv = require('dotenv');

dotenv.config();

module.exports = {
    port: Number(process.env.PORT || 3000),
    jwtSecret: process.env.JWT_SECRET || 'dev-only-change-this-secret',
    databaseUrl: process.env.DATABASE_URL || null,
    n8nWebhookUrl: process.env.N8N_WEBHOOK_URL || null,
    openaiApiKey: process.env.OPENAI_API_KEY || null,
    appUrl: process.env.APP_URL || 'http://localhost:3000'
};
