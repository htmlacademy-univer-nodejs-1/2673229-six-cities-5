import dayjs from 'dayjs';
import { OfferGenerator } from './offer-generator.interface.js';
import { MockServerData, conveniences, housingTypes, cityNames, userTypes } from '../../types/index.js';
import { generateRandomValue, getRandomBoolean, getRandomItem, getRandomItems, getRandomCordPoint } from '../../helpers/index.js';
import {FIRST_WEEK_DAY, LAST_WEEK_DAY, MIN_PRICE, MAX_PRICE,
  MIN_ROOMS, MAX_ROOMS, MIN_GUESTS, MAX_GUESTS,
  MIN_RATING, MAX_RATING, MIN_COMMENTS, MAX_COMMENTS,
  IMAGES_COUNT, MAX_LAT, MAX_LON, MIN_LAT, MIN_LON, DECIMALS_CORD} from '../../constants.js';

export class TSVOfferGenerator implements OfferGenerator {
  constructor(private readonly mockData: MockServerData) {}

  public generate(): string {
    const title = getRandomItem<string>(this.mockData.titles);
    const description = getRandomItem<string>(this.mockData.descriptions);
    const createdDate = dayjs()
      .subtract(generateRandomValue(FIRST_WEEK_DAY, LAST_WEEK_DAY), 'day')
      .toISOString();
    const city = getRandomItem([...cityNames]).toString();
    const adImage = getRandomItem<string>(this.mockData.adImages);
    const [adImageName, fileExtension] = adImage.split('.');
    const images = [];
    for (let i = 0; i <= IMAGES_COUNT; i++) {
      images.push(`${adImageName}-${i}.${fileExtension}`);
    }

    const isPremium = getRandomBoolean();
    const isFavorite = getRandomBoolean();
    const rating = generateRandomValue(MIN_RATING, MAX_RATING).toString();
    const generatedHouseType = getRandomItem([...housingTypes]).toString();
    const rooms = generateRandomValue(MIN_ROOMS, MAX_ROOMS).toString();
    const guests = generateRandomValue(MIN_GUESTS, MAX_GUESTS).toString();

    const price = generateRandomValue(MIN_PRICE, MAX_PRICE).toString();

    const generatedConveniences = getRandomItems([...conveniences]);

    const userName = getRandomItem(this.mockData.users);
    const email = getRandomItem(this.mockData.emails);
    const password = getRandomItem(this.mockData.passwords);
    const userType = getRandomItem([...userTypes]);
    const avatar = getRandomItem(this.mockData.avatars);

    const user = [userName, email, password, userType, avatar].join(' ');

    const commentsCount = generateRandomValue(MIN_COMMENTS, MAX_COMMENTS).toString();

    const generatedCords = [getRandomCordPoint(MIN_LAT, MAX_LAT, DECIMALS_CORD),
      getRandomCordPoint(MIN_LON, MAX_LON, DECIMALS_CORD)
    ].join(' ');
    return [
      title, description, createdDate, city,
      adImage, images, isPremium, isFavorite, rating,
      generatedHouseType, rooms, guests, price,
      generatedConveniences, user, commentsCount, generatedCords
    ].join('\t');
  }
}
