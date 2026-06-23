import 'reflect-metadata';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationError } from 'class-validator';
import * as fs from 'fs';
import * as path from 'path';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { resolveFrontendRoot } from './common/utils/frontend-path.util';

/** Devuelve el primer mensaje de error de validacion para mantener el
 *  formato historico de la API ({ statusCode, message }). */
const firstValidationMessage = (errors: ValidationError[]): string => {
  for (const error of errors) {
    if (error.constraints) {
      return Object.values(error.constraints)[0];
    }
    if (error.children && error.children.length > 0) {
      return firstValidationMessage(error.children);
    }
  }
  return 'Datos invalidos.';
};

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.enableCors();

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      exceptionFactory: (errors) =>
        new BadRequestException({
          statusCode: 400,
          message: firstValidationMessage(errors),
        }),
    }),
  );

  app.useGlobalFilters(new AllExceptionsFilter());

  app.setGlobalPrefix('api');

  // --- Servido del frontend estatico (fuera del prefijo /api) ---
  const frontendRoot = resolveFrontendRoot();
  if (frontendRoot) {
    app.useStaticAssets(frontendRoot);

    const frontendIndex = path.join(frontendRoot, 'pages', 'index.html');
    const server = app.getHttpAdapter().getInstance();

    server.get('/', (_req: any, res: any) => {
      if (fs.existsSync(frontendIndex)) {
        return res.redirect('/pages/index.html');
      }
      return res.status(200).json({
        ok: true,
        message: 'API desplegada correctamente',
        docs: '/api/health',
      });
    });

    // Permite acceder a las paginas como /login.html ademas de /pages/login.html
    server.get('/:page.html', (req: any, res: any, next: any) => {
      const requestedPath = path.join(frontendRoot, 'pages', `${req.params.page}.html`);
      if (fs.existsSync(requestedPath)) {
        return res.sendFile(requestedPath);
      }
      return next();
    });
  }

  const config = app.get(ConfigService);
  const port = config.get<number>('port') ?? 3000;

  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`Backend (NestJS) ejecutandose en http://localhost:${port}`);
}

bootstrap();
