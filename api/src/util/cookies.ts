import type { Response } from 'express';

export function setAuthCookie(res: Response, token: string) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: isProd,
    path: '/',
    maxAge: 60 * 60 * 1000
  });
}

export function clearAuthCookie(res: Response) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('token', '', { httpOnly: true, expires: new Date(0), sameSite: 'strict', secure: isProd, path: '/' });
}
