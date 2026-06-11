import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    const secret = configService.get<string>('JWT_SECRET', configService.get<string>('JWT_DEV_SECRET', 'dev-secret-gymtracker'));

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      algorithms: ['HS256'],
    });
  }

  async validate(payload: any) {
    const googleId = payload.sub;
    if (!googleId) {
      throw new UnauthorizedException('Invalid JWT payload: sub missing');
    }

    const user = await this.usersService.findByGoogleId(googleId);
    return {
      id: user.id,
      googleId: user.googleId,
      email: user.email,
      name: user.name,
      profile: user.profile,
    };
  }
}
