import { Test, TestingModule } from '@nestjs/testing';
import { PaginationService } from './pagination.service';

describe('PaginationService', () => {
  let service: PaginationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PaginationService],
    }).compile();

    service = module.get<PaginationService>(PaginationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('buildPaginationOptions', () => {
    it('should return default pagination options when no params provided', () => {
      const result = service.buildPaginationOptions({});
      expect(result).toEqual({
        limit: 10,
        offset: 0,
      });
    });

    it('should calculate correct offset for given page and perPage', () => {
      const result = service.buildPaginationOptions({
        page: 2,
        perPage: 15,
      });
      expect(result).toEqual({
        limit: 15,
        offset: 15, // (page-1) * perPage = (2-1) * 15 = 15
      });
    });

    it('should handle negative page numbers by using default values', () => {
      const result = service.buildPaginationOptions({
        page: -1,
        perPage: 10,
      });
      expect(result).toEqual({
        limit: 10,
        offset: 0,
      });
    });
  });

  describe('buildPaginationMeta', () => {
    it('should calculate correct pagination meta for first page', () => {
      const result = service.buildPaginationMeta(1, 10, 25);
      expect(result).toEqual({
        currentPage: 1,
        from: 1,
        lastPage: 3,
        perPage: 10,
        to: 10,
        total: 25,
      });
    });

    it('should calculate correct pagination meta for last page', () => {
      const result = service.buildPaginationMeta(3, 10, 25);
      expect(result).toEqual({
        currentPage: 3,
        from: 21,
        lastPage: 3,
        perPage: 10,
        to: 25,
        total: 25,
      });
    });

    it('should handle case when total is less than perPage', () => {
      const result = service.buildPaginationMeta(1, 10, 5);
      expect(result).toEqual({
        currentPage: 1,
        from: 1,
        lastPage: 1,
        perPage: 10,
        to: 5,
        total: 5,
      });
    });

    it('should handle zero total count', () => {
      const result = service.buildPaginationMeta(1, 10, 0);
      expect(result).toEqual({
        currentPage: 1,
        from: 1,
        lastPage: 0,
        perPage: 10,
        to: 0,
        total: 0,
      });
    });
  });
});
