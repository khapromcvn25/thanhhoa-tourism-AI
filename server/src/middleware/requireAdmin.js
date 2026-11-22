import { readBearerToken } from '../lib/auth.js';
import { unauthorized } from '../lib/httpError.js';

export function createRequireAdmin(tokens) {
  return function requireAdmin(req, res, next) {
    const token = readBearerToken(req);
    if (!token || !tokens.verify(token)) return next(unauthorized());
    return next();
  };
}
