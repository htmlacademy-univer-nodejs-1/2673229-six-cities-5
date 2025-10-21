import {HousingType} from './housing-type.enum.js';
import {CityName} from './city-name.enum.js';
import {Location} from './location.type.js';
import {Convenience} from './convenience.enum.js';
import {User} from './user.type.js';

export type Offer = {
  title: string;
  description: string;
  publishDate: Date;
  city: CityName;
  adImage: string;
  images: [string, string, string, string, string, string];
  isPremium: boolean;
  isFavorite: boolean;
  rating: number;
  housingType: HousingType;
  rooms: number;
  guests: number;
  price: number;
  conveniences: Convenience[];
  user: User;
  commentsCount: number;
  location: Location;
};
