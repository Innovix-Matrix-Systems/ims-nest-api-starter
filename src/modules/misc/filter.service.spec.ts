import { EntityRepository } from '@mikro-orm/core';
import { Test, TestingModule } from '@nestjs/testing';
import { FilterService } from './filter.service';
import { MiscModule } from './misc.module';
import { PaginationService } from './pagination.service';

describe('FilterService', () => {
  let service: FilterService;
  let mockPaginationService: jest.Mocked<PaginationService>;
  let mockRepository: jest.Mocked<EntityRepository<any>>;

  beforeEach(async () => {
    mockRepository = {
      findAndCount: jest.fn(),
    } as any;

    mockPaginationService = {
      buildPaginationOptions: jest.fn().mockReturnValue({
        limit: 10,
        offset: 0,
      }),
      buildPaginationMeta: jest.fn().mockReturnValue({
        currentPage: 1,
        from: 1,
        lastPage: 1,
        perPage: 10,
        to: 10,
        total: 10,
      }),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      imports: [MiscModule],
      providers: [
        FilterService,
        {
          provide: PaginationService,
          useValue: mockPaginationService,
        },
      ],
    }).compile();

    service = module.get<FilterService>(FilterService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('filter', () => {
    it('should return paginated results with default parameters', async () => {
      const mockData = [{ id: 1, name: 'Test' }];
      mockRepository.findAndCount.mockResolvedValue([mockData, 1]);

      const result = await service.filter(
        mockRepository,
        {},
        ['name'],
        ['roles'],
      );

      expect(result).toEqual({
        data: mockData,
        meta: expect.any(Object),
      });
      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        {},
        expect.objectContaining({
          limit: 10,
          offset: 0,
          orderBy: { createdAt: 'ASC' },
        }),
      );
    });

    it('should apply search filters correctly', async () => {
      const mockData = [{ id: 1, name: 'Test' }];
      mockRepository.findAndCount.mockResolvedValue([mockData, 1]);

      await service.filter(
        mockRepository,
        {
          search: 'test',
          searchFields: ['name', 'email'],
        },
        ['name'],
        ['roles'],
      );

      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        {
          $or: [
            { name: { $ilike: '%test%' } },
            { email: { $ilike: '%test%' } },
          ],
        },
        expect.any(Object),
      );
    });

    it('should apply select filters correctly', async () => {
      const mockData = [{ id: 1, name: 'Test' }];
      mockRepository.findAndCount.mockResolvedValue([mockData, 1]);

      await service.filter(
        mockRepository,
        {
          selectFields: [{ status: 'active' }],
        },
        ['name'],
        ['roles'],
      );

      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        { status: 'active' },
        expect.any(Object),
      );
    });

    it('should apply ordering correctly', async () => {
      const mockData = [{ id: 1, name: 'Test' }];
      mockRepository.findAndCount.mockResolvedValue([mockData, 1]);

      await service.filter(
        mockRepository,
        {
          orderBy: 'name',
          orderDirection: 'DESC',
        },
        ['name'],
        ['roles'],
      );

      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          orderBy: { name: 'DESC' },
        }),
      );
    });

    it('should use default ordering when invalid order field is provided', async () => {
      const mockData = [{ id: 1, name: 'Test' }];
      mockRepository.findAndCount.mockResolvedValue([mockData, 1]);

      await service.filter(
        mockRepository,
        {
          orderBy: 'invalid_field',
          orderDirection: 'DESC',
        },
        ['name'],
        ['roles'],
      );

      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          orderBy: { createdAt: 'ASC' },
        }),
      );
    });

    it('should combine search and select filters with $and', async () => {
      const mockData = [{ id: 1, name: 'Test' }];
      mockRepository.findAndCount.mockResolvedValue([mockData, 1]);

      await service.filter(
        mockRepository,
        {
          search: 'test',
          searchFields: ['name'],
          selectFields: [{ status: 'active' }],
        },
        ['name'],
        ['roles'],
      );

      expect(mockRepository.findAndCount).toHaveBeenCalledWith(
        {
          $and: [
            { $or: [{ name: { $ilike: '%test%' } }] },
            { status: 'active' },
          ],
        },
        expect.any(Object),
      );
    });
  });
});
