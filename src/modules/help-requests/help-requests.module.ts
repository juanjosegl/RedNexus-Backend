import { Module } from '@nestjs/common';
import { QueueModule } from '../queue/queue.module.js';
import { HelpRequestsController } from './help-requests.controller.js';
import { HelpRequestsService } from './help-requests.service.js';

@Module({
  imports: [QueueModule],
  controllers: [HelpRequestsController],
  providers: [HelpRequestsService],
})
export class HelpRequestsModule {}
