import { NextFunction, Request, Response } from 'express';

import { verify, JwtPayload, TokenPayload } from 'jsonwebtoken';

import { returnFormat } from './utils';
import AccessTokenInterface from './interfaces/AccessToken';

declare module 'jsonwebtoken' {
  export interface TokenPayload extends JwtPayload, AccessTokenInterface {}
}

export const requireLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authorization = req.headers.authorization;

    if (!authorization) {
      return returnFormat({ req, res, status: 401 });
    }

    const tokenReceived = authorization.replace('Bearer ', '');
    if (!process.env.ACCESS_TOKEN) {
      return returnFormat({ req, res, status: 400 });
    }

    const token = <TokenPayload>verify(tokenReceived, process.env.ACCESS_TOKEN);
    if (!token) {
      return returnFormat({ req, res, status: 401 });
    }

    const { firstName, lastName, userId, userName, type } = token;
    req.user = { firstName, lastName, userId, userName, type };
    next();
  } catch (err) {
    return returnFormat({ req, res, status: 401 });
  }
};

export function notFound(req: Request, res: Response, next: NextFunction) {
  res.status(404);
  const error = new Error(`🔍 - Not Found - ${req.originalUrl}`);
  next(error);
}

//todo: make error handler better
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: Error, req: Request, res: Response) {
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
}
