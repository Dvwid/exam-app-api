import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserDto } from '../dtos/User.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  public login(@Body() body: Pick<UserDto, 'email' | 'password'>) {
    return this.authService.login(body.email, body.password);
  }

  @Post('register')
  public register(@Body() body: Omit<UserDto, 'id'>) {
    return this.authService.register(body);
  }

  @Post('verify')
  public verify(@Body() token: { token: string }) {
    return this.authService.authByJWT(token);
  }
}
