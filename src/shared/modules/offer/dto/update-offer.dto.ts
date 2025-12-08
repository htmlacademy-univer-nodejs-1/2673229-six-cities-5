import { HousingType, CityName, cityNames, housingTypes, conveniences, Convenience, Location } from '../../../types/index.js';
import { IsArray, IsBoolean, IsEnum, IsNumber, IsObject, IsOptional, IsString, Length, Max, Min, ArrayMinSize, ArrayMaxSize } from 'class-validator';

export class UpdateOfferDto {
  @IsOptional()
  @IsString({ message: 'title must be a string' })
  @Length(10, 100, { message: 'title length must be between 10 and 100 characters' })
  public title!: string;

  @IsOptional()
  @IsString({ message: 'description must be a string' })
  @Length(20, 1024, { message: 'description length must be between 20 and 1024 characters' })
  public description!: string;

  @IsEnum(cityNames, { message: 'city must be one of the valid cities' })
  public city!: CityName;

  @IsString({ message: 'adImage is required' })
  public adImage!: string;

  @IsOptional()
  @IsArray({ message: 'images must be an array' })
  @ArrayMinSize(6, { message: 'images must contain exactly 6 items' })
  @ArrayMaxSize(6, { message: 'images must contain exactly 6 items' })
  @IsString({ each: true, message: 'each image must be a string' })
  public images!: [string, string, string, string, string, string];

  @IsBoolean({ message: 'isPremium must be a boolean' })
  public isPremium!: boolean;

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

  @IsObject({ message: 'location must be an object' })
  public location!: Location;
}
