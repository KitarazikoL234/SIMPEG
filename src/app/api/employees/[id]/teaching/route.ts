import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const history = await prisma.teachingHistory.findMany({
      where: { employeeId: id },
      orderBy: { tahunAkademik: 'desc' },
    });
    return NextResponse.json({ success: true, data: history });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Gagal mengambil riwayat mengajar' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    if (!body.semester || !body.tahunAkademik || !body.mataKuliah || !body.sks) {
      return NextResponse.json({ success: false, message: 'Data wajib belum lengkap' }, { status: 400 });
    }

    const newHistory = await prisma.teachingHistory.create({
      data: {
        employeeId: id,
        semester: body.semester,
        tahunAkademik: body.tahunAkademik,
        mataKuliah: body.mataKuliah,
        sks: parseInt(body.sks),
        kelas: body.kelas || null,
        programStudi: body.programStudi || null,
      }
    });
    return NextResponse.json({ success: true, data: newHistory, message: 'Berhasil tambah riwayat mengajar' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Gagal tambah riwayat mengajar' }, { status: 500 });
  }
}
