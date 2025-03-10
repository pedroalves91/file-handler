import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response } from 'express';
import { DynamicRateLimiterMiddleware } from '../../../shared/middleware/dynamic-rate-limiter.middleware';
import { HealthService } from '../../health/services/health.service';

jest.mock('../../health/services/health.service');

describe('DynamicRateLimiterMiddleware', () => {
  let middleware: DynamicRateLimiterMiddleware;
  let healthService: HealthService;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DynamicRateLimiterMiddleware,
        {
          provide: HealthService,
          useValue: { checkCPU: jest.fn(), checkMemory: jest.fn() },
        },
      ],
    }).compile();

    middleware = module.get<DynamicRateLimiterMiddleware>(
      DynamicRateLimiterMiddleware,
    );
    healthService = module.get<HealthService>(HealthService);
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };
    next = jest.fn();
  });

  it('should allow request when under normal load', () => {
    (healthService.checkCPU as jest.Mock).mockReturnValue({
      cpu: { status: 'up' },
    });
    (healthService.checkMemory as jest.Mock).mockReturnValue({
      memory: { status: 'up' },
    });

    middleware.use(req as Request, res as Response, next);

    expect(next).toHaveBeenCalled();
  });

  it('should throttle request when CPU or memory is under stress', () => {
    (healthService.checkCPU as jest.Mock).mockReturnValue({
      cpu: { status: 'down' },
    });
    (healthService.checkMemory as jest.Mock).mockReturnValue({
      memory: { status: 'up' },
    });

    for (let i = 0; i < 10; i++) {
      middleware.use(req as Request, res as Response, next);
    }

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.send).toHaveBeenCalledWith('Too Many Requests');
  });
});
