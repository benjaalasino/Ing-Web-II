import { Global, Module } from '@nestjs/common';
import { DatabaseService } from './database.service';

/**
 * Modulo global: el `DatabaseService` queda disponible para inyeccion en
 * cualquier modulo sin necesidad de reimportarlo.
 */
@Global()
@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
