import { Request } from 'express';
import AccessTokenInterface from '../../interfaces/AccessToken';

declare global {
  namespace Express {
    interface Request {
      user?: AccessTokenInterface;
    }
  }
}
