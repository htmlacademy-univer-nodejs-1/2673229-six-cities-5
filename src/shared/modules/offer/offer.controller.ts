import { inject, injectable } from 'inversify';
import { Request, Response } from 'express';
import {
  BaseController,DocumentExistsMiddleware,
  HttpMethod, PrivateRouteMiddleware,
  ValidateDtoMiddleware,
  ValidateObjectIdMiddleware,
} from '../../libs/rest/index.js';
import { Logger } from '../../libs/logger/index.js';
import { Component } from '../../types/index.js';
import { OfferService } from './offer-service.interface.js';
import { fillDTO } from '../../helpers/index.js';
import { UpdateOfferDto } from './dto/update-offer.dto.js';
import { OfferRdo } from './rdo/offer.rdo.js';
import { CreateOfferDto } from './dto/create-offer.dto.js';
import { CommentRdo, CommentService } from '../comment/index.js';
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
            handler: this.show as any,       
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
            handler: this.delete as any,       
            middlewares: [
                new PrivateRouteMiddleware(),
                new ValidateObjectIdMiddleware('offerId'),
                new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId')
            ]
        });
        this.addRoute({ 
            path: '/:offerId',
            method: HttpMethod.Patch,
            handler: this.update as any,
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
            handler: this.getComments as any,
            middlewares: [
                new ValidateObjectIdMiddleware('offerId'),
                new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId'),
            ]
        });
        this.addRoute({ path: '/bundles/new', method: HttpMethod.Get, handler: this.getNew });
        this.addRoute({ path: '/bundles/discussed', method: HttpMethod.Get, handler: this.getDiscussed });
    }

    public async index(_req: Request, res: Response): Promise<void> {
        const offers = await this.offerService.findAll();
        const responseData = fillDTO(OfferRdo, offers);
        this.ok(res, responseData);
    }

    public async create({ body, tokenPayload }: CreateOfferRequest, res: Response): Promise<void> {
        const result = await this.offerService.create({ ...body, userId: tokenPayload.id });
        const offer = await this.offerService.findById(result.id);
        this.created(res, fillDTO(OfferRdo, offer));
    }

    public async show({ params }: Request<{offerId: string}>, res: Response): Promise<void> {
        const { offerId } = params;
        const offer = await this.offerService.findById(offerId);

        this.ok(res, fillDTO(OfferRdo, offer));
    }

    public async delete({ params }: Request<{ offerId: string }>, res: Response): Promise<void> {
        const { offerId } = params;
        const offer = await this.offerService.deleteById(offerId);

        await this.commentService.deleteByOfferId(offerId);
        this.noContent(res, offer);
    }

    public async update(
        { body, params }: Request<{ offerId: string }, Record<string, unknown>, UpdateOfferDto>,
        res: Response,
    ): Promise<void> {
        const { offerId } = params;
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
}