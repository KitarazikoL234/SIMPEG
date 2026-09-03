import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    
    if (!q || q.length < 2) {
      return NextResponse.json({ success: true, data: [] });
    }
    
    const [employees, documents] = await Promise.all([
      prisma.employee.findMany({
        where: {
          OR: [
            { nama: { contains: q } },
            { nip: { contains: q } },
            { nidn: { contains: q } }
          ]
        },
        take: 5
      }),
      prisma.document.findMany({
        where: {
          status: { not: 'DIHAPUS' },
          OR: [
            { judul: { contains: q } },
            { nomorDokumen: { contains: q } }
          ]
        },
        take: 5
      })
    ]);
    
    const results = [
      ...employees.map(e => ({ type: 'employee', id: e.id, title: e.nama, subtitle: e.nip || e.nidn || 'Pegawai' })),
      ...documents.map(d => ({ type: 'document', id: d.id, title: d.judul, subtitle: d.nomorDokumen || 'Dokumen' }))
    ];
    
    return NextResponse.json({ success: true, data: results });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
