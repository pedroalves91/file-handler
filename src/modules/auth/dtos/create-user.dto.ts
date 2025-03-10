import { IsEmail, IsNotEmpty, IsStrongPassword } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsStrongPassword()
  @IsNotEmpty({ message: 'Password is required' })
  password: string;
}
