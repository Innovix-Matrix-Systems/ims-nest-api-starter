import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult } from '@nestjs/terminus';
import Redis from 'ioredis';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
  constructor(@InjectRedis() private readonly redis: Redis) {
    super();
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    try {
      await this.redis.ping();
      return this.getStatus(key, true);
    } catch (e) {
      return this.getStatus(key, false, { message: e.message });
    }
  }
}
