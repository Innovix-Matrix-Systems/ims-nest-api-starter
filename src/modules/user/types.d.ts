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

interface UserPaginatedList {
  data: Partial<UserResponse>[];
  meta: PaginatedMeta;
}
