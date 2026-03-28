import { Module } from '@nestjs/common';
// import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { LeadsModule } from './leads/leads.module';
import { AuthModule } from './auth/auth.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    // Rate limiting: 60 requests per minute per IP
    // ThrottlerModule.forRoot({
    //   throttlers: [
    //     {
    //       ttl: 60000, // 1 minute in milliseconds
    //       limit: 60,
    //     },
    //   ],
    // }),
    PrismaModule,
    AuthModule,
    AiModule,
    LeadsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
