interface DataTransformer<T, R> {
  transform(entity: T): R;
  transformMany(entities: T[]): R[];
}
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

interface JwtEncodeData {
  email: string;
  sub: number;
}

interface UserResponse {
  id: number;
  name: string;
  email: string;
  password?: string;
  device?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
  lastLoginAt?: Date;
  roles?: string[];
  permissions?: string[];
}

interface LoginResponse extends UserResponse {
  AccessToken: string;
}

interface ValidateUserResponse {
  user: Partial<UserResponse>;
  errors: string[];
}
