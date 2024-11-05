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

interface GooglePhoto {
  value: string;
}

interface GoogleEmail {
  value: string;
  verified: boolean;
}

interface GoogleName {
  familyName: string;
  givenName: string;
}

interface GoogleProfile {
  id: string;
  displayName: string;
  name: GoogleName;
  emails: GoogleEmail[];
  photos: GooglePhoto[];
  provider: 'google';
  _raw: string;
  _json: {
    sub: string;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
    email: string;
    email_verified: boolean;
  };
}

interface GoogleSimpleProfile {
  googleId: string;
  email: string;
  displayName: string;
  picture: string;
}
