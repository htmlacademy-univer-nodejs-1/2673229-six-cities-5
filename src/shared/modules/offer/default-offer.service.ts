import { inject, injectable } from 'inversify';
import { OfferService } from './offer-service.interface.js';
import { Component, SortType } from '../../types/index.js';
import { Logger } from '../../libs/logger/index.js';
import { DocumentType, types } from '@typegoose/typegoose';
import { OfferEntity } from './offer.entity.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';
import { CityName } from '../../types/index.js';

@injectable()
export class DefaultOfferService implements OfferService {
  constructor(
    @inject(Component.Logger) private readonly logger: Logger,
    @inject(Component.OfferModel) private readonly offerModel: types.ModelType<OfferEntity>
  ) {}

  public async create(dto: CreateOfferDto): Promise<DocumentType<OfferEntity>> {
    const result = await this.offerModel.create(dto);
    this.logger.info(`New offer created: ${dto.title}`);

    return result;
  }

  public async findAll(limit: number = 60): Promise<OfferEntity[]> {
    return this.offerModel
      .find()
      .limit(limit)
      .sort({ publishDate: -1 })
      .populate('userId')
      .exec();
  }

  public async findByIds(offerIds: string[]): Promise<DocumentType<OfferEntity>[]> {
    return this.offerModel
      .find({ _id: { $in: offerIds } })
      .populate('userId')
      .exec();
  }

  public async findById(offerId: string): Promise<DocumentType<OfferEntity> | null> {
    return this.offerModel.findById(offerId).populate('userId').exec();
  }

  public async updateById(offerId: string, dto: UpdateOfferDto): Promise<OfferEntity | null> {
    const result = await this.offerModel
      .findByIdAndUpdate(offerId, dto, { new: true })
      .populate('userId')
      .exec();

    if (result) {
      this.logger.info(`Offer updated: ${offerId}`);
    }

    return result;
  }

  public async deleteById(offerId: string): Promise<number> {
    const result = await this.offerModel.deleteOne({ _id: offerId }).exec();
    this.logger.info(`Offer deleted: ${offerId}`);

    return result.deletedCount;
  }

  public async incCommentCount(offerId: string): Promise<void> {
    await this.offerModel
      .findByIdAndUpdate(offerId, {'$inc': {
        commentsCount: 1,
      }}).exec();
  }

  public async findPremiumByCity(city: CityName): Promise<OfferEntity[]> {
    return this.offerModel
      .find({ city, isPremium: true })
      .limit(3)
      .sort({ publishDate: -1 })
      .populate('userId')
      .exec();
  }

  public async setRating(offerId: string, rating: number): Promise<void> {
    await this.offerModel
      .findByIdAndUpdate(offerId, { rating })
      .exec();
  }

  public async findNew(count: number): Promise<DocumentType<OfferEntity>[]> {
    return this.offerModel
      .find()
      .sort({ createdAt: SortType.Down })
      .limit(count)
      .populate(['userId', 'categories'])
      .exec();
  }

  public async findDiscussed(count: number): Promise<DocumentType<OfferEntity>[]> {
    return this.offerModel
      .find()
      .sort({ commentsCount: SortType.Down })
      .limit(count)
      .populate(['userId', 'categories'])
      .exec();
  }

  public async exists(documentId: string): Promise<boolean> {
    return (await this.offerModel.exists({ _id: documentId })) !== null;
  }
}
