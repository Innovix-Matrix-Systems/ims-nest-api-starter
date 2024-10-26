import { InjectRedis } from '@nestjs-modules/ioredis';
import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class CacheService implements OnModuleDestroy {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  CACHE_PREFIX = 'cache:';

  CACHE_DEFAULT_TTL = 3600;

  async onModuleDestroy() {
    await this.redis.quit();
  }

  generateKey(key: string): string {
    return `${this.CACHE_PREFIX}${key}`;
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(this.generateKey(key));
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch {
      return value as T;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    key = this.generateKey(key);
    const serializedValue =
      typeof value === 'string' ? value : JSON.stringify(value);

    if (ttlSeconds) {
      await this.redis.setex(key, ttlSeconds, serializedValue);
    } else {
      await this.redis.setex(key, this.CACHE_DEFAULT_TTL, serializedValue);
    }
  }

  async del(key: string): Promise<void> {
    await this.redis.del(this.generateKey(key));
  }

  async delAll(pattern: string): Promise<void> {
    const keys = await this.redis.keys(this.generateKey(pattern));
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.redis.exists(this.generateKey(key));
    return result === 1;
  }

  async keys(pattern: string): Promise<string[]> {
    return this.redis.keys(pattern);
  }

  async ttl(key: string): Promise<number> {
    return this.redis.ttl(this.generateKey(key));
  }
}
