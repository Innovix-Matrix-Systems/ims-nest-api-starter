// src/mocks/simplifiedCollectionMock.ts

import { Collection } from '@mikro-orm/core';

export function createMockCollection<T extends object>(
  items: T[] = [],
): jest.Mocked<Collection<T, any>> {
  return {
    getItems: jest.fn().mockReturnValue(items),
    count: jest.fn().mockReturnValue(items.length),
    add: jest.fn().mockImplementation((item) => {
      items.push(item);
      return items;
    }),
    remove: jest.fn().mockImplementation((item) => {
      const index = items.indexOf(item);
      if (index > -1) {
        items.splice(index, 1);
      }
      return items;
    }),
    toArray: jest.fn().mockReturnValue([...items]),
    getIdentifiers: jest
      .fn()
      .mockReturnValue(items.map((item: any) => item.id)),
    isInitialized: jest.fn().mockReturnValue(true),
    init: jest.fn().mockReturnThis(),
    load: jest.fn().mockResolvedValue(items),
    set: jest.fn().mockImplementation((newItems) => {
      items.length = 0;
      items.push(...newItems);
    }),
    // Add other methods as needed, with simple mock implementations
  } as unknown as jest.Mocked<Collection<T, any>>;
}
