import { Router } from 'express';

import user from './user/user.route';
import order from './order/order.route';
import { requireLogin } from '../middlewares';

const router = Router();

router.use('/auth', user);
router.use('/order', requireLogin, order);

export default router;
