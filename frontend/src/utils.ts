import { MAX_PERCENT_STARS_WIDTH, STARS_COUNT } from './const';

export const formatDate = (date: string) => new Intl.DateTimeFormat(
  'en-US',
  {'month':'long','year':'numeric'}
).format( new Date(date) );

export const getStarsWidth = (rating: number) =>
  `${(MAX_PERCENT_STARS_WIDTH * Math.round(rating)) / STARS_COUNT}%`;

export const getRandomElement = <T>(array: readonly T[]): T => array[Math.floor(Math.random() * array.length)];
export const pluralize = (str: string, count: number) => count === 1 ? str : `${str}s`;
export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

export class Token {
  private static _name = 'six-cities-auth-token';

  static get() {
    const token = localStorage.getItem(this._name);

    return token ?? '';
  }

  static save(token: string) {
    localStorage.setItem(this._name, token);
  }

  static drop() {
    localStorage.removeItem(this._name);
  }
}

export type TokenPayload = {
  id: string;
  email: string;
  firstname: string;
  iat?: number;
  exp?: number;
};

const decodeBase64Url = (value: string): string => {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
  const padding = normalized.length % 4;
  const padded = padding ? normalized + '='.repeat(4 - padding) : normalized;
  return atob(padded);
};

export const decodeTokenPayload = (token: string): TokenPayload | null => {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  try {
    const payload = JSON.parse(decodeBase64Url(parts[1])) as TokenPayload;
    if (payload && typeof payload.id === 'string') {
      return payload;
    }
  } catch {
    return null;
  }

  return null;
};

export const getTokenPayload = (): TokenPayload | null => {
  const token = Token.get();
  if (!token) {
    return null;
  }

  return decodeTokenPayload(token);
};
