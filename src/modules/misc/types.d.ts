interface FilterParams {
  search?: string;
  searchFields?: string[];
  selectFields?: Array<{ [key: string]: boolean | number | string }>;
  orderBy?: string;
  orderDirection?: 'ASC' | 'DESC';
}

interface PaginatedParams {
  page?: number;
  perPage?: number;
  path?: string;
}

interface FilterWithPaginationParams extends PaginatedParams, FilterParams {}

interface PaginationMeta {
  currentPage: number;
  from: number;
  lastPage: number;
  perPage: number;
  to: number;
  total: number;
}

interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

interface PaginationLinks {
  url: string;
  label: string;
  active: boolean;
}
interface PaginationMetaWithLinks extends PaginationMeta {
  path?: string;
  links?: PaginationLinks[];
}
