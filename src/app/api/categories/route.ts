import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';
import { sessionOptions } from '@/lib/auth';
import { SessionData } from '@/types';

export async function GET() {
  try {
    const categories = await prisma.documentCategory.findMany({
      orderBy: { name: 'asc' }
    });
    return NextResponse.json({ success: true, data: categories });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (!session.isLoggedIn || (session.role !== 'ADMIN' && session.role !== 'PIMPINAN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { name, color } = await request.json();
    if (!name) {
      return NextResponse.json({ success: false, error: 'Nama kategori wajib diisi' }, { status: 400 });
    }

    // Convert to uppercase format similar to ENUMs (e.g., "KEUANGAN")
    const formattedName = name.toUpperCase().replace(/\s+/g, '_');

    const exists = await prisma.documentCategory.findUnique({
      where: { name: formattedName }
    });

    if (exists) {
      return NextResponse.json({ success: false, error: 'Kategori sudah ada' }, { status: 400 });
    }

    const category = await prisma.documentCategory.create({
      data: {
        name: formattedName,
        color: color || '#3B82F6'
      }
    });

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
