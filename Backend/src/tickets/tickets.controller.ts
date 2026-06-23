import {
  Controller,
  HttpCode,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TicketsService } from './tickets.service';
import { invoiceUploadOptions } from './upload.options';

@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post('upload')
  @HttpCode(201)
  @UseInterceptors(FileInterceptor('image', invoiceUploadOptions))
  uploadTicket(@UploadedFile() file?: Express.Multer.File) {
    return this.ticketsService.uploadTicket(file);
  }
}
