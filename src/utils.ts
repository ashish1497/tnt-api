import ReturnParams from './interfaces/ReturnResponse';

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
  success = false,
  message,
  error = '',
  data,
}: ReturnParams) => {
  try {
    const statement = {
      ip:
        process.env.NODE_ENV !== 'production'
          ? req.ip
          : req.headers['x-real-ip'],
      method: req.method,
      url: req.originalUrl,
    };
    console.log(JSON.stringify(statement));

    const valuesFirst = {
      success,
      message: message || messageDefault[status] || 'Something went wrong',
      error,
      data,
    };

    //todo: use MessageResponse Type
    //  To remove null or empty values
    const values = Object.fromEntries(
      // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
      Object.entries(valuesFirst).filter(([key, val]) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        val !== (null || '');
      })
    );

    return res.status(status).json(values);
  } catch (err) {
    console.log(JSON.stringify(err));
  }
};
