import { Injectable } from '@nestjs/common';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';
import * as os from 'os';

@Injectable()
export class HealthService {
  constructor(
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  checkCPU(): HealthIndicatorResult {
    const cpus = os.cpus();
    const avgLoad = os.loadavg()[0];
    const cpuCount = cpus.length;
    const cpuPressure = (avgLoad / cpuCount) * 100;

    const healthCheck = this.healthIndicatorService.check('cpu');

    if (cpuPressure < 90) {
      return healthCheck.up({
        pressure: `${cpuPressure.toFixed(2)}%`,
        cores: cpuCount,
      });
    }

    return healthCheck.down({
      pressure: `${cpuPressure.toFixed(2)}%`,
      cores: cpuCount,
    });
  }

  checkMemory(): HealthIndicatorResult {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMemPercentage = ((totalMem - freeMem) / totalMem) * 100;

    const healthCheck = this.healthIndicatorService.check('memory');

    if (usedMemPercentage < 90) {
      return healthCheck.up({
        total: `${(totalMem / 1024 / 1024 / 1024).toFixed(2)}GB`,
        free: `${(freeMem / 1024 / 1024 / 1024).toFixed(2)}GB`,
        used: `${usedMemPercentage.toFixed(2)}%`,
      });
    }

    return healthCheck.down({
      total: `${(totalMem / 1024 / 1024 / 1024).toFixed(2)}GB`,
      free: `${(freeMem / 1024 / 1024 / 1024).toFixed(2)}GB`,
      used: `${usedMemPercentage.toFixed(2)}%`,
    });
  }
}
