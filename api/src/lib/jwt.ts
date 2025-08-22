import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

export function signJwt<T extends object>(
  payload: T,
  options?: jwt.SignOptions
) {
  const secret = env.JWT_SECRET as jwt.Secret;
  const signOptions: jwt.SignOptions = {
    algorithm: "HS256",
    expiresIn: env.JWT_EXPIRES_IN as unknown as jwt.SignOptions["expiresIn"],
    ...(options ?? {}),
  };
  return jwt.sign(payload as any, secret, signOptions) as string;
}

export function verifyJwt<T = any>(token: string): T {
  return jwt.verify(token, env.JWT_SECRET as jwt.Secret) as T;
}
