import { NextFunction, Response } from 'express';
import { HttpMethod } from './http-method.enum.js';
import { Middleware } from '../middleware/middleware.interface.js';


export type RouteHandler = 
  | ((req: any, res: Response) => void | Promise<void>)
  | ((req: any, res: Response, next: NextFunction) => void | Promise<void>);

export interface Route {
  path: string;
  method: HttpMethod;
  handler: RouteHandler;
  middlewares?: Middleware[];
}