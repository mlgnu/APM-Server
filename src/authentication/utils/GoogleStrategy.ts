import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { validate } from 'class-validator';
import { Strategy, Profile } from 'passport-google-oauth20';
import { AuthenticationService } from '../authentication.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private readonly authService: AuthenticationService) {
    super({
      clientID:
        '93685604129-i25m0mp1j49oel2r75bm563hejkbn2ab.apps.googleusercontent.com',
      clientSecret: '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',
      callbackURL: 'https://apm-server.onrender.com/api/auth/google/redirect',
      scope: ['profile', 'email', 'https://www.googleapis.com/auth/calendar'],
      prompt: 'consent',
      accessType: 'offline',
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

    const userWithTokens = { ...user, accessToken, refreshToken };

    return user ? userWithTokens : null;
  }
}
