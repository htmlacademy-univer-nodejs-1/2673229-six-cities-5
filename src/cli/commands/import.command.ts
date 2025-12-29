import { Command } from './command.interface.js';
import { TSVFileReader } from '../../shared/libs/file-reader/index.js';
import { createOffer, getErrorMessage, getMongoURI } from '../../shared/helpers/index.js';
import { UserService } from '../../shared/modules/user/user-service.interface.js';
import { OfferService } from '../../shared/modules/offer/offer-service.interface.js';
import { DatabaseClient, MongoDatabaseClient } from '../../shared/libs/database-client/index.js';
import { Logger, ConsoleLogger } from '../../shared/libs/logger/index.js';
import { DefaultUserService, UserModel } from '../../shared/modules/user/index.js';
import { DefaultOfferService, OfferModel } from '../../shared/modules/offer/index.js';
import { Offer } from '../../shared/types/index.js';
import { DEFAULT_DB_PORT, DEFAULT_USER_PASSWORD } from './command.constant.js';

export class ImportCommand implements Command {
  private userService: UserService;
  private offerService: OfferService;
  private databaseClient: DatabaseClient;
  private logger: Logger;
  private salt!: string;
  private pendingPromises: Promise<void>[] = [];

  constructor() {
    this.onImportedLine = this.onImportedLine.bind(this);
    this.onCompleteImport = this.onCompleteImport.bind(this);

    this.logger = new ConsoleLogger();
    this.offerService = new DefaultOfferService(this.logger, OfferModel);
    this.userService = new DefaultUserService(this.logger, UserModel);
    this.databaseClient = new MongoDatabaseClient(this.logger);
  }

  public getName(): string {
    return '--import';
  }

  private async onImportedLine(line: string, resolve: () => void) {
    const savePromise = this.saveOffer(createOffer(line))
      .then(() => {
        resolve();
      })
      .catch((err) => {
        console.error('Error saving offer:', getErrorMessage(err));
        resolve();
      });

    this.pendingPromises.push(savePromise);
  }

  private async onCompleteImport(count: number) {
    console.info(`${count} rows imported.`);
    if (this.pendingPromises.length > 0) {
      await Promise.allSettled(this.pendingPromises);
    }

    try {
      await this.databaseClient.disconnect();
    } catch (err) {
      console.error('Error while disconnecting from DB:', getErrorMessage(err));
    }
  }

  private async saveOffer(offer: Offer) {
    const user = await this.userService.findOrCreate({
      firstname: offer.user.firstname,
      email: offer.user.email,
      avatarPath: offer.user.avatarPath,
      password: DEFAULT_USER_PASSWORD,
      type: offer.user.type
    }, this.salt);

    await this.offerService.create({
      title: offer.title,
      description: offer.description,
      publishDate: offer.publishDate.toISOString(),
      city: offer.city,
      adImage: offer.adImage,
      images: offer.images,
      isPremium: offer.isPremium,
      isFavorite: offer.isFavorite,
      rating: offer.rating,
      housingType: offer.housingType,
      rooms: offer.rooms,
      guests: offer.guests,
      price: offer.price,
      conveniences: offer.conveniences,
      userId: user._id.toString(),
      commentsCount: offer.commentsCount,
      location: offer.location
    });
  }

  public async execute(...parameters: string[]): Promise<void> {
    const [filename, login, password, host, dbname, salt] = parameters;
    const uri = getMongoURI(login, password, host, DEFAULT_DB_PORT, dbname);
    this.salt = salt;

    await this.databaseClient.connect(uri);

    const fileReader = new TSVFileReader(filename.trim());

    fileReader.on('line', this.onImportedLine);
    fileReader.on('end', this.onCompleteImport);
    this.logger.info('Execute Import');
    try {
      await fileReader.read();
    } catch (error) {
      console.error(`Can't import data from file: ${filename}`);
      console.error(getErrorMessage(error));
    }
  }
}
