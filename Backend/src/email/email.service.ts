import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Envia codigos de verificacion a traves de un webhook de n8n.
 * Si no hay webhook configurado, registra el codigo por consola (modo dev).
 */
@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private readonly config: ConfigService) {}

  async sendVerificationCode(to: string, code: string): Promise<void> {
    const webhookUrl = this.config.get<string | null>('n8nWebhookUrl');

    if (!webhookUrl) {
      this.logger.warn(`N8N_WEBHOOK_URL no configurada. Codigo para ${to}: ${code}`);
      return;
    }

    this.logger.log(`Enviando codigo de verificacion a ${to} via n8n`);

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, code }),
    });

    if (!res.ok) {
      const body = await res.text();
      this.logger.error(`Error del webhook n8n (${res.status}): ${body}`);
      throw new Error(`n8n webhook ${res.status}: ${body}`);
    }

    this.logger.log(`Codigo de verificacion enviado a ${to} via n8n`);
  }
}
