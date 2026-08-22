import jwt from 'jsonwebtoken';
import { IUserPayload } from '../types/index.js';

export const generateToken = (payload: IUserPayload): string => {
  const secret = process.env.JWT_SECRET || 'fallback_secret_key';
  return jwt.sign(payload, secret, { expiresIn: '7d' });
};

export const verifyToken = (token: string): IUserPayload => {
  const secret = process.env.JWT_SECRET || 'fallback_secret_key';
  return jwt.verify(token, secret) as IUserPayload;
};
