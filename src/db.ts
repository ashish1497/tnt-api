import { createConnection, set } from 'mongoose';
import { apiLogger } from './logger';

const mongooseOptions = {
  useUnifiedTopology: true,
  // useFindAndModify: false,
  useNewUrlParser: true,
  // useCreateIndex: true,
  autoIndex: false,
  // poolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4,
};

const makeNewConnection = (uri: string) => {
  const db = createConnection(uri, mongooseOptions);

  db.on('error', () => {
    apiLogger.log({
      level: 'general',
      message: `MongoDB ${uri} connection error`,
    });
    if (process.env.NODE_ENV !== 'production') {
      console.log(`MongoDB ${uri} connection error`);
    }
  });

  db.on('connected', () => {
    set('debug', (col, method, query, doc) => {
      apiLogger.log({
        level: 'general',
        message: JSON.stringify({
          uri,
          call: `${col}.${method}(${JSON.stringify(query)},${JSON.stringify(
            doc
          )})`,
        }),
      });
      if (process.env.NODE_ENV !== 'production') {
        console.log(
          `${col}.${method}(${JSON.stringify(query)},${JSON.stringify(doc)})`
        );
      }
    });
    apiLogger.log({
      level: 'general',
      message: `MongoDB ${uri} connection success`,
    });
    if (process.env.NODE_ENV !== 'production') {
      console.log(`MongoDB ${uri} connection success`);
    }
  });

  db.on('disconnected', () => {
    apiLogger.log({
      level: 'general',
      message: `MongoDB ${uri} disconnection successful`,
    });
    if (process.env.NODE_ENV !== 'production') {
      console.log(`MongoDB ${uri} disconnection successful`);
    }
  });

  return db;
};

if (!process.env.MONGO_URI) {
  throw new Error('MONGO: URI not provided');
}

const db = makeNewConnection(process.env.MONGO_URI);

export default db;
