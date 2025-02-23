import { Module } from '@nestjs/common';
import { HealthModule } from './modules/health/health.module';
import configs from '../config/configs';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { FileModule } from './modules/files/file.module';
import { APP_GUARD } from '@nestjs/core';
import { LoggerModule } from './shared/logger/logger.module';

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configs],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 10000, // 10 seconds
        limit: 1, // 1 request per 10 seconds
      },
    ]),
    HealthModule,
    AuthModule,
    FileModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
