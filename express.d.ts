import { TokenPayload } from './src/shared/types/index.ts';

declare global {
  namespace Express {
    interface Request {
      tokenPayload?: TokenPayload;
    }
  }
}

export {};

