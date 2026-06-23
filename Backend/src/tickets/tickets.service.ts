import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct';

interface OcrResult {
  commerce: string | null;
  date: string | null;
  amount: number | null;
  warning?: string;
}

/**
 * Extrae comercio, fecha y monto de una imagen de ticket/factura usando el
 * servicio de vision de Groq. Si no hay API key configurada, responde con un
 * aviso para que el usuario complete los campos manualmente.
 */
@Injectable()
export class TicketsService {
  private readonly logger = new Logger(TicketsService.name);

  constructor(private readonly config: ConfigService) {}

  async uploadTicket(file?: Express.Multer.File): Promise<OcrResult> {
    if (!file) {
      throw new BadRequestException('Debes enviar una imagen en el campo image.');
    }

    const groqApiKey = this.config.get<string | null>('groqApiKey');
    if (!groqApiKey) {
      return {
        commerce: null,
        date: null,
        amount: null,
        warning: 'OCR no configurado. Agrega GROQ_API_KEY en las variables de entorno.',
      };
    }

    const base64Image = file.buffer.toString('base64');
    const dataUrl = `data:${file.mimetype};base64,${base64Image}`;

    const response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${groqApiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text:
                  'Analiza este ticket o factura y extrae: nombre del comercio (commerce), ' +
                  'fecha en formato YYYY-MM-DD (date), y monto total numérico sin símbolos de ' +
                  'moneda (amount). Devuelve SOLO un JSON válido con la estructura: ' +
                  '{"commerce": "...", "date": "...", "amount": 0.0}. Si no encuentras un campo usa null.',
              },
              {
                type: 'image_url',
                image_url: { url: dataUrl },
              },
            ],
          },
        ],
        response_format: { type: 'json_object' },
        max_tokens: 200,
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Error del servicio OCR: ${errorText}`);
    }

    const groqData: any = await response.json();
    this.logger.log(`Groq usage: ${JSON.stringify(groqData.usage)}`);

    const text: string | undefined = groqData.choices?.[0]?.message?.content;

    if (!text) {
      return {
        commerce: null,
        date: null,
        amount: null,
        warning: 'No se pudo procesar la imagen. Completa los campos manualmente.',
      };
    }

    let data: { commerce?: unknown; date?: unknown; amount?: unknown };
    try {
      data = JSON.parse(text);
    } catch {
      this.logger.error(`Groq no devolvio JSON valido: ${text}`);
      return {
        commerce: null,
        date: null,
        amount: null,
        warning: 'La respuesta del OCR no es válida. Completa los campos manualmente.',
      };
    }

    this.logger.log(`Datos extraidos: ${JSON.stringify(data)}`);

    return {
      commerce: (data.commerce as string) || null,
      date: (data.date as string) || null,
      amount: data.amount != null ? Number(data.amount) : null,
    };
  }
}
