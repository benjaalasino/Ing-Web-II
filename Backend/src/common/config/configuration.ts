export interface AppConfig {
  port: number;
  jwtSecret: string;
  databaseUrl: string | null;
  n8nWebhookUrl: string | null;
  groqApiKey: string | null;
  appUrl: string;
}

export const configuration = (): AppConfig => ({
  port: Number(process.env.PORT || 3000),
  jwtSecret: process.env.JWT_SECRET || 'dev-only-change-this-secret',
  databaseUrl: process.env.DATABASE_URL || null,
  n8nWebhookUrl: process.env.N8N_WEBHOOK_URL || null,
  groqApiKey: process.env.GROQ_API_KEY || null,
  appUrl: process.env.APP_URL || 'http://localhost:3000',
});
