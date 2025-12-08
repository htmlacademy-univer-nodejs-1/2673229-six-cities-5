import { inject, injectable } from 'inversify';
import { CommentService } from './comment-service.interface.js';
import { Component } from '../../types/index.js';
import { DocumentType, types } from '@typegoose/typegoose';
import { CommentEntity } from './comment.entity.js';
import { CreateCommentDto } from './dto/create-comment.dto.js';
import { Logger } from 'pino';
import { OfferService } from '../offer/offer-service.interface.js';

@injectable()
export class DefaultCommentService implements CommentService {
  constructor(
    @inject(Component.CommentModel) private readonly commentModel: types.ModelType<CommentEntity>,
    @inject(Component.OfferService) private readonly offerService: OfferService,
    @inject(Component.Logger) private readonly logger: Logger
  ) {}

  public async create(dto: CreateCommentDto): Promise<DocumentType<CommentEntity>> {
    const comment = await this.commentModel.create(dto);
    this.offerService.incCommentCount(dto.offerId);
    this.recalculateRatingByOfferId(dto.offerId);

    this.logger.info(`New comment added for offer: ${dto.offerId}`);
    return comment.populate('userId');
  }

  public async findByOfferId(offerId: string): Promise<DocumentType<CommentEntity>[]> {
    return this.commentModel
      .find({offerId})
      .populate('userId');
  }

  public async deleteByOfferId(offerId: string): Promise<number> {
    const result = await this.commentModel
      .deleteMany({offerId})
      .exec();

    return result.deletedCount;
  }

  public async recalculateRatingByOfferId(offerId: string): Promise<void> {
    const result = await this.commentModel.aggregate([
      { $match: { offer: { $eq: offerId } } },
      {
        $group: {
          _id: null,
          avgRating: { $avg: '$rating' }
        }
      }
    ]).exec();

    const averageRating = result.length > 0 ? Math.round(result[0].avgRating * 10) / 10 : 0;
    await this.offerService.setRating(offerId, averageRating);
  }
}
