import ReturnParams from './interfaces/ReturnResponse';
import { apiLogger, orderLogger, userLogger } from './logger';

const messageDefault: any = {
  200: 'Something went wrong',
  201: 'Created',
  400: 'Bad Request',
  401: 'Unauthorised',
  404: 'Not found',
  500: 'Internal Server Error',
};

export const returnFormat = ({
  req,
  res,
  status,
  apiType = 'api',
  success = false,
  message,
  error,
  data,
}: ReturnParams) => {
  try {
    const valuesFirst = {
      success,
      message: message || messageDefault[status] || 'Something went wrong',
      error,
      data,
    };

    //todo: use MessageResponse Type
    //  To remove null or empty values
    let values = Object.fromEntries(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      Object.entries(valuesFirst).filter(([_, v]) => v != (null || undefined))
    );
    const statement = {
      ip:
        process.env.NODE_ENV !== 'production'
          ? req.ip
          : req.headers['x-real-ip'],
      method: req.method,
      url: req.originalUrl,
      status: status,
      response: JSON.stringify(values),
    };

    //logging
    let lvl: 'general' | 'warn' | 'error';
    if (status < 400) {
      lvl = 'general';
    } else if (status >= 400 && status < 500) {
      lvl = 'warn';
    } else if (status >= 500) {
      lvl = 'error';
    } else return;

    if (apiType === 'user') {
      userLogger.log({
        level: lvl,
        message: JSON.stringify(statement),
      });
    } else if (apiType === 'order') {
      orderLogger.log({
        level: lvl,
        message: JSON.stringify(statement),
      });
    } else if (apiType === 'api') {
      apiLogger.log({
        level: lvl,
        message: JSON.stringify(statement),
      });
    }

    //Log in console if not in production
    if (process.env.NODE_ENV !== 'production') {
      console.log(JSON.stringify(statement));
    }

    return res.status(status).json(values);
  } catch (err) {
    console.log(JSON.stringify(err));
  }
};
