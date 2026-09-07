import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { SessionData, sessionOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { credentialId } = body;

    if (!credentialId) {
      return NextResponse.json({ success: false, error: 'Missing credentialId' }, { status: 400 });
    }

    // Verify challenge cookie
    const cookieStore = await cookies();
    const challengeCookie = cookieStore.get('webauthn_login_challenge');
    if (!challengeCookie) {
      return NextResponse.json({ success: false, error: 'Challenge expired' }, { status: 400 });
    }
    cookieStore.delete('webauthn_login_challenge');

    // Find credential in database
    const credential = await prisma.webAuthnCredential.findUnique({
      where: { credentialId },
      include: { 
        user: {
          include: { employee: true }
        }
      }
    });

    if (!credential) {
      return NextResponse.json({ 
        success: false, 
        error: 'Sidik jari tidak dikenali. Pastikan Anda sudah mendaftarkan sidik jari melalui menu Pengaturan.' 
      }, { status: 401 });
    }

    const user = credential.user;
    if (!user.isActive) {
      return NextResponse.json({ success: false, error: 'Akun tidak aktif' }, { status: 403 });
    }

    // Update counter
    await prisma.webAuthnCredential.update({
      where: { id: credential.id },
      data: { counter: { increment: 1 } }
    });

    // Create session (same as password login)
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    session.userId = user.id;
    session.email = user.email;
    session.nama = user.nama;
    session.role = user.role as SessionData['role'];
    session.employeeId = user.employeeId || undefined;
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        nama: user.nama,
        role: user.role,
        employeeId: user.employeeId,
      },
    });
  } catch (error: any) {
    console.error('WebAuthn login verify error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
