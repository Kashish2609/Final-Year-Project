import { Response } from 'express';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { AuthenticatedRequest } from '../types/index.js';

export const getUsers = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { search } = req.query;

  const query: any = { isActive: true };
  if (search) {
    query.$or = [
      { name: { $regex: search as string, $options: 'i' } },
      { email: { $regex: search as string, $options: 'i' } },
    ];
  }

  const users = await User.find(query).select('name email avatar globalRole lastSeen isActive').limit(20);

  res.status(200).json({
    success: true,
    data: users,
  });
});
