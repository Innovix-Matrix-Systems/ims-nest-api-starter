interface JwtEncodeData {
  email: string;
  sub: number;
}

interface LoginResponse extends UserResponse {
  AccessToken: string;
}

interface ValidateUserResponse {
  user: Partial<UserResponse>;
  errors: string[];
}
