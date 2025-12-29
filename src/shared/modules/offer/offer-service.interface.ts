import { CreateOfferDto } from './dto/create-offer.dto.js';
import { DocumentType } from '@typegoose/typegoose';
import { OfferEntity } from './offer.entity.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';
import { CityName } from '../../types/city-name.enum.js';
import { DocumentExists } from '../../types/index.js';

export interface OfferService extends DocumentExists{
  create(dto: CreateOfferDto): Promise<DocumentType<OfferEntity>>;
  findById(offerId: string): Promise<DocumentType<OfferEntity> | null>;
  findAll(limit?: number): Promise<OfferEntity[]>;
  findByIds(offerIds: string[]): Promise<DocumentType<OfferEntity>[]>;
  updateById(offerId: string, dto: UpdateOfferDto): Promise<OfferEntity | null>;
  deleteById(offerId: string): Promise<number>;
  exists(documentId: string): Promise<boolean>;
  findPremiumByCity(city: CityName): Promise<OfferEntity[]>;
  incCommentCount(offerId: string): Promise<void>;
  setRating(offerId: string, rating: number): Promise<void>;
  findNew(count: number): Promise<DocumentType<OfferEntity>[]>;
  findDiscussed(count: number): Promise<DocumentType<OfferEntity>[]>;
}
