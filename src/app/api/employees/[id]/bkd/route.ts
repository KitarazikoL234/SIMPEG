import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;
    const semester = searchParams.get('semester');
    const tahunAkademik = searchParams.get('tahunAkademik');

    const where: Prisma.DocumentWhereInput = {
      employeeId: id,
      status: { not: 'DIHAPUS' },
      ...(semester && { semester }),
      ...(tahunAkademik && { tahunAkademik }),
    };

    const documents = await prisma.document.findMany({
      where,
      orderBy: { tanggalTerbit: 'desc' },
    });

    // Group documents by kategoriUtama
    const groupedDocuments = documents.reduce((acc, doc) => {
      const category = doc.kategoriUtama as string;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(doc);
      return acc;
    }, {} as Record<string, any[]>);

    return NextResponse.json({ success: true, data: groupedDocuments });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data dokumen BKD' },
      { status: 500 }
    );
  }
}
