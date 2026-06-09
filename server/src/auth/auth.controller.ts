import { Controller, Get, Post, Body, UseGuards, Req, Res, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { getAdminAuth, isFirebaseAdminConfigured } from '../config/firebase-admin';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Google OAuth login entrypoint.
   * Redirects the user to Google consent screen.
   */
  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {
    // Guard redirects automatically
  }

  /**
   * Google OAuth callback.
   * Receives the user profile from Google, issues JWT, and redirects to frontend.
   */
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: any, @Res() res: any) {
    const user = req.user;
    const { access_token } = await this.authService.login(user);

    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:5173');
    // Redirect to frontend with token in hash (safer than query param)
    return res.redirect(`${frontendUrl}/login#token=${access_token}`);
  }

  /**
   * Get current authenticated user.
   */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@CurrentUser() user: any) {
    return this.usersService.findByGoogleId(user.googleId);
  }

  /**
   * Logout — mainly frontend-side, but we can invalidate token here if needed.
   */
  @Post('logout')
  @UseGuards(JwtAuthGuard)
  logout() {
    return { message: 'Sesión cerrada' };
  }

  /**
   * Firebase Auth login — verify Firebase ID token and issue JWT.
   */
  @Post('firebase')
  async firebaseLogin(@Body('idToken') idToken: string) {
    console.log('🔥 /auth/firebase called, idToken present:', !!idToken);
    
    if (!idToken) {
      throw new UnauthorizedException('Firebase ID token required');
    }

    if (!isFirebaseAdminConfigured()) {
      console.error('❌ Firebase Admin not configured');
      throw new UnauthorizedException('Firebase Admin no está configurado en el servidor. Usá el acceso de desarrollo o configurá las credenciales de Firebase.');
    }

    try {
      const auth = getAdminAuth();
      console.log('🔥 Verifying Firebase token...');
      
      // Verify Firebase ID token
      const decodedToken = await auth.verifyIdToken(idToken);
      console.log('✅ Token verified for user:', decodedToken.uid);
      
      const googleId = decodedToken.uid;
      const email = decodedToken.email || 'user@firebase.local';
      const name = decodedToken.name || 'Usuario';
      const avatarUrl = decodedToken.picture || null;

      // Find or create user
      const user = await this.usersService.findOrCreate(googleId, email, name, avatarUrl);
      console.log('✅ User found/created:', user.id);
      
      // Generate JWT
      const payload = {
        sub: googleId,
        email: user.email,
        name: user.name,
      };
      
      const access_token = this.jwtService.sign(payload);
      
      return { access_token };
    } catch (error: any) {
      console.error('❌ Firebase token verification failed:', error.message);
      console.error('❌ Error details:', error);
      throw new UnauthorizedException('Token de Firebase inválido: ' + error.message);
    }
  }

  /**
   * Dev-only login for local development without Firebase.
   */
  @Post('dev-login')
  async devLogin() {
    const isDevMode = this.configService.get<string>('NODE_ENV') !== 'production';
    if (!isDevMode) {
      throw new ForbiddenException('Dev login solo disponible en desarrollo.');
    }

    const googleId = 'dev-user-001';
    const email = 'dev@gymtracker.local';
    const name = 'Dev User';

    await this.usersService.findOrCreate(googleId, email, name);
    const token = this.jwtService.sign({ sub: googleId, email, name });
    return { access_token: token };
  }
}
