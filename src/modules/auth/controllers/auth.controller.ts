import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dtos/login.dto';
import { CreateUserDto } from '../dtos/create-user.dto';
import { AccessToken } from '../interfaces/access-token.interface';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/login')
  @HttpCode(HttpStatus.CREATED)
  login(@Body() login: LoginDto): Promise<AccessToken> {
    return this.authService.login(login);
  }

  @Post('/signup')
  @HttpCode(HttpStatus.CREATED)
  signup(@Body() createUserDto: CreateUserDto): Promise<AccessToken> {
    return this.authService.register(createUserDto);
  }
}
