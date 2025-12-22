import jwt from 'jsonwebtoken';
import type { JwtPayLoad } from './types';
import Cookie from "cookie";

const JWT_SECRET = process.env.JWT_SECRET;
const EXPIRE_IN = process.env.EXPIRE_IN ?? '1h';


if (!process.env.EXPIRE_IN) {
  throw new Error("EXPIRE_IN is not defined");
}


export const authLib = {

  generateToken(payload: JwtPayLoad): string {
    return jwt.sign(payload, JWT_SECRET!, { expiresIn: "2d" });
  },

  verifyToken(token: string): JwtPayLoad | null {
    try {
      return jwt.verify(token, JWT_SECRET!) as JwtPayLoad;
    } catch {
      return null;
    }
  },

  extractToken(authHeader: string | null): string | null {
    if (!authHeader?.startsWith('Bearer ')) return null;
    return authHeader.split(' ')[1];
  },

  extractCookie(cookieHeader: string | null): string | null {
    if(!cookieHeader) return null;
    const cookie = Cookie.parse(cookieHeader);
    return cookie.token || null;
  } 

  
};