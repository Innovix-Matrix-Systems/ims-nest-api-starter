import {
  EntityRepository,
  FilterQuery,
  OrderDefinition,
  Populate,
} from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { PaginationService } from './pagination.service';

@Injectable()
export class FilterService {
  constructor(private readonly paginationService: PaginationService) {}

  async filter<T extends object>(
    repository: EntityRepository<T>,
    params: FilterWithPaginationParams,
    validOrderFields: string[] = [],
    populate: string[] = [],
  ): Promise<PaginatedResult<T>> {
    const where = this.buildWhereClause<T>(
      params.search,
      params.searchFields,
      params.selectFields,
    );

    const orderBy = this.buildOrderOptions(
      validOrderFields,
      params.orderBy,
      params.orderDirection,
    );

    const { limit, offset } = this.paginationService.buildPaginationOptions({
      page: params.page,
      perPage: params.perPage,
    });

    const [results, totalCount] = await repository.findAndCount(where, {
      populate: populate as unknown as Populate<T>,
      limit,
      offset,
      orderBy,
    });

    const meta = this.paginationService.buildPaginationMeta(
      params.page || 1,
      params.perPage || 10,
      totalCount,
    );

    return {
      data: results,
      meta,
    };
  }

  private buildWhereClause<T>(
    search?: string,
    searchFields?: string[],
    selectFields?: Array<{ [key: string]: boolean | number | string }>,
  ): FilterQuery<T> {
    if (!search && (!selectFields || selectFields.length === 0)) {
      return {} as FilterQuery<T>;
    }

    const conditions: any[] = [];

    if (search && searchFields?.length > 0) {
      const searchConditions = searchFields.map((field) => ({
        [field]: { $ilike: `%${search}%` },
      }));
      conditions.push({ $or: searchConditions });
    }

    if (selectFields?.length > 0) {
      selectFields.forEach((field) => {
        conditions.push(field);
      });
    }

    if (conditions.length > 1) {
      return { $and: conditions } as FilterQuery<T>;
    }

    if (conditions.length === 1) {
      return conditions[0] as FilterQuery<T>;
    }

    return {} as FilterQuery<T>;
  }

  private buildOrderOptions<T>(
    validOrderFields: string[],
    orderBy?: string,
    orderDirection: 'ASC' | 'DESC' = 'ASC',
  ): OrderDefinition<T> {
    const defaultOrderField = 'createdAt';
    const defaultOrderDirection = 'ASC' as const;

    if (orderBy && validOrderFields.includes(orderBy)) {
      return { [orderBy]: orderDirection } as OrderDefinition<T>;
    }

    return { [defaultOrderField]: defaultOrderDirection } as OrderDefinition<T>;
  }
}
