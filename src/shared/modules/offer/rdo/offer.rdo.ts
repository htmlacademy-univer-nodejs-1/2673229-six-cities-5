import { Expose } from 'class-transformer';
import { HousingType, CityName, Convenience, Location } from '../../../types/index.js';

export class OfferRdo {
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
  
  @Expose()
  public commentsCount: number;
  
  @Expose()
  public location!: Location;
}
