import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckService,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  MikroOrmHealthIndicator,
} from '@nestjs/terminus';
import { RedisHealthIndicator } from './redis-health-indicator.service';

@Controller('health')
export class HealthController {
  constructor(
    private configService: ConfigService,
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private db: MikroOrmHealthIndicator,
    private disk: DiskHealthIndicator,
    private memory: MemoryHealthIndicator,
    private redis: RedisHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    const port = this.configService.get<number>('APP_PORT');
    const appUrl = this.configService.get<string>('APP_URL');
    const appUrlToPing = `${appUrl}:${port}/api/v1/ping`;
    return this.health.check([
      () => this.http.pingCheck('ims-nest', appUrlToPing),
      () => this.db.pingCheck('database'),
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),
      () => this.redis.isHealthy('redis'),
    ]);
  }
}
