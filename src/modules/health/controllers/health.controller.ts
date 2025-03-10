import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { HealthService } from '../services/health.service';
import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private healthService: HealthService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.healthService.checkCPU(),
      () => this.healthService.checkMemory(),
    ]);
  }
}
