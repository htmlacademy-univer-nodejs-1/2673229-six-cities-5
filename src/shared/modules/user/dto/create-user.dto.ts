import { UserType } from '../../../types/index.js';

export class CreateUserDto {
  public email: string;
  public avatarPath: string;
  public firstname: string;
  public type: UserType;
  public password: string;
}
