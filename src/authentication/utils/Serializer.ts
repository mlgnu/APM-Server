import { PassportSerializer } from '@nestjs/passport';
import { AuthenticationService } from '../authentication.service';
import { User } from 'src/typeorm/User';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SessionSerializer extends PassportSerializer {
  constructor(private authService: AuthenticationService) {
    super();
  }

  serializeUser(user: User, done: Function) {
    console.log('serialize User with id: ' + user.id);
    done(null, user.id);
  }
  async deserializeUser(payload: any, done: Function) {
    console.log('deserialize user with id: ' + payload);
    const user = await this.authService.findUser(payload);
    console.log(user);
    return user ? done(null, user) : done(null, null);
  }
}
