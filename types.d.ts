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
  path?: string;
  links?: PaginatedLinks[];
}

interface PaginatedParams {
  page: number;
  perPage: number;
  path?: string;
  search?: string;
  searchFields?: string[];
  selectFields?: Array<{ [key: string]: boolean | number | string }>;
}

interface ValidateUserResponse {
  user: any;
  errors: string[];
}

interface LoginResponse {
  id: number;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: Date;
  device?: string;
  AccessToken: string;
}

interface JwtEncodeData {
  email: string;
  sub: number;
}
