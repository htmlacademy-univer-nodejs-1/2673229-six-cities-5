import { UserType } from '../../../types/index.js';

export class UpdateUserDto {
  public avatarPath: string;
  public firstname: string;
  public type: UserType;
}
