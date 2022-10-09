import { Schema } from 'mongoose';

import db from '../../db';
import { OrderInterface } from '../../interfaces/OrderModel';

const OrderModel = new Schema(
  {
    userId: { type: String, required: true },
    deliveryId: { type: String },
    pickup: { type: String, required: true },
    drop: { type: String, required: true },
    status: {
      type: String,
      enum: ['ordered', 'assigned', 'shipped', 'delivered'],
      required: true,
    },
  },
  { timestamps: true }
);

const Order = db.model<OrderInterface>('Order', OrderModel);
export default Order;
