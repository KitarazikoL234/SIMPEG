import { SessionOptions } from 'iron-session';
import { Role } from '@/types';

export interface SessionData {
  userId: string;
  email: string;
  nama: string;
  role: string;
  employeeId?: string;
  isLoggedIn: boolean;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || 'simpeg-stikes-baktara-secret-key-2026-minimum-32-chars',
  cookieName: 'simpeg-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 8,
  },
};

export const defaultSession: SessionData = {
  userId: '',
  email: '',
  nama: '',
  role: Role.PEGAWAI,
  isLoggedIn: false,
};

export function isAdmin(role: string): boolean {
  return role === Role.ADMIN;
}

export function isOperatorOrAdmin(role: string): boolean {
  return role === Role.ADMIN || role === Role.OPERATOR;
}
