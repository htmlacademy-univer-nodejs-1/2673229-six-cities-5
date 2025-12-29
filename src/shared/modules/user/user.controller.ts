import { inject, injectable } from 'inversify';
import { Response, Request } from 'express';
import { StatusCodes } from 'http-status-codes';
import {
  BaseController,
  HttpError,
  HttpMethod, UploadFileMiddleware,
  ValidateDtoMiddleware,
  ValidateObjectIdMiddleware,
  PrivateRouteMiddleware,
  DocumentExistsMiddleware,
} from '../../libs/rest/index.js';
import { Logger } from '../../libs/logger/index.js';
import { Component } from '../../types/index.js';
import { CreateUserRequest } from './create-user-request.type.js';
import { UserService } from './user-service.interface.js';
import { Config, RestSchema } from '../../libs/config/index.js';
import { fillDTO } from '../../helpers/index.js';
import { UserRdo } from './rdo/user.rdo.js';
import { LoginUserRequest } from './login-user-request.type.js';
import { CreateUserDto } from './dto/create-user.dto.js';
import { LoginUserDto } from './dto/login-user.dto.js';
import { AuthService } from '../auth/index.js';
import { LoggedUserRdo } from './rdo/logged-user.rdo.js';
import { OfferService } from '../offer/index.js';
import { OfferRdo } from '../offer/rdo/offer.rdo.js';


@injectable()
export class UserController extends BaseController {
  constructor(
    @inject(Component.Logger) protected readonly logger: Logger,
    @inject(Component.UserService) private readonly userService: UserService,
    @inject(Component.Config) private readonly configService: Config<RestSchema>,
    @inject(Component.AuthService) private readonly authService: AuthService,
    @inject(Component.OfferService) private readonly offerService: OfferService,
  ) {
    super(logger);
    this.logger.info('Register routes for UserController…');

    this.addRoute({
      path: '/register',
      method: HttpMethod.Post,
      handler: this.create,
      middlewares: [new ValidateDtoMiddleware(CreateUserDto)]
    });
    this.addRoute({
      path: '/login',
      method: HttpMethod.Post,
      handler: this.login,
      middlewares: [new ValidateDtoMiddleware(LoginUserDto)]
    });
    this.addRoute({
      path: '/login',
      method: HttpMethod.Get,
      handler: this.checkAuthenticate,
      middlewares: [new PrivateRouteMiddleware()]
    });
    this.addRoute({
      path: '/logout',
      method: HttpMethod.Delete,
      handler: this.logout,
      middlewares: [new PrivateRouteMiddleware()]
    });
    this.addRoute({
      path: '/:userId',
      method: HttpMethod.Get,
      handler: this.show,
      middlewares: [
        new ValidateObjectIdMiddleware('userId'),
        new DocumentExistsMiddleware(this.userService, 'User', 'userId')
      ]
    });
    this.addRoute({
      path: '/:userId/favorites',
      method: HttpMethod.Get,
      handler: this.getFavorites,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('userId')
      ]
    });
    this.addRoute({
      path: '/:userId/favorites',
      method: HttpMethod.Post,
      handler: this.addToFavorites,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('userId')
      ]
    });
    this.addRoute({
      path: '/:userId/favorites/:offerId',
      method: HttpMethod.Delete,
      handler: this.removeFromFavorites,
      middlewares: [
        new PrivateRouteMiddleware(),
        new ValidateObjectIdMiddleware('userId'),
        new ValidateObjectIdMiddleware('offerId'),
        new DocumentExistsMiddleware(this.offerService, 'Offer', 'offerId')
      ]
    });
    this.addRoute({
      path: '/:userId/avatar',
      method: HttpMethod.Post,
      handler: this.uploadAvatar,
      middlewares: [
        new ValidateObjectIdMiddleware('userId'),
        new UploadFileMiddleware(this.configService.get('UPLOAD_DIRECTORY'), 'avatar'),
      ]
    });
  }

  public async create(
    { body }: CreateUserRequest,
    res: Response,
  ): Promise<void> {
    const existsUser = await this.userService.findByEmail(body.email);

    if (existsUser) {
      throw new HttpError(
        StatusCodes.CONFLICT,
        `User with email «${body.email}» exists.`,
        'UserController'
      );
    }

    const result = await this.userService.create(body, this.configService.get('SALT'));
    this.created(res, fillDTO(UserRdo, result));
  }

	public async login(
    { body }: LoginUserRequest,
    res: Response,
  ): Promise<void> {
    const user = await this.authService.verify(body);
    const token = await this.authService.authenticate(user);
    const responseData = fillDTO(LoggedUserRdo, {
      email: user.email,
      token,
    });
    this.ok(res, responseData);
  }

  public async uploadAvatar(req: Request, res: Response) {
    this.created(res, {
      filepath: req.file?.path
    });
  }

  public async checkAuthenticate({ tokenPayload }: Request, res: Response) {
    if (!tokenPayload) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Unauthorized',
        'UserController'
      );
    }
    const foundedUser = await this.userService.findByEmail(tokenPayload.email);

    if (! foundedUser) {
      throw new HttpError(
        StatusCodes.UNAUTHORIZED,
        'Unauthorized',
        'UserController'
      );
    }

    this.ok(res, fillDTO(LoggedUserRdo, foundedUser));
  }

  public async logout(_req: Request, res: Response): Promise<void> {
    this.noContent(res, null);
  }

  public async show({ params }: Request<{ userId: string }>, res: Response): Promise<void> {
    const { userId } = params;
    const user = await this.userService.findById(userId);

    if (!user) {
      throw new HttpError(
        StatusCodes.NOT_FOUND,
        `User with id ${userId} not found.`,
        'UserController'
      );
    }

    this.ok(res, fillDTO(UserRdo, user));
  }

  public async getFavorites({ params, tokenPayload }: Request<{ userId: string }>, res: Response): Promise<void> {
    const { userId } = params;

    if (userId !== tokenPayload.id) {
      throw new HttpError(
        StatusCodes.FORBIDDEN,
        'You can only view your own favorites',
        'UserController'
      );
    }

    const favoriteIds = await this.userService.findFavorites(userId);
    const favorites = await this.offerService.findByIds(favoriteIds);
    this.ok(res, fillDTO(OfferRdo, favorites));
  }

  public async addToFavorites(
    { params, body, tokenPayload }: Request<{ userId: string }, Record<string, unknown>, { offerId: string }>,
    res: Response,
  ): Promise<void> {
    const { userId } = params;

    if (userId !== tokenPayload.id) {
      throw new HttpError(
        StatusCodes.FORBIDDEN,
        'You can only modify your own favorites',
        'UserController'
      );
    }

    await this.userService.addToFavorites(userId, body.offerId);
    this.created(res, null);
  }

  public async removeFromFavorites(
    { params, tokenPayload }: Request<{ userId: string; offerId: string }>,
    res: Response,
  ): Promise<void> {
    const { userId, offerId } = params;

    if (userId !== tokenPayload.id) {
      throw new HttpError(
        StatusCodes.FORBIDDEN,
        'You can only modify your own favorites',
        'UserController'
      );
    }

    await this.userService.removeFromFavorites(userId, offerId);
    this.noContent(res, null);
  }
}
