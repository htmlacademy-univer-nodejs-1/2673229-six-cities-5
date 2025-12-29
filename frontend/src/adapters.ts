import { CityLocation, CITIES, DEFAULT_IMAGE_URL, TYPES } from './const';
import type { Offer, Comment, User, NewOffer, Type as OfferType } from './types/types';
import type { CityName, Location } from './types/types';

type BackendUser = {
  email: string;
  avatarPath?: string;
  firstname: string;
  type: 'standard' | 'pro';
};

type BackendOffer = {
  id?: string;
  _id?: string;
  title: string;
  description: string;
  publishDate?: string;
  city: CityName;
  adImage: string;
  images?: string[];
  isPremium: boolean;
  isFavorite: boolean;
  rating: number;
  housingType: string;
  rooms: number;
  guests: number;
  price: number;
  conveniences: string[];
  author: BackendUser;
  commentsCount?: number;
  location: Location;
};

type BackendComment = {
  id: string;
  text: string;
  publishDate: string;
  rating: number;
  user: BackendUser;
};

export type OfferCreatePayload = {
  title: string;
  description: string;
  publishDate: string;
  city: CityName;
  adImage: string;
  images: string[];
  isPremium: boolean;
  isFavorite: boolean;
  rating: number;
  housingType: OfferType;
  rooms: number;
  guests: number;
  price: number;
  conveniences: string[];
  commentsCount: number;
  location: Location;
};

export type OfferUpdatePayload = {
  title?: string;
  description?: string;
  city: CityName;
  adImage: string;
  images: string[];
  isPremium: boolean;
  housingType: OfferType;
  rooms: number;
  guests: number;
  price: number;
  conveniences: string[];
  location: Location;
};

const getCityLocation = (city: CityName): Location =>
  CityLocation[city] ?? CityLocation[CITIES[0]];

const isOfferType = (value: string): value is OfferType =>
  TYPES.includes(value as OfferType);

const normalizeOfferType = (value: string): OfferType =>
  isOfferType(value) ? value : 'apartment';

const normalizeImageUrl = (value: string | undefined): string => {
  if (!value) {
    return DEFAULT_IMAGE_URL;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return DEFAULT_IMAGE_URL;
  }

  if (trimmed.startsWith('img/') || trimmed.startsWith('/img/')) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    const isHttp = parsed.protocol === 'http:' || parsed.protocol === 'https:';

    if (!isHttp || parsed.hostname === 'example') {
      return DEFAULT_IMAGE_URL;
    }

    return trimmed;
  } catch {
    return DEFAULT_IMAGE_URL;
  }
};

const normalizeImages = (previewImage: string, images: string[] = []): string[] => {
  const safePreview = normalizeImageUrl(previewImage);
  const source = images.length > 0 ? images.map(normalizeImageUrl) : [safePreview];
  const filled = [...source];

  while (filled.length < 6) {
    filled.push(safePreview);
  }

  return filled.slice(0, 6);
};

export const adaptUser = (user: BackendUser): User => ({
  name: user.firstname ?? '',
  avatarUrl: user.avatarPath ?? '',
  isPro: user.type === 'pro',
  email: user.email,
});

export const adaptOffer = (offer: BackendOffer): Offer => {
  const previewImage = normalizeImageUrl(offer.adImage);

  return {
    id: String(offer.id ?? offer._id ?? ''),
    price: offer.price,
    rating: offer.rating,
    title: offer.title,
    isPremium: offer.isPremium,
    isFavorite: offer.isFavorite,
    city: {
      name: offer.city,
      location: getCityLocation(offer.city),
    },
    location: offer.location,
    previewImage,
    type: normalizeOfferType(offer.housingType),
    bedrooms: offer.rooms,
    description: offer.description,
    goods: offer.conveniences,
    host: adaptUser(offer.author),
    images: normalizeImages(previewImage, offer.images ?? []),
    maxAdults: offer.guests,
  };
};

export const adaptOffers = (offers: BackendOffer[]): Offer[] =>
  offers.map(adaptOffer);

export const adaptComment = (comment: BackendComment): Comment => ({
  id: comment.id,
  comment: comment.text,
  date: comment.publishDate,
  rating: comment.rating,
  user: adaptUser(comment.user),
});

export const adaptComments = (comments: BackendComment[]): Comment[] =>
  comments.map(adaptComment);

export const adaptNewOfferToCreatePayload = (offer: NewOffer): OfferCreatePayload => {
  const previewImage = normalizeImageUrl(offer.previewImage);

  return {
    title: offer.title,
    description: offer.description,
    publishDate: new Date().toISOString(),
    city: offer.city.name,
    adImage: previewImage,
    images: normalizeImages(previewImage),
    isPremium: offer.isPremium,
    isFavorite: false,
    rating: 1,
    housingType: offer.type,
    rooms: offer.bedrooms,
    guests: offer.maxAdults,
    price: offer.price,
    conveniences: offer.goods,
    commentsCount: 0,
    location: offer.location,
  };
};

export const adaptOfferToUpdatePayload = (offer: Offer): OfferUpdatePayload => {
  const previewImage = normalizeImageUrl(offer.previewImage);

  return {
    title: offer.title,
    description: offer.description,
    city: offer.city.name,
    adImage: previewImage,
    images: normalizeImages(previewImage, offer.images),
    isPremium: offer.isPremium,
    housingType: offer.type,
    rooms: offer.bedrooms,
    guests: offer.maxAdults,
    price: offer.price,
    conveniences: offer.goods,
    location: offer.location,
  };
};

export type { BackendOffer, BackendComment };
