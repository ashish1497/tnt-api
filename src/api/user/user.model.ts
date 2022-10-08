import { Schema, model } from 'mongoose';

import { UserInterface } from '../../interfaces/UserModel';

const UserModel = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  username: { type: String, required: true },
  type: { type: String, enum: ['user', 'delivery', 'admin'], required: true },
  password: { type: String, required: true },
});

export default model<UserInterface>('User', UserModel);
