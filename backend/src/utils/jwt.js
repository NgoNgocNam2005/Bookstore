import jwt from 'jsonwebtoken';
import env from '../config/env.js';

export function signAccessToken(payload) {
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

export function getBearerToken(request) {
  const authorization = request.headers.authorization;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return null;
  }

  return authorization.substring(7);
}
