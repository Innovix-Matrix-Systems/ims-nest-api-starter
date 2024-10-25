import Redis from 'ioredis';

export class RedisMock implements Partial<Redis> {
  private store = new Map<string, { value: string; expireAt: number | null }>();

  get = jest.fn(async (key: string): Promise<string | null> => {
    const data = this.store.get(key);
    if (!data) return null;

    if (data.expireAt !== null && Date.now() > data.expireAt) {
      this.store.delete(key);
      return null;
    }
    return data.value;
  });

  set = jest.fn(async (key: string, value: string): Promise<'OK'> => {
    this.store.set(key, { value, expireAt: null });
    return 'OK' as const;
  });

  setex = jest.fn(
    async (key: string, ttl: number, value: string): Promise<'OK'> => {
      const expireAt = Date.now() + ttl * 1000;
      this.store.set(key, { value, expireAt });
      return 'OK' as const;
    },
  );

  del = jest.fn(async (...keys: (string | Buffer)[]): Promise<number> => {
    let count = 0;
    for (const key of keys) {
      if (this.store.delete(String(key))) {
        count++;
      }
    }
    return count;
  }) as unknown as Redis['del'];

  exists = jest.fn(async (...keys: string[]): Promise<number> => {
    let count = 0;
    for (const key of keys) {
      const data = this.store.get(key);
      if (!data) continue;

      if (data.expireAt !== null && Date.now() > data.expireAt) {
        this.store.delete(key);
        continue;
      }

      count++;
    }
    return count;
  }) as unknown as Redis['exists'];

  keys = jest.fn(async (pattern: string): Promise<string[]> => {
    const regex = new RegExp(`^${pattern.replace('*', '.*')}$`);
    return Array.from(this.store.keys()).filter((key) => regex.test(key));
  });

  ttl = jest.fn(async (key: string): Promise<number> => {
    const data = this.store.get(key);
    if (!data || data.expireAt === null) return -1;

    const ttl = Math.max(0, Math.floor((data.expireAt - Date.now()) / 1000));
    return ttl > 0 ? ttl : -2;
  });

  quit = jest.fn(async (): Promise<'OK'> => {
    return 'OK' as const;
  });

  flushall = jest.fn(async (): Promise<'OK'> => {
    this.store.clear();
    return 'OK' as const;
  });
}
