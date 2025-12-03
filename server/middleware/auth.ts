import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../lib/supabaseClient.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    is_admin?: boolean;
  };
}

const extractToken = (req: Request): string | null => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const [scheme, token] = authHeader.split(' ');
  if (scheme?.toLowerCase() !== 'bearer' || !token) return null;
  return token;
};

export const requireAuth = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Missing bearer token' });
    }

    const { data: userResponse, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !userResponse?.user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' });
    }

    const userId = userResponse.user.id;
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .maybeSingle();

    req.user = {
      id: userId,
      email: userResponse.user.email ?? undefined,
      is_admin: profile?.is_admin ?? false,
    };

    return next();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Auth middleware error', error);
    return res.status(500).json({ error: 'auth_failed', message: 'Unable to verify session.' });
  }
};

