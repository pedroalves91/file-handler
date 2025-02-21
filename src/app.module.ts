import { Module } from '@nestjs/common';
import { HealthModule } from './modules/health/health.module';
import configs from '../config/configs';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configs],
    }),
    HealthModule,
    AuthModule,
  ],
})
export class AppModule {}
