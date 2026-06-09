import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';

export interface GoogleProfile {
  id: string;
  emails: { value: string }[];
  name: { givenName: string; familyName?: string };
  photos?: { value: string }[];
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async validateGoogleUser(profile: GoogleProfile) {
    const googleId = profile.id;
    const email = profile.emails?.[0]?.value;
    const name = profile.name?.givenName ?? 'Usuario';
    const avatarUrl = profile.photos?.[0]?.value ?? null;

    if (!email) {
      throw new Error('Google profile missing email');
    }

    const user = await this.usersService.findOrCreate(googleId, email, name, avatarUrl);
    return user;
  }

  async login(user: { googleId: string; email: string; name: string }) {
    const payload = {
      sub: user.googleId,
      email: user.email,
      name: user.name,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
