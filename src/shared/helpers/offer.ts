import { Offer, User, isCityName, isConvenience, isHousingType, isUserType } from '../types/index.js';

export function createOffer(offerData: string): Offer {
  const [title,
    description,
    publishDate,
    city,
    adImage,
    images,
    isPremium,
    isFavorite,
    rating,
    housingType,
    rooms,
    guests,
    price,
    conveniences,
    userStr,
    commentsCount,
    cords
  ] = offerData.replace('\n','').split('\t');
  const [firstname, email, typeRaw, avatarPath] = userStr.split(' ');
  const user: User = {
    firstname,
    email,
    type: isUserType(typeRaw) ?? undefined,
    avatarPath
  };
  const [latitude, longitude] = cords.split(' ');
  return {
    title,
    description,
    publishDate: new Date(publishDate.trim()),
    city: isCityName(city) ?? 'Amsterdam',
    adImage,
    images: images.split(' ') as [string, string, string, string, string, string],
    isPremium: isPremium.toLowerCase() === 'true',
    isFavorite: isFavorite.toLowerCase() === 'true',
    rating: parseFloat(rating),
    housingType: isHousingType(housingType) ?? 'apartment',
    rooms: parseInt(rooms, 10),
    guests: parseInt(guests, 10),
    price: parseInt(price, 10),
    conveniences: conveniences.split(',').map((c) => isConvenience(c.trim()) ?? 'Fridge'),
    user,
    commentsCount: Number.parseInt(commentsCount, 10),
    location: {
      latitude: Number.parseFloat(latitude),
      longitude: Number.parseFloat(longitude)
    }
  };
}
