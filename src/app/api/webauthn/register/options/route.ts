import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { SessionData, sessionOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export async function POST() {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { webauthnCredentials: true }
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Generate challenge
    const challenge = crypto.randomBytes(32);
    const challengeB64 = Buffer.from(challenge).toString('base64url');

    // Store challenge in session-like cookie for verification
    const cookieStore = await cookies();
    cookieStore.set('webauthn_challenge', challengeB64, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 300, // 5 minutes
      path: '/',
    });

    // Build registration options
    const options = {
      challenge: challengeB64,
      rp: {
        name: 'SIMPEG STIKES Baktara',
        id: undefined as string | undefined, // Will be set by client
      },
      user: {
        id: Buffer.from(user.id).toString('base64url'),
        name: user.email,
        displayName: user.nama,
      },
      pubKeyCredParams: [
        { alg: -7, type: 'public-key' },   // ES256
        { alg: -257, type: 'public-key' },  // RS256
      ],
      timeout: 60000,
      authenticatorSelection: {
        authenticatorAttachment: 'platform' as const, // Use built-in sensor (fingerprint, face)
        residentKey: 'preferred' as const,
        userVerification: 'required' as const,
      },
      attestation: 'none' as const,
      excludeCredentials: user.webauthnCredentials.map(cred => ({
        id: cred.credentialId,
        type: 'public-key' as const,
        transports: cred.transports ? JSON.parse(cred.transports) : undefined,
      })),
    };

    return NextResponse.json({ success: true, options });
  } catch (error: any) {
    console.error('WebAuthn register options error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
