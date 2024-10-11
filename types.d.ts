interface PaginatedLinks {
  url: string;
  label: string;
  active: boolean;
}
interface PaginatedMeta {
  currentPage: number;
  from: number;
  to: number;
  perPage: number;
  lastPage: number;
  total: number;
  path: string;
  links: PaginatedLinks[];
}
