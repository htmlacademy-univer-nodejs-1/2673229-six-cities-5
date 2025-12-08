import { CreateOfferDto } from './dto/create-offer.dto.js';
import { DocumentType } from '@typegoose/typegoose';
import { OfferEntity } from './offer.entity.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';
import { CityName } from '../../types/city-name.enum.js';

export interface OfferService {
  create(dto: CreateOfferDto): Promise<DocumentType<OfferEntity>>;
  findById(offerId: string): Promise<DocumentType<OfferEntity> | null>;
  findAll(): Promise<OfferEntity[]>;
  updateById(offerId: string, dto: UpdateOfferDto): Promise<OfferEntity | null>;
  deleteById(offerId: string): Promise<number>;
  findPremiumByCity(city: CityName): Promise<OfferEntity[]>;
  incCommentCount(offerId: string): Promise<void>;
  setRating(offerId: string, rating: number): Promise<void>;
}
