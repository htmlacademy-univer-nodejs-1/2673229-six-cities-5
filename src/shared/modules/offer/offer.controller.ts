import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import {
  BaseController,DocumentExistsMiddleware,
  HttpError,
  HttpMethod, PrivateRouteMiddleware,
  ValidateDtoMiddleware,
  ValidateObjectIdMiddleware,
} from '../../libs/rest/index.js';
import { StatusCodes } from 'http-status-codes';
import { Logger } from '../../libs/logger/index.js';
import { Component, isCityName } from '../../types/index.js';
import { OfferService } from './offer-service.interface.js';
import { fillDTO } from '../../helpers/index.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';
import { OfferRdo } from './rdo/offer.rdo.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { CommentRdo, CommentService, CreateCommentDto } from '../comment/index.js';
import { DEFAULT_DISCUSSED_OFFER_COUNT, DEFAULT_NEW_OFFER_COUNT } from './offer.constant.js';
import { CreateOfferRequest } from './type/create-offer-request.type.js';


@injectable()
export class OfferController extends BaseController{
    constructor(
        @inject(Component.Logger) protected readonly logger: Logger,
        @inject(Component.OfferService) private readonly offerService: OfferService,
        @inject(Component.CommentService) private readonly commentService: CommentService
    ){
        super(logger);

        this.logger.info('Register routes for OfferController...')

        this.addRoute({ 
            path: '/:offerId',
            method: HttpMethod.Get, 
            handler: this.show,       
            middlewares: [
                new ValidateObjectIdMiddleware('offerId'),
                new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId'),
            ]
        });
        this.addRoute({ path: '/', method: HttpMethod.Get, handler: this.index });
        this.addRoute({ 
            path: '/',
            method: HttpMethod.Post, 
            handler: this.create, 
            middlewares: [
                new ValidateDtoMiddleware(CreateOfferDto),
                new PrivateRouteMiddleware(),
            ] 
        });
        this.addRoute({ 
            path: '/:offerId', 
            method: HttpMethod.Delete, 
            handler: this.delete,       
            middlewares: [
                new PrivateRouteMiddleware(),
                new ValidateObjectIdMiddleware('offerId'),
                new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId')
            ]
        });
        this.addRoute({ 
            path: '/:offerId',
            method: HttpMethod.Patch,
            handler: this.update,
            middlewares: [
                new PrivateRouteMiddleware(),
                new ValidateObjectIdMiddleware('offerId'),
                new ValidateDtoMiddleware(UpdateOfferDto),
                new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId')
            ]
        });
        this.addRoute({       
            path: '/:offerId/comments',
            method: HttpMethod.Get,
            handler: this.getComments,
            middlewares: [
                new ValidateObjectIdMiddleware('offerId'),
                new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId'),
            ]
        });
        this.addRoute({ path: '/bundles/new', method: HttpMethod.Get, handler: this.getNew });
        this.addRoute({ path: '/bundles/discussed', method: HttpMethod.Get, handler: this.getDiscussed });
        this.addRoute({
            path: '/premium/:city',
            method: HttpMethod.Get,
            handler: this.getPremiumByCity
        });
        this.addRoute({
            path: '/:offerId/comments',
            method: HttpMethod.Post,
            handler: this.createComment,
            middlewares: [
                new PrivateRouteMiddleware(),
                new ValidateObjectIdMiddleware('offerId'),
                new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId'),
                new ValidateDtoMiddleware(CreateCommentDto)
            ]
        });
    }

    private getOfferOwnerId(offer: { userId: unknown }): string | undefined {
        const rawUserId = offer.userId as { id?: string; _id?: { toString: () => string } } | string;

        if (typeof rawUserId === 'string') {
            return rawUserId;
        }

        return rawUserId?.id ?? rawUserId?._id?.toString();
    }

    public async index(req: Request, res: Response): Promise<void> {
        const limit = req.query.limit ? Number.parseInt(String(req.query.limit), 10) : undefined;
        const offers = await this.offerService.findAll(limit);
        const responseData = fillDTO(OfferRdo, offers);
        this.ok(res, responseData);
    }

    public async create({ body, tokenPayload }: CreateOfferRequest, res: Response): Promise<void> {
        const result = await this.offerService.create({ ...body, userId: tokenPayload.id });
        const offer = await this.offerService.findById(String(result._id));
        this.created(res, fillDTO(OfferRdo, offer));
    }

    public async show({ params }: Request<{offerId: string}>, res: Response): Promise<void> {
        const { offerId } = params;
        const offer = await this.offerService.findById(offerId);

        this.ok(res, fillDTO(OfferRdo, offer));
    }

    public async delete({ params, tokenPayload }: Request<{ offerId: string }>, res: Response): Promise<void> {
        const { offerId } = params;
        const offer = await this.offerService.findById(offerId);

        if (!offer) {
            throw new HttpError(
                StatusCodes.NOT_FOUND,
                `Offer with id ${offerId} not found.`,
                'OfferController'
            );
        }

        const ownerId = this.getOfferOwnerId(offer);
        if (!ownerId || ownerId !== tokenPayload.id) {
            throw new HttpError(
                StatusCodes.FORBIDDEN,
                'You can only delete your own offers',
                'OfferController'
            );
        }

        await this.offerService.deleteById(offerId);
        await this.commentService.deleteByOfferId(offerId);
        this.noContent(res, null);
    }

    public async update(
        { body, params, tokenPayload }: Request<{ offerId: string }, Record<string, unknown>, UpdateOfferDto>,
        res: Response,
    ): Promise<void> {
        const { offerId } = params;
        const offer = await this.offerService.findById(offerId);

        if (!offer) {
            throw new HttpError(
                StatusCodes.NOT_FOUND,
                `Offer with id ${offerId} not found.`,
                'OfferController'
            );
        }

        const ownerId = this.getOfferOwnerId(offer);
        if (!ownerId || ownerId !== tokenPayload.id) {
            throw new HttpError(
                StatusCodes.FORBIDDEN,
                'You can only update your own offers',
                'OfferController'
            );
        }

        const updatedOffer = await this.offerService.updateById(offerId, body);
        this.ok(res, updatedOffer);
    }

    public async getComments({ params }: Request<{ offerId: string }>, res: Response): Promise<void> {
        const comments = await this.commentService.findByOfferId(params.offerId);
        this.ok(res, fillDTO(CommentRdo, comments));
    }

    public async getNew(_req: Request, res: Response) {
        const newOffers = await this.offerService.findNew(DEFAULT_NEW_OFFER_COUNT);
        this.ok(res, fillDTO(OfferRdo, newOffers));
    }

    public async getDiscussed(_req: Request, res: Response) {
        const discussedOffers = await this.offerService.findDiscussed(DEFAULT_DISCUSSED_OFFER_COUNT);
        this.ok(res, fillDTO(OfferRdo, discussedOffers));
    }

    public async getPremiumByCity({ params }: Request<{ city: string }>, res: Response): Promise<void> {
        const cityName = isCityName(params.city);
        if (!cityName) {
            throw new HttpError(
                StatusCodes.BAD_REQUEST,
                `Invalid city name: ${params.city}`,
                'OfferController'
            );
        }
        const premiumOffers = await this.offerService.findPremiumByCity(cityName);
        this.ok(res, fillDTO(OfferRdo, premiumOffers));
    }

    public async createComment(
        { body, params, tokenPayload }: Request<{ offerId: string }, Record<string, unknown>, CreateCommentDto>,
        res: Response,
    ): Promise<void> {
        const { offerId } = params;
        const result = await this.commentService.create({ ...body, offerId, userId: tokenPayload.id });
        this.created(res, fillDTO(CommentRdo, result));
    }
}
