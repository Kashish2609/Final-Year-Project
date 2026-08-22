import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { verifyToken } from '../utils/jwt.js';
import { ErrorResponse } from '../utils/errorResponse.js';
import { GlobalRole } from '../types/permissions.js';

export const authenticateUser = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
};

export const requireGlobalAdmin = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  if (!req.user || req.user.globalRole !== GlobalRole.SUPER_ADMIN) {
    return next(new ErrorResponse('Super Admin permission required', 403));
  }
  next();
};
