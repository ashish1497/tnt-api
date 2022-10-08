import { Document } from 'mongoose';

export interface UserInterface extends Document {
  firstName: string;
  lastName: string;
  username: string;
  type: 'admin' | 'user' | 'delivery';
  password: string;
}
