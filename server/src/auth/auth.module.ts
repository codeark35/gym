import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt.strategy';
import { GoogleStrategy } from './google.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const secret = configService.get<string>('JWT_SECRET', configService.get<string>('JWT_DEV_SECRET', 'dev-secret-gymtracker'));
        return {
          secret,
          signOptions: { algorithm: 'HS256', expiresIn: '7d' },
        };
      },
      inject: [ConfigService],
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [JwtStrategy, GoogleStrategy, AuthService],
  exports: [JwtStrategy, JwtModule, AuthService],
})
export class AuthModule {}
