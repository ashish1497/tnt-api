require('dotenv').config();
import app from './app';
import { apiLogger } from './logger';

const port = process.env.PORT || 5000;
app.listen(port, () => {
  apiLogger.log({
    level: 'general',
    message: `Listening: http://localhost:${port}`,
  });
  if (process.env.NODE_ENV !== 'production') {
    /* eslint-disable no-console */
    console.log(`Listening: http://localhost:${port}`);
    /* eslint-enable no-console */
    return;
  }
});
