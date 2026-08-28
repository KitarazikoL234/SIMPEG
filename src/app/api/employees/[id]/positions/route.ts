import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const history = await prisma.positionHistory.findMany({
      where: { employeeId: id },
      orderBy: { tmt: 'desc' },
    });
    return NextResponse.json({ success: true, data: history });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Gagal mengambil riwayat jabatan' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    if (!body.jabatan || !body.tmt) {
      return NextResponse.json({ success: false, message: 'Jabatan dan TMT wajib' }, { status: 400 });
    }

    const newHistory = await prisma.positionHistory.create({
      data: {
        employeeId: id,
        jabatan: body.jabatan,
        pangkat: body.pangkat || null,
        golongan: body.golongan || null,
        tmt: new Date(body.tmt),
        nomorSK: body.nomorSK || null,
        catatan: body.catatan || null,
      }
    });
    return NextResponse.json({ success: true, data: newHistory, message: 'Berhasil tambah riwayat jabatan' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Gagal tambah riwayat jabatan' }, { status: 500 });
  }
}
