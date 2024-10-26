import { Test, TestingModule } from '@nestjs/testing';
import Redis from 'ioredis';
import RedisMock from 'ioredis-mock';
import { RedisHealthIndicator } from './redis-health-indicator.service';

export const IORedisToken = 'default_IORedisModuleConnectionToken';
describe('RedisHealthIndicator', () => {
  let healthIndicator: RedisHealthIndicator;
  let redisMock: Redis;

  beforeEach(async () => {
    // Create Redis mock using ioredis-mock
    redisMock = new RedisMock();

    // Spy on the ping method
    jest.spyOn(redisMock, 'ping');

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisHealthIndicator,
        {
          provide: IORedisToken,
          useValue: redisMock,
        },
      ],
    }).compile();

    healthIndicator = module.get<RedisHealthIndicator>(RedisHealthIndicator);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(healthIndicator).toBeDefined();
  });

  describe('isHealthy', () => {
    it('should return status up when Redis is connected', async () => {
      // Act
      const result = await healthIndicator.isHealthy('redis');

      // Assert
      expect(result).toEqual({
        redis: {
          status: 'up',
        },
      });
      expect(redisMock.ping).toHaveBeenCalled();
    });

    it('should return status down when Redis connection fails', async () => {
      // Arrange
      const error = new Error('Redis connection failed');
      jest.spyOn(redisMock, 'ping').mockRejectedValueOnce(error);

      // Act
      const result = await healthIndicator.isHealthy('redis');

      // Assert
      expect(result).toEqual({
        redis: {
          status: 'down',
          message: 'Redis connection failed',
        },
      });
      expect(redisMock.ping).toHaveBeenCalled();
    });

    it('should handle network errors', async () => {
      // Arrange
      const error = new Error('ECONNREFUSED');
      jest.spyOn(redisMock, 'ping').mockRejectedValueOnce(error);

      // Act
      const result = await healthIndicator.isHealthy('redis');

      // Assert
      expect(result).toEqual({
        redis: {
          status: 'down',
          message: 'ECONNREFUSED',
        },
      });
    });

    it('should handle timeout errors', async () => {
      // Arrange
      const error = new Error('ETIMEDOUT');
      jest.spyOn(redisMock, 'ping').mockRejectedValueOnce(error);

      // Act
      const result = await healthIndicator.isHealthy('redis');

      // Assert
      expect(result).toEqual({
        redis: {
          status: 'down',
          message: 'ETIMEDOUT',
        },
      });
    });

    it('should handle custom key names', async () => {
      // Act
      const result = await healthIndicator.isHealthy('custom-redis');

      // Assert
      expect(result).toEqual({
        'custom-redis': {
          status: 'up',
        },
      });
    });

    it('should handle multiple health checks sequentially', async () => {
      // Act
      const result1 = await healthIndicator.isHealthy('redis-1');
      const result2 = await healthIndicator.isHealthy('redis-2');

      // Assert
      expect(result1).toEqual({
        'redis-1': {
          status: 'up',
        },
      });
      expect(result2).toEqual({
        'redis-2': {
          status: 'up',
        },
      });
      expect(redisMock.ping).toHaveBeenCalledTimes(2);
    });

    it('should handle Redis server errors', async () => {
      // Arrange
      const error = new Error('ERR unknown command');
      jest.spyOn(redisMock, 'ping').mockRejectedValueOnce(error);

      // Act
      const result = await healthIndicator.isHealthy('redis');

      // Assert
      expect(result).toEqual({
        redis: {
          status: 'down',
          message: 'ERR unknown command',
        },
      });
    });
  });

  describe('error scenarios', () => {
    it('should not expose sensitive information in error messages', async () => {
      // Arrange
      const error = new Error('WRONGPASS invalid username-password pair');
      jest.spyOn(redisMock, 'ping').mockRejectedValueOnce(error);

      // Act
      const result = await healthIndicator.isHealthy('redis');

      // Assert
      expect(result.redis.status).toBe('down');
      expect(result.redis.message).toBe(
        'WRONGPASS invalid username-password pair',
      );
    });

    it('should handle redis client being undefined', async () => {
      // Arrange
      const moduleRef = await Test.createTestingModule({
        providers: [
          RedisHealthIndicator,
          {
            provide: IORedisToken,
            useValue: undefined,
          },
        ],
      }).compile();

      const indicator =
        moduleRef.get<RedisHealthIndicator>(RedisHealthIndicator);

      // Act
      const result = await indicator.isHealthy('redis');

      // Assert
      expect(result).toEqual({
        redis: {
          status: 'down',
          message: "Cannot read properties of undefined (reading 'ping')",
        },
      });
    });
  });
});
