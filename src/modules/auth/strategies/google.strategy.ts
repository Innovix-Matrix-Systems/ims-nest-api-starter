import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(configService: ConfigService) {
    const appUrl = configService.get<string>('APP_URL');
    const appPort = configService.get<string>('APP_PORT');
    const callbackURL = `${appUrl}:${appPort}/auth/google/callback`;

    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL,
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string, // important! don't remove
    refreshToken: string, // important! don't remove
    profile: GoogleProfile,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails, photos } = profile;
    const user: GoogleSimpleProfile = {
      googleId: profile?.id,
      email: emails[0]?.value,
      displayName: name?.givenName + ' ' + name?.familyName,
      picture: photos[0]?.value,
    };
    done(null, user);
  }
}
