import { Module } from '@nestjs/common';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { LeadsModule } from './leads/leads.module';
import { AuthModule } from './auth/auth.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000, // 1 minute in milliseconds
          limit: 60,
        },
      ],
    }),
    PrismaModule,
    AuthModule,
    AiModule,
    LeadsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
