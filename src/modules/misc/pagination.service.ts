import { Injectable } from '@nestjs/common';
@Injectable()
export class PaginationService {
  buildPaginationOptions(params: PaginatedParams): {
    limit: number;
    offset: number;
  } {
    const page = Math.abs(params?.page || 1);
    const perPage = Math.abs(params.perPage || 10);

    return {
      limit: perPage,
      offset: (page - 1) * perPage,
    };
  }

  buildPaginationMeta(
    page: number,
    perPage: number,
    totalCount: number,
  ): PaginationMeta {
    const totalPages = Math.ceil(totalCount / perPage);
    const from = (page - 1) * perPage + 1;
    const to = Math.min(page * perPage, totalCount);

    return {
      currentPage: page,
      from,
      lastPage: totalPages,
      perPage,
      to,
      total: totalCount,
    };
  }
}
