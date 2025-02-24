import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { HealthService } from '../../modules/health/services/health.service';
import { HealthIndicatorResult } from '@nestjs/terminus';

@Injectable()
export class DynamicRateLimiterMiddleware implements NestMiddleware {
  private maxRequestsPerMinute = 6; // Default rate limit
  private currentRequests = 0;
  private lastRequestTime = Date.now();

  constructor(private readonly healthService: HealthService) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const now = Date.now();

    // Reset the counter every minute
    if (now - this.lastRequestTime > 60000) {
      this.currentRequests = 0;
      this.lastRequestTime = now;
      this.adjustRateLimit();
    }

    if (this.currentRequests < this.maxRequestsPerMinute) {
      this.currentRequests++;
      this.lastRequestTime = now;
      next();
    } else {
      res.status(429).send('Too Many Requests');
    }
  }

  private adjustRateLimit(): void {
    const cpuHealth: HealthIndicatorResult = this.healthService.checkCPU();
    const memoryHealth: HealthIndicatorResult =
      this.healthService.checkMemory();

    const cpuStatus = cpuHealth.cpu.status;
    const memoryStatus = memoryHealth.memory.status;

    // If either CPU or memory is under stress (status 'down'), reduce rate limit
    if (cpuStatus === 'down' || memoryStatus === 'down') {
      this.maxRequestsPerMinute = 2;
    } else {
      this.maxRequestsPerMinute = 6;
    }
  }
}
