import { Expose, Type, Transform } from 'class-transformer';
import { HousingType, CityName, Convenience, Location } from '../../../types/index.js';
import { UserRdo } from '../../user/rdo/user.rdo.js';

export class OfferRdo {
  @Expose()
  @Transform(({ obj }) => obj._id?.toString(), { toClassOnly: true })
  public id!: string;

  @Expose()
  public title!: string;

  @Expose()
  public description!: string;
  
  @Expose()
  public publishDate!: Date;
  
  @Expose()
  public city!: CityName;
  
  @Expose()
  public adImage!: string;
  
  @Expose()
  public images!: [string, string, string, string, string, string];
  
  @Expose()
  public isPremium!: boolean;
  
  @Expose()
  public isFavorite!: boolean;
  
  @Expose()
  public rating!: number;
  
  @Expose()
  public housingType!: HousingType;
  
  @Expose()
  public rooms!: number;
  
  @Expose()
  public guests!: number;
  
  @Expose()
  public price!: number;
  
  @Expose()
  public conveniences!: Convenience[];
  
  @Expose({ name: 'userId' })
  @Type(() => UserRdo)
  public author!: UserRdo;
  
  @Expose()
  public commentsCount: number;
  
  @Expose()
  public location!: Location;
}
