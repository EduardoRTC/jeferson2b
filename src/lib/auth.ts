import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { db } from './db';
import { users } from './schema';
import { eq } from 'drizzle-orm';
import { hash, verify } from 'argon2';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

export async function hashPassword(password: string) {
  return hash(password);
}

export async function verifyPassword(
  hashedPassword: string,
  password: string
): Promise<boolean> {
  return verify(hashedPassword, password);
}

export async function createToken(userId: string, role: string) {
  return new SignJWT({ userId, role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
}

export async function verifyToken(token: string) {
  try {
    const verified = await jwtVerify(token, secret);
    return verified.payload as { userId: string; role: string };
  } catch (err) {
    return null;
  }
}

export async function getUser(userId: string) {
  return db.query.users.findFirst({
    where: eq(users.id, userId),
  });
}

export async function isAdmin(userId: string) {
  const user = await getUser(userId);
  return user?.role === 'admin';
}

export function unauthorized() {
  return new NextResponse(null, { status: 401 });
}

export function forbidden() {
  return new NextResponse(null, { status: 403 });
}