import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { SessionData, sessionOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { credentialId, publicKey, counter, deviceType, transports } = body;

    if (!credentialId || !publicKey) {
      return NextResponse.json({ success: false, error: 'Missing credential data' }, { status: 400 });
    }

    // Verify challenge cookie exists (basic verification)
    const cookieStore = await cookies();
    const challengeCookie = cookieStore.get('webauthn_challenge');
    if (!challengeCookie) {
      return NextResponse.json({ success: false, error: 'Challenge expired or not found' }, { status: 400 });
    }

    // Clear the challenge cookie
    cookieStore.delete('webauthn_challenge');

    // Check if credential already exists
    const existing = await prisma.webAuthnCredential.findUnique({
      where: { credentialId }
    });
    if (existing) {
      return NextResponse.json({ success: false, error: 'Credential already registered' }, { status: 409 });
    }

    // Save the credential
    const credential = await prisma.webAuthnCredential.create({
      data: {
        credentialId,
        publicKey,
        counter: counter || 0,
        deviceType: deviceType || 'platform',
        transports: transports ? JSON.stringify(transports) : null,
        userId: session.userId,
      }
    });

    return NextResponse.json({ 
      success: true, 
      data: { id: credential.id, credentialId: credential.credentialId, createdAt: credential.createdAt }
    });
  } catch (error: any) {
    console.error('WebAuthn register verify error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
