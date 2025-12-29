import { Expose, Type } from 'class-transformer';
import { UserRdo } from '../../user/rdo/user.rdo.js';

export class CommentRdo {
  @Expose()
  public id: string;

  @Expose()
  public text: string;

  @Expose({ name: 'createdAt'})
  public publishDate: Date;

  @Expose()
  public rating: number;

  @Expose({ name: 'userId'})
  @Type(() => UserRdo)
  public user: UserRdo;
}