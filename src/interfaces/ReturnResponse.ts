import { Request, Response } from 'express';

export default interface ReturnParams {
  req: Request;
  res: Response;
  status: number;
  success?: boolean;
  message?: string;
  error?: string;
  data?: any;
}
