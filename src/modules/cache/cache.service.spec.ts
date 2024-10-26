import { Test, TestingModule } from '@nestjs/testing';
import Redis from 'ioredis';
import RedisMock from 'ioredis-mock';
import { CacheService } from './cache.service';

export const IORedisToken = 'default_IORedisModuleConnectionToken';

describe('CacheService', () => {
  let service: CacheService;
  let redisMock: Redis;
  const DEFAULT_TTL = 3600;

  beforeEach(async () => {
    redisMock = new RedisMock();
    redisMock.exists = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: IORedisToken,
          useValue: redisMock,
        },
        CacheService,
      ],
    }).compile();

    service = module.get<CacheService>(CacheService);
  });

  describe('generateKey', () => {
    it('should generate key with prefix', () => {
      const key = 'test-key';
      expect(service.generateKey(key)).toBe(`cache:${key}`);
    });
  });

  describe('get', () => {
    it('should return null when key does not exist', async () => {
      const key = 'non-existent-key';
      redisMock.get = jest.fn().mockResolvedValue(null);
      const result = await service.get(key);

      expect(result).toBeNull();
      expect(redisMock.get).toHaveBeenCalledWith(service.generateKey(key));
    });

    it('should parse and return JSON value', async () => {
      const key = 'json-key';
      const testObj = { name: 'test', value: 123 };
      redisMock.get = jest.fn().mockResolvedValue(JSON.stringify(testObj));

      const result = await service.get(key);

      expect(result).toEqual(testObj);
      expect(redisMock.get).toHaveBeenCalledWith(service.generateKey(key));
    });

    it('should return string value when not JSON', async () => {
      const key = 'string-key';
      const testString = 'test-string';
      redisMock.get = jest.fn().mockResolvedValue(testString);

      const result = await service.get(key);

      expect(result).toBe(testString);
      expect(redisMock.get).toHaveBeenCalledWith(service.generateKey(key));
    });
  });

  describe('set', () => {
    it('should set string value without TTL with default TTL', async () => {
      const key = 'string-key';
      const value = 'test-value';
      redisMock.set = jest.fn();
      redisMock.setex = jest.fn();
      await service.set(key, value);
      expect(redisMock.setex).toHaveBeenCalledWith(
        service.generateKey(key),
        DEFAULT_TTL,
        value,
      );
    });

    it('should set JSON value without TTL with default TTL', async () => {
      const key = 'json-key';
      const value = { name: 'test', value: 123 };
      redisMock.set = jest.fn();
      redisMock.setex = jest.fn();
      await service.set(key, value);
      expect(redisMock.setex).toHaveBeenCalledWith(
        service.generateKey(key),
        DEFAULT_TTL,
        JSON.stringify(value),
      );
    });

    it('should set value with TTL', async () => {
      const key = 'ttl-key';
      const value = 'test-value';
      const ttl = 1000;
      redisMock.setex = jest.fn();
      await service.set(key, value, ttl);
      expect(redisMock.setex).toHaveBeenCalledWith(
        service.generateKey(key),
        ttl,
        value,
      );
    });
  });

  describe('del', () => {
    it('should delete key', async () => {
      const key = 'test-key';
      redisMock.del = jest.fn();
      await service.del(key);
      expect(redisMock.del).toHaveBeenCalledWith(service.generateKey(key));
    });

    it('should delete all keys matching pattern', async () => {
      const pattern = 'test*';
      redisMock.keys = jest.fn().mockResolvedValue(['test1', 'test2']);
      redisMock.del = jest.fn();
      await service.delAll(pattern);
      expect(redisMock.keys).toHaveBeenCalledWith(service.generateKey(pattern));
      expect(redisMock.del).toHaveBeenCalledWith('test1', 'test2');
    });
  });

  describe('exists', () => {
    it('should return true when key exists', async () => {
      const key = 'existing-key';
      redisMock.exists = jest.fn().mockResolvedValue(1);
      const result = await service.exists(key);
      expect(result).toBe(true);
      expect(redisMock.exists).toHaveBeenCalledWith(service.generateKey(key));
    });

    it('should return false when key does not exist', async () => {
      const key = 'non-existing-key';
      redisMock.exists = jest.fn().mockResolvedValue(0);
      const result = await service.exists(key);
      expect(result).toBe(false);
      expect(redisMock.exists).toHaveBeenCalledWith(service.generateKey(key));
    });
  });

  describe('keys', () => {
    it('should return matching keys', async () => {
      const pattern = 'test*';
      const expectedKeys = ['test1', 'test2'];

      redisMock.keys = jest.fn().mockResolvedValue(expectedKeys);

      const result = await service.keys(pattern);

      expect(result).toHaveLength(expectedKeys.length);
      expect(redisMock.keys).toHaveBeenCalledWith(pattern);
    });
  });

  describe('ttl', () => {
    it('should return TTL for key', async () => {
      const key = 'test-key';
      const expectedTTL = 3600;
      redisMock.ttl = jest.fn().mockResolvedValue(expectedTTL);
      const result = await service.ttl(key);
      expect(result).toBe(expectedTTL);
      expect(redisMock.ttl).toHaveBeenCalledWith(service.generateKey(key));
    });
  });

  describe('onModuleDestroy', () => {
    it('should quit Redis connection', async () => {
      redisMock.quit = jest.fn();
      await service.onModuleDestroy();
      expect(redisMock.quit).toHaveBeenCalled();
    });
  });
});
