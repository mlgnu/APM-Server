import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { validate } from 'class-validator';
import { Strategy, Profile } from 'passport-google-oauth20';
import { AuthenticationService } from '../authentication.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthenticationService) {
    super({
      clientID:
        '93685604129-i25m0mp1j49oel2r75bm563hejkbn2ab.apps.googleusercontent.com',
      clientSecret: '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',
      callbackURL: 'http://localhost:3001/api/auth/google/redirect',
      scope: ['profile', 'email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile) {
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

    return user || null;
  }
}
