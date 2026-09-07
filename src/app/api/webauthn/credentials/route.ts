import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { SessionData, sessionOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// GET: List user's registered credentials
export async function GET() {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const credentials = await prisma.webAuthnCredential.findMany({
      where: { userId: session.userId },
      select: { id: true, deviceType: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, data: credentials });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Remove a credential
export async function DELETE(request: Request) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (!session.isLoggedIn || !session.userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const credId = searchParams.get('id');
    if (!credId) {
      return NextResponse.json({ success: false, error: 'Missing credential ID' }, { status: 400 });
    }

    // Only allow deleting own credentials
    await prisma.webAuthnCredential.deleteMany({
      where: { id: credId, userId: session.userId }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
