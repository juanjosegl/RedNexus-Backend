import { Module } from '@nestjs/common';
import { QueueModule } from '../queue/queue.module.js';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

@Module({
  imports: [QueueModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
