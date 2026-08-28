import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { SessionData, sessionOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Get logged-in user's own employee profile
export async function GET() {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (!session.isLoggedIn || !session.employeeId) {
      return NextResponse.json({ success: false, error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const employee = await prisma.employee.findUnique({
      where: { id: session.employeeId },
      include: {
        educationHistory: { orderBy: { tahunLulus: 'desc' } },
        positionHistory: { orderBy: { tmt: 'desc' } },
        documents: { orderBy: { tanggalTerbit: 'desc' }, take: 5 },
        user: { select: { id: true, email: true, role: true, nama: true } },
      },
    });

    if (!employee) {
      return NextResponse.json({ success: false, error: 'Data profil tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: employee });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT - Update logged-in user's own profile
export async function PUT(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (!session.isLoggedIn || !session.employeeId) {
      return NextResponse.json({ success: false, error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const body = await request.json();
    const toNull = (v: any) => (v === '' || v === undefined ? null : v);

    const updated = await prisma.employee.update({
      where: { id: session.employeeId },
      data: {
        nama: body.nama || undefined,
        gelarDepan: toNull(body.gelarDepan),
        gelarBelakang: toNull(body.gelarBelakang),
        tempatLahir: toNull(body.tempatLahir),
        tanggalLahir: body.tanggalLahir ? new Date(body.tanggalLahir) : null,
        jenisKelamin: toNull(body.jenisKelamin),
        agama: toNull(body.agama),
        alamat: toNull(body.alamat),
        telepon: toNull(body.telepon),
        email: toNull(body.email),
        unitKerja: toNull(body.unitKerja),
        jabatanAkademik: toNull(body.jabatanAkademik),
        jabatanStruktural: toNull(body.jabatanStruktural),
        foto: toNull(body.foto),
        nip: toNull(body.nip),
        nidn: toNull(body.nidn),
        nidk: toNull(body.nidk),
      },
    });

    return NextResponse.json({ success: true, data: updated, message: 'Profil berhasil diperbarui' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
