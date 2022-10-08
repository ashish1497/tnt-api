import { createConnection, set } from 'mongoose';

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
    // logger.log({
    //   level: 'general',
    //   message: `MongoDB ${uri} connection error`,
    // });
    // log.http(`MongoDB ${uri}`, 'connection error');
    console.log(`MongoDB ${uri} connection error`);
  });

  db.on('connected', () => {
    set('debug', (col, method, query, doc) => {
      //   logger.log({
      //     level: 'db',
      //     message: {
      //       uri,
      //       call: `${col}.${method}(${JSON.stringify(query)},${JSON.stringify(
      //         doc
      //       )})`,
      //     },
      //   });
      // log.info(
      //   `MongoDB ${uri}`,
      //   `${col}.${method}(${JSON.stringify(query)},${JSON.stringify(doc)})`,
      // );
      console.log(
        `${col}.${method}(${JSON.stringify(query)},${JSON.stringify(doc)})`
      );
    });
    // logger.log({
    //   level: 'general',
    //   message: `MongoDB ${uri} connection success`,
    // });
    console.log(`MongoDB ${uri} connection success`);
  });

  db.on('disconnected', () => {
    // logger.log({
    //   level: 'general',
    //   message: `MongoDB ${uri} disconnection successful`,
    // });
    // log.http(`MongoDB ${uri}`, 'disconnection successful');
    console.log(`MongoDB ${uri} disconnection successful`);
  });

  return db;
};
