import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { validate } from 'class-validator';
import { Strategy, Profile } from 'passport-google-oauth20';
import { AuthenticationService } from '../authentication.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly authService: AuthenticationService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    super({
      clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.getOrThrow<string>('GOOGLE_REDIRECT_URL'),
      scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar'],
      prompt: 'consent',
      accessType: 'offline',
      session: false,
    });
  }

  authorizationParams(): { [key: string]: string } {
    return {
      access_type: 'offline',
      prompt: 'consent',
    };
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    console.log(accessToken, refreshToken, 'from google strategy');
    console.log({
      firstName: profile._json.given_name,
      lastName: profile._json.family_name,
      userEmail: profile.emails[0].value,
    });

    const user = await this.authService.validateUser({
      firstName: profile._json.given_name,
      lastName: profile._json.family_name,
      userEmail: profile.emails[0].value,
    });

    if (user) {
      const jwt = this.jwtService.sign({
        id: user.id,
        userEmail: user.userEmail,
        role: user.role,
        accessToken,
        refreshToken,
      });
      return jwt;
    }
    return null;
  }
}
