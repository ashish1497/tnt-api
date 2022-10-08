import { Document } from 'mongoose';

export interface OrderInterface extends Document {
  userId: String;
  deliveryId: String;
  pickup: String;
  drop: String;
  status: 'ordered' | 'assigned' | 'shipped' | 'delivered';
  password: string;
}
