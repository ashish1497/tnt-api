import { Router, Request, Response } from 'express';

import ReturnParams from '../../interfaces/ReturnResponse';
import { returnFormat } from '../../utils';
import User from '../user/user.model';
import Order from './order.model';

const router: Router = Router();

interface OrderBody {
  pickup: string;
  drop: string;
}

type OrderRequest = Request<{}, ReturnParams, OrderBody>;

interface UserOrderUpdate {
  type: 'user';
  pickup: string;
  drop: string;
}

interface DeliveryOrderUpdate {
  type: 'delivery';
  status: 'ordered' | 'assigned' | 'shipped' | 'delivered';
}

interface AdminOrderUpdate {
  type: 'admin';
  pickup: string;
  drop: string;
  status: 'ordered' | 'assigned' | 'shipped' | 'delivered';
}

type OrderUpdate = UserOrderUpdate | DeliveryOrderUpdate | AdminOrderUpdate;

const apiType = 'order';

//create orders // only by user
router.post('/', async (req: OrderRequest, res: Response) => {
  try {
    if (!req.user) {
      return returnFormat({ req, res, status: 401, apiType });
    }

    const { type } = req.user;
    if (type !== 'user') {
      return returnFormat({
        req,
        res,
        status: 400,
        apiType,
        message: 'Only customer can create orders',
      });
    }

    const { drop, pickup } = req.body;

    //todo: validate

    //todo: find delivery
    const deliveryPartners = await User.find({ type: 'delivery' }, { _id: 1 });
    if (!deliveryPartners || !deliveryPartners.length) {
      return returnFormat({
        req,
        res,
        apiType,
        status: 400,
        message: 'There are no delivery partners associated yet',
      });
    }

    //hack: assign to delivery randomly
    const delivery =
      deliveryPartners[Math.floor(Math.random() * deliveryPartners.length)];

    //todo: save order
    const order = new Order({
      userId: req.user.userId,
      deliveryId: delivery._id.toString(),
      pickup,
      drop,
      status: 'ordered',
    });

    await order.save();
    return returnFormat({
      req,
      res,
      apiType,
      status: 201,
      message: 'Order created successfully',
    });
  } catch (error) {
    console.log(error);
    return returnFormat({ req, res, status: 500, apiType });
  }
});

// get orders // all, user and delivery separate
router.get('/', async (req: Request, res: Response) => {
  try {
    if (req.user?.type === 'user') {
      const orders = await Order.find({ userId: req.user?.userId });
      return returnFormat({
        req,
        res,
        apiType,
        status: 200,
        success: true,
        message: `Customer: Orders for ${req.user?.userName} retrieved`,
        data: orders,
      });
    } else if (req.user?.type === 'delivery') {
      const orders = await Order.find({ deliveryId: req.user?.userId });
      return returnFormat({
        req,
        res,
        apiType,
        status: 200,
        success: true,
        message: `Delivery: Orders for ${req.user?.userName} retrieved`,
        data: orders,
      });
    } else if (req.user?.type === 'admin') {
      const orders = await Order.find({});
      return returnFormat({
        req,
        res,
        apiType,
        status: 200,
        success: true,
        message: `Admin: Orders for ${req.user?.userName} retrieved`,
        data: orders,
      });
    } else return returnFormat({ req, res, status: 400, apiType });
  } catch (error) {
    return returnFormat({ req, res, status: 500, apiType });
  }
});

//get order by id
router.get(
  '/:id',
  async (req: Request<{ id: string }, ReturnParams>, res: Response) => {
    try {
      const { id } = req.params;
      if (!id || id.length < 1) {
        return returnFormat({ req, res, status: 400, apiType });
      }

      const order = await Order.findById(id).lean();
      if (!order) {
        return returnFormat({ req, res, status: 404, apiType });
      }

      if (
        (req.user?.type === 'user' && order.userId === req.user?.userId) ||
        (req.user?.type === 'delivery' &&
          order.deliveryId === req.user?.userId) ||
        req.user?.type === 'admin'
      ) {
        return returnFormat({
          req,
          res,
          apiType,
          success: true,
          status: 200,
          message: `Order "${order._id}" retrieved`,
          data: order,
        });
      } else return returnFormat({ req, res, status: 400, apiType });
    } catch (error) {
      return returnFormat({ req, res, status: 500, apiType });
    }
  }
);

//update orders // only by delivery partners
router.put(
  '/:id',
  async (req: Request<{ id: string }, ReturnParams, OrderUpdate>, res) => {
    try {
      const { type } = req.user!;

      const order = await Order.findById(req.params.id).lean();
      if (!order) {
        return returnFormat({ req, res, status: 404, apiType });
      }
      const { type: bodyType } = req.body;
      if (bodyType !== type) {
        return returnFormat({ req, res, status: 400, apiType });
      }
      //todo: userType is customer, can only update pickup and drop
      if (bodyType === 'user') {
        const { pickup, drop } = req.body;

        //todo: validate

        //todo: find one and update
        const update = await Order.findByIdAndUpdate(order._id, {
          pickup: pickup,
          drop: drop,
        }).lean();
        if (!update) {
          return returnFormat({
            req,
            res,
            apiType,
            status: 400,
            message: 'Database reject',
          });
        }

        return returnFormat({
          req,
          res,
          apiType,
          status: 200,
          success: true,
          message: `Order "${order._id} updated successfully`,
        });

        //todo: return
      } else if (bodyType === 'delivery') {
        //todo: userType is delivery, can only update status
        const { status } = req.body;

        //todo: validate

        //todo: find one and update
        const update = await Order.findByIdAndUpdate(order._id, {
          status: status,
        }).lean();
        if (!update) {
          return returnFormat({
            req,
            res,
            apiType,
            status: 400,
            message: 'Database reject',
          });
        }

        return returnFormat({
          req,
          res,

          apiType,
          status: 200,
          success: true,
          message: `Order "${order._id} updated successfully`,
        });

        //todo: return
      } else if (bodyType === 'admin') {
        //todo: userType is admin, can update all
        const { drop, pickup, status } = req.body;

        //todo: validate

        //todo: find one and update
        const update = await Order.findByIdAndUpdate(order._id, {
          status: status,
          drop: drop,
          pickup: pickup,
        }).lean();
        if (!update) {
          return returnFormat({
            req,
            res,
            apiType,
            status: 400,
            message: 'Database reject',
          });
        }

        return returnFormat({
          req,
          res,
          apiType,
          status: 200,
          success: true,
          message: `Order "${order._id} updated successfully`,
        });
      } else {
        return returnFormat({ req, res, status: 400, apiType });
      }
    } catch (error) {
      return returnFormat({ req, res, status: 500, apiType });
    }
  }
);

// delete orders
router.delete(
  '/:id',
  async (req: Request<{ id: string }, ReturnParams, {}>, res: Response) => {
    try {
      const { type } = req.user!;
      if (type !== 'admin') {
        return returnFormat({
          req,
          res,
          apiType,
          status: 401,
          message: 'Only admins are allowed to delete',
        });
      }

      const orderDelete = await Order.findByIdAndDelete(req.params.id).lean();
      if (!orderDelete) {
        return returnFormat({
          req,
          res,
          apiType,
          status: 400,
          message: 'Database rejected',
        });
      }

      return returnFormat({
        req,
        res,
        apiType,
        status: 200,
        success: true,
        message: `Order "${req.params.id}" deleted successfully`,
      });
    } catch (error) {
      return returnFormat({ req, res, status: 500, apiType });
    }
  }
);

export default router;
