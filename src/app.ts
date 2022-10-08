import express, { Request, Response } from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';

import * as middlewares from './middlewares';
import api from './api/user';

require('dotenv').config();

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());
app.use(express.json());
app.set('trust proxy', true);

app.use('/api/oauth', api);

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

export default app;
