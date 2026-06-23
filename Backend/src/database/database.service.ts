import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, QueryResult, QueryResultRow } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { seedDatabase } from './seed';

/**
 * Encapsula el acceso a PostgreSQL mediante un pool de `pg`.
 *
 * Centraliza la conexion, la inicializacion del esquema y la carga de datos
 * demo, exponiendo un unico metodo `query` que utilizan los servicios de cada
 * modulo. Asi la logica de negocio no conoce los detalles del driver.
 */
@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private readonly pool: Pool;
  private readonly databaseUrl: string | null;

  constructor(private readonly config: ConfigService) {
    this.databaseUrl = this.config.get<string | null>('databaseUrl') ?? null;
    this.pool = new Pool({
      connectionString: this.databaseUrl ?? undefined,
      ssl: this.databaseUrl && this.databaseUrl.includes('railway')
        ? { rejectUnauthorized: false }
        : undefined,
    });
  }

  async onModuleInit(): Promise<void> {
    await this.initDb();
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }

  query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params: unknown[] = [],
  ): Promise<QueryResult<T>> {
    return this.pool.query<T>(text, params as never[]);
  }

  private resolveSchemaPath(): string {
    const candidates = [
      path.join(__dirname, 'schema.sql'),
      path.resolve(process.cwd(), 'src/database/schema.sql'),
      path.resolve(process.cwd(), 'dist/database/schema.sql'),
    ];
    const found = candidates.find((candidate) => fs.existsSync(candidate));
    if (!found) {
      throw new Error('No se encontro schema.sql para inicializar la base de datos.');
    }
    return found;
  }

  private async initDb(): Promise<void> {
    const schemaSql = fs.readFileSync(this.resolveSchemaPath(), 'utf8');

    try {
      await this.pool.query(schemaSql);
      await seedDatabase(this.pool);
      this.logger.log('Esquema de base de datos listo.');
    } catch (error) {
      if ((error as { code?: string })?.code === '3D000') {
        await this.ensureDatabaseExists();
        await this.pool.query(schemaSql);
        await seedDatabase(this.pool);
        this.logger.log('Esquema de base de datos listo.');
        return;
      }
      throw error;
    }
  }

  private async ensureDatabaseExists(): Promise<void> {
    if (!this.databaseUrl) {
      throw new Error('DATABASE_URL no esta configurada.');
    }

    const dbUrl = new URL(this.databaseUrl);
    const dbName = dbUrl.pathname.replace(/^\//, '');

    if (!dbName || !/^[a-zA-Z0-9_]+$/.test(dbName)) {
      throw new Error('DATABASE_URL invalida: nombre de base no valido.');
    }

    const adminUrl = new URL(this.databaseUrl);
    adminUrl.pathname = '/postgres';

    const adminPool = new Pool({
      connectionString: adminUrl.toString(),
      ssl: this.databaseUrl.includes('railway') ? { rejectUnauthorized: false } : undefined,
    });

    try {
      const { rows } = await adminPool.query('SELECT 1 FROM pg_database WHERE datname = $1', [
        dbName,
      ]);
      if (rows.length === 0) {
        await adminPool.query(`CREATE DATABASE ${dbName}`);
        this.logger.log(`Base de datos creada: ${dbName}`);
      }
    } finally {
      await adminPool.end();
    }
  }
}
