import { Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';

export const jwtSecret = process.env.JWT_SECRET || "";

const verifyToken = (token: string) => {
  // we only sign admin tokens. any signed token is a valid token
  if (! jwtSecret) {
    throw new Error("JWT secret must be set in the environment variables");
  }
  try {
    return verify(token, jwtSecret);
  } catch (e) {
    throw new Error("Invalid authorization token: " + token);
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authorization = req.headers.authorization;
    if (! authorization || ! authorization.startsWith("Bearer ")) {
      throw new Error("Invalid authorization header");
    }
    const token = authorization.substring(7);
    verifyToken(token || '');
    next();
  } catch (e) {
    res.status(401).json({
      message: e.message
    })
  }
}