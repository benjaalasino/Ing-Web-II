import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

/**
 * Filtro global de excepciones.
 *
 * Normaliza todas las respuestas de error al formato historico de la API
 * ({ statusCode, message }) conservando campos extra que el frontend
 * necesita (por ejemplo `email`/`unverified` en el login sin verificar).
 * Los errores de carga de archivos (Multer) se traducen a HTTP 400 y
 * cualquier excepcion no controlada a HTTP 500.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let body: Record<string, unknown> = {
      statusCode: status,
      message: 'Error interno del servidor.',
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const payload = exception.getResponse();

      if (typeof payload === 'string') {
        body = { statusCode: status, message: payload };
      } else if (payload && typeof payload === 'object') {
        const { statusCode, error, message, ...rest } = payload as Record<string, unknown>;
        body = {
          statusCode: status,
          message: this.normalizeMessage(message),
          ...rest,
        };
      }
    } else if (this.isMulterError(exception)) {
      status = HttpStatus.BAD_REQUEST;
      body = {
        statusCode: status,
        message: (exception as Error).message || 'Error de carga de archivo.',
      };
    } else {
      this.logger.error(exception instanceof Error ? exception.stack : String(exception));
    }

    response.status(status).json(body);
  }

  private normalizeMessage(message: unknown): string {
    if (Array.isArray(message)) {
      return String(message[0] ?? 'Datos invalidos.');
    }
    if (typeof message === 'string') {
      return message;
    }
    return 'Datos invalidos.';
  }

  private isMulterError(exception: unknown): boolean {
    return (
      typeof exception === 'object' &&
      exception !== null &&
      (exception as { name?: string }).name === 'MulterError'
    );
  }
}
