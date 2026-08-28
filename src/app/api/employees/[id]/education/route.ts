import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const history = await prisma.educationHistory.findMany({
      where: { employeeId: id },
      orderBy: { tahunLulus: 'desc' },
    });
    return NextResponse.json({ success: true, data: history });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Gagal mengambil riwayat' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    if (!body.jenjang || !body.institusi) {
      return NextResponse.json({ success: false, message: 'Jenjang dan Institusi wajib' }, { status: 400 });
    }

    const newHistory = await prisma.educationHistory.create({
      data: {
        employeeId: id,
        jenjang: body.jenjang,
        institusi: body.institusi,
        jurusan: body.jurusan || null,
        tahunMasuk: body.tahunMasuk ? parseInt(body.tahunMasuk) : null,
        tahunLulus: body.tahunLulus ? parseInt(body.tahunLulus) : null,
        nomorIjazah: body.nomorIjazah || null,
        ipk: body.ipk ? parseFloat(body.ipk) : null,
      }
    });
    return NextResponse.json({ success: true, data: newHistory, message: 'Berhasil tambah riwayat pendidikan' });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Gagal tambah riwayat' }, { status: 500 });
  }
}
