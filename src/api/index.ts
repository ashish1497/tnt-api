import { Router } from 'express';

import user from './user';
import order from './order';
import { requireLogin } from '../middlewares';

const router = Router();

router.use('/auth', user);
router.use('/orders', requireLogin, order);

export default router;
