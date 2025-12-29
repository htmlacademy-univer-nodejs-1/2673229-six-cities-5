import { defaultClasses, getModelForClass, prop, modelOptions, Ref } from '@typegoose/typegoose';
import { HousingType, CityName, Convenience, Location, cityNames, housingTypes } from '../../types/index.js';
import { UserEntity } from '../user/user.entity.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';

export interface OfferEntity extends defaultClasses.Base {}

@modelOptions({
  schemaOptions: {
    collection: 'offers'
  }
})

export class OfferEntity extends defaultClasses.TimeStamps {

  @prop({required: true})
  public title!: string;

  @prop({trim: true})
  public description!: string;

  @prop({ required: true })
  public publishDate: Date;

  @prop({
    required: true,
    type: () => String,
    enum: cityNames
  })
  public city: CityName;

  @prop({required: true})
  public adImage: string;

  @prop({required: true})
  public images: [string, string, string, string, string, string];

  @prop({required: true, default: false})
  public isPremium: boolean;

  @prop({required: true, default: false})
  public isFavorite: boolean;

  @prop({required: true, default: 1})
  public rating: number;

  @prop({
    type: () => String,
    enum: housingTypes
  })
  public housingType: HousingType;

  @prop({required: true})
  public rooms: number;

  @prop({required: true})
  public guests: number;

  @prop({required: true})
  public price: number;

  @prop({required: true, default: []})
  public conveniences: Convenience[];


  @prop({
    ref: () => UserEntity,
    required: true
  })
  public userId: Ref<UserEntity>;

  @prop({ default: 0 })
  public commentsCount: number;

  @prop({ required: true })
  public location: Location;

  constructor(offerData: CreateOfferDto) {
    super();
    this.title = offerData.title;
    this.description = offerData.description;
    this.publishDate = offerData.publishDate ? new Date(offerData.publishDate) : new Date();
    this.city = offerData.city;
    this.adImage = offerData.adImage;
    this.images = offerData.images;
    this.isPremium = offerData.isPremium ?? false;
    this.isFavorite = offerData.isFavorite ?? false;
    this.rating = offerData.rating ?? 0;
    this.housingType = offerData.housingType;
    this.rooms = offerData.rooms;
    this.guests = offerData.guests;
    this.price = offerData.price;
    this.conveniences = offerData.conveniences ?? [];
    this.location = offerData.location;
    this.commentsCount = 0;
  }

}

export const OfferModel = getModelForClass(OfferEntity);
