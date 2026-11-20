import { Module } from '@nestjs/common';
import { PqrsController } from './pqrs.controller.js';
import { PqrsService } from './pqrs.service.js';

@Module({
  controllers: [PqrsController],
  providers: [PqrsService],
})
export class PqrsModule {}
