import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { sign, verify, RefreshTokenLoad } from 'jsonwebtoken';

import User from './user.model';
import { returnFormat } from '../../utils';

import ReturnParams from '../../interfaces/ReturnResponse';
import AccessTokenInterface from '../../interfaces/AccessToken';

const router = Router();

interface RegisterBody {
  firstName: string;
  lastName: string;
  password: string;
  username: string;
  type: 'user' | 'delivery';
}

type RegisterRequest = Request<{}, ReturnParams, RegisterBody>;

interface LoginBody {
  username: string;
  password: string;
}

type LoginRequest = Request<{}, ReturnParams, LoginBody>;

interface RefreshTokenBody {
  refreshToken: string;
}

type TokenRequest = Request<{}, ReturnParams, RefreshTokenBody>;

interface RefreshTokenDecoded {
  username: string;
}

declare module 'jsonwebtoken' {
  export interface RefreshTokenLoad extends JwtPayload, RefreshTokenDecoded {}
}

// const createUsername = async (fn: string, ln: string) => {
//   let result: string;
//   result = fn.toLowerCase() + ln.toLowerCase();
//   return result;
// };

const hashPassword = async (password: string) => {
  const saltRounds: number = 10;

  const hashedPassword = await new Promise((resolve, reject) => {
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) reject(err);
      else resolve(hash);
    });
  });

  return hashedPassword;
};

const createToken = async (
  data: string | object | Buffer,
  type: 'at' | 'rt'
) => {
  let token;
  if (type === 'at') {
    if (process.env.ACCESS_TOKEN) {
      token = await sign(data, process.env.ACCESS_TOKEN, { expiresIn: '15m' });
    }
  } else {
    if (process.env.REFRESH_TOKEN) {
      token = await sign(data, process.env.REFRESH_TOKEN, {
        expiresIn: '365d',
      });
    }
  }
  return token;
};

const apiType = 'user';

router.post(
  '/register',
  async (req: RegisterRequest, res: Response<ReturnParams>) => {
    try {
      const { firstName, lastName, username, password, type } = req.body;

      //todo: validate

      const usernameExists = await User.findOne({ username: username }).lean();
      if (usernameExists) {
        return returnFormat({
          req,
          res,
          status: 400,
          apiType,
          message: 'User already exists',
        });
      }

      const newPassword = await hashPassword(password);
      const user = new User({
        firstName,
        lastName,
        username,
        password: newPassword,
        type,
      });

      await user.save();
      return returnFormat({
        req,
        res,
        status: 201,
        apiType: 'user',
        message: 'User created successfully',
        success: true,
      });
    } catch (error) {
      // return internal error
      return returnFormat({ req, res, status: 500, apiType });
    }
  }
);

router.post(
  '/login',
  async (req: LoginRequest, res: Response<ReturnParams>) => {
    try {
      const { password, username } = req.body;

      //todo: validate

      //todo: check user exists
      const userExists = await User.findOne({ username }).lean();
      if (!userExists) {
        return returnFormat({
          req,
          res,
          status: 400,
          apiType,
          message: 'User does not exists',
        });
      }

      //todo: match password
      const match = await bcrypt.compare(password, userExists.password);
      if (!match) {
        return returnFormat({
          req,
          res,
          status: 400,
          apiType,
          message: 'Wrong Password',
        });
      }

      //todo: create at and rt
      const refreshData: RefreshTokenDecoded = {
        username: userExists.username,
      };
      const { firstName, lastName, username: userName, type } = userExists;
      const accessData: AccessTokenInterface = {
        userId: userExists._id.toString(),
        firstName,
        lastName,
        userName,
        type,
      };
      const refreshToken = await createToken(refreshData, 'rt');
      const accessToken = await createToken(accessData, 'at');

      //todo return at, rt and user
      const data = {
        refreshToken,
        accessToken,
      };
      return returnFormat({
        req,
        res,
        success: true,
        status: 200,
        apiType,
        message: 'Login Successful',
        data: data,
      });
    } catch (err) {
      // return internal error
      return returnFormat({ req, res, status: 500, apiType });
    }
  }
);

router.post(
  '/token',
  async (req: TokenRequest, res: Response<ReturnParams>) => {
    try {
      const { refreshToken } = req.body;

      //todo: validate

      //todo: verify token
      if (!process.env.REFRESH_TOKEN) {
        return returnFormat({
          req,
          res,
          status: 500,
          apiType,
        });
      }

      try {
        // hack: token type any is a hack
        verify(
          refreshToken,
          process.env.REFRESH_TOKEN,
          async (err, token: any) => {
            if (err) {
              return returnFormat({ req, res, status: 401, apiType: 'user' });
            }

            const userInfo = await User.findOne({
              username: token.username,
            }).lean();
            if (!userInfo) {
              return returnFormat({ req, res, status: 400, apiType });
            }

            //todo: create at and send
            const {
              _id: id,
              firstName,
              lastName,
              username: userName,
              type,
            } = userInfo;
            const accessData: AccessTokenInterface = {
              userId: id.toString(),
              firstName,
              lastName,
              userName,
              type,
            };
            const accessToken = await createToken(accessData, 'at');

            //todo return at, rt and user
            const data = {
              accessToken,
            };
            return returnFormat({
              req,
              res,
              apiType,
              success: true,
              status: 200,
              message: 'Token retrieved',
              data: data,
            });
          }
        );
      } catch (error) {
        return returnFormat({ req, res, status: 400, apiType });
      }
      const decodedData = await (<RefreshTokenLoad>(
        verify(refreshToken, process.env.REFRESH_TOKEN)
      ));
      if (!decodedData) {
        return returnFormat({
          req,
          res,
          status: 401,
          apiType,
        });
      }
    } catch (err) {
      // return internal error
      console.log(err);
      return returnFormat({ req, res, status: 500, apiType });
    }
  }
);

export default router;
