import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

export async function POST() {
  try {
    // Get all credentials from database (we need their IDs for allowCredentials)
    const allCredentials = await prisma.webAuthnCredential.findMany({
      select: { credentialId: true, transports: true }
    });

    if (allCredentials.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Belum ada sidik jari yang terdaftar di sistem. Silakan daftarkan terlebih dahulu melalui menu Pengaturan.' 
      }, { status: 404 });
    }

    // Generate challenge
    const challenge = crypto.randomBytes(32);
    const challengeB64 = Buffer.from(challenge).toString('base64url');

    // Store challenge
    const cookieStore = await cookies();
    cookieStore.set('webauthn_login_challenge', challengeB64, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 300,
      path: '/',
    });

    const options = {
      challenge: challengeB64,
      rpId: undefined as string | undefined, // Set by client
      timeout: 60000,
      userVerification: 'required',
      allowCredentials: allCredentials.map(cred => ({
        id: cred.credentialId,
        type: 'public-key',
        transports: cred.transports ? JSON.parse(cred.transports) : undefined,
      })),
    };

    return NextResponse.json({ success: true, options });
  } catch (error: any) {
    console.error('WebAuthn login options error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
