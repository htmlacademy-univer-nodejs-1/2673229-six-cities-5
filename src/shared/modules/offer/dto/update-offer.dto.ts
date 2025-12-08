import { HousingType, CityName, Convenience, Location } from '../../../types/index.js';

export class UpdateOfferDto {
  public title!: string;
  public description!: string;
  public publishDate!: Date;
  public city!: CityName;
  public adImage!: string;
  public images!: [string, string, string, string, string, string];
  public isPremium!: boolean;
  public isFavorite!: boolean;
  public rating!: number;
  public housingType!: HousingType;
  public rooms!: number;
  public guests!: number;
  public price!: number;
  public conveniences!: Convenience[];
  public commentsCount: number;
  public location!: Location;
}
