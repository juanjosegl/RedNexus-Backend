import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { HelpRequestsModule } from './modules/help-requests/help-requests.module.js';
import { MatchingModule } from './modules/matching/matching.module.js';
import { QueueModule } from './modules/queue/queue.module.js';
import { RatingsModule } from './modules/ratings/ratings.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { PrismaModule } from './prisma/prisma.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    PrismaModule,
    QueueModule,
    HealthModule,
    AuthModule,
    UsersModule,
    HelpRequestsModule,
    MatchingModule,
    RatingsModule,
  ],
})
export class AppModule {}
