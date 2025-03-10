import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../../users/services/user.service';
import { CreateUserDto } from '../dtos/create-user.dto';
import { User } from '../../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../dtos/login.dto';
import { AccessToken } from '../interfaces/access-token.interface';
import { AppLogger } from '../../../shared/logger/app.logger';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    private readonly appLogger: AppLogger,
  ) {}

  async register(createUserDto: CreateUserDto): Promise<AccessToken> {
    try {
      const { email, password } = createUserDto;

      const user = await this.usersService.findByEmail(email);

      if (user) {
        throw new ConflictException('User already exists');
      }

      const hashedPassword: string = await bcrypt.hash(password, 10);

      const newUser = new User();
      newUser.email = email;
      newUser.password = hashedPassword;

      const createdUser = await this.usersService.create(newUser);

      const accessToken = this.jwtService.sign({
        id: createdUser.id,
        email: createdUser.email,
      });
      return { accessToken };
    } catch (error) {
      this.appLogger.error(error);
      throw new InternalServerErrorException('Registration failed');
    }
  }

  async login(loginDto: LoginDto): Promise<AccessToken> {
    try {
      const { email, password } = loginDto;

      const user = await this.usersService.findByEmail(email);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid password');
      }
      const accessToken = this.jwtService.sign({ id: user.id, email });

      return { accessToken };
    } catch (error) {
      this.appLogger.error(error);
      throw new InternalServerErrorException('Login failed');
    }
  }
}
