import { Request } from 'express';
import { GlobalRole } from './permissions.js';

export interface IUserPayload {
  id: string;
  email: string;
  globalRole: GlobalRole;
}

export interface AuthenticatedRequest extends Request {
  user?: IUserPayload;
  projectMembershipRole?: string;
}
