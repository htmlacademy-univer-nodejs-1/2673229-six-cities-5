import { UserType, userTypes } from '../../../types/index.js';
import { IsEmail, IsString, Length, IsOptional,IsEnum } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'email must be a valid email address' })
  public email: string;

  @IsOptional()
  @IsString({ message: 'avatarPath must be a string' })
  public avatarPath: string;

  @IsString({ message: 'name is required' })
  @Length(1, 15, { message: 'name length must be between 1 and 15 characters' })
  public firstname: string;

  @IsEnum(userTypes, { message: 'type must be one of: default, pro' })
  public type: UserType;

  @IsString({ message: 'password is required' })
  @Length(6, 12, { message: 'password length must be between 6 and 12 characters'})
  public password: string;
}
