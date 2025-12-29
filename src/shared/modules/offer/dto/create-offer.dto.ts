import { HousingType, CityName, Convenience, Location, cityNames, housingTypes, conveniences } from '../../../types/index.js';
import { IsArray, IsBoolean, IsDateString, IsEnum, IsNumber, IsObject, IsString, Length, Max, Min, ArrayMinSize, ArrayMaxSize } from 'class-validator';


export class CreateOfferDto {
  @IsString({ message: 'title is required' })
  @Length(10, 100, { message: 'title length must be between 10 and 100 characters' })
  public title!: string;

  @IsString({ message: 'description is required' })
  @Length(20, 1024, { message: 'description length must be between 20 and 1024 characters' })
  public description!: string;

  @IsDateString({}, { message: 'publishDate must be a valid date string' })
  public publishDate!: string;

  @IsEnum(cityNames, { message: 'city must be one of the valid cities' })
  public city!: CityName;

  @IsString({ message: 'adImage is required' })
  public adImage!: string;

  @IsArray({ message: 'images must be an array' })
  @ArrayMinSize(6, { message: 'images must contain exactly 6 items' })
  @ArrayMaxSize(6, { message: 'images must contain exactly 6 items' })
  @IsString({ each: true, message: 'each image must be a string' })
  public images!: [string, string, string, string, string, string];

  @IsBoolean({ message: 'isPremium must be a boolean' })
  public isPremium!: boolean;

  @IsBoolean({ message: 'isFavorite must be a boolean' })
  public isFavorite!: boolean;

  @IsNumber({}, { message: 'rating must be a number' })
  @Min(1, { message: 'rating must be at least 1' })
  @Max(5, { message: 'rating must be at most 5' })
  public rating!: number;

  @IsEnum(housingTypes, { message: 'type must be one of: apartment, house, room, hotel' })
  public housingType!: HousingType;

  @IsNumber({}, { message: 'rooms must be a number' })
  @Min(1, { message: 'rooms must be at least 1' })
  @Max(8, { message: 'rooms must be at most 8' })
  public rooms!: number;

  @IsNumber({}, { message: 'guests must be a number' })
  @Min(1, { message: 'guests must be at least 1' })
  @Max(10, { message: 'guests must be at most 10' })
  public guests!: number;

  @IsNumber({}, { message: 'price must be a number' })
  @Min(100, { message: 'price must be at least 100' })
  @Max(100000, { message: 'price must be at most 100000' })
  public price!: number;

  @IsArray({ message: 'amenities must be an array' })
  @IsEnum(conveniences, { each: true, message: 'each amenity must be a valid amenity type' })
  public conveniences!: Convenience[];

  public userId: string;

  @IsNumber({}, { message: 'commentsCount must be a number' })
  public commentsCount: number;
  
  @IsObject({ message: 'location must be an object' })
  public location!: Location;
}
