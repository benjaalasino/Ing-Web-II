import { Controller, Get } from '@nestjs/common';

/** Endpoint informativo en la raiz de la API (GET /api). */
@Controller()
export class AppController {
  @Get()
  info() {
    return {
      ok: true,
      message: 'API desplegada correctamente',
      docs: '/api/health',
    };
  }
}
