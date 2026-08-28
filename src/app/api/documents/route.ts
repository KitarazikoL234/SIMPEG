import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const kategoriUtama = searchParams.get('kategoriUtama');
    const subKategori = searchParams.get('subKategori');
    const status = searchParams.get('status');
    const employeeId = searchParams.get('employeeId');
    const tahunAkademik = searchParams.get('tahunAkademik');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: any = {};

    if (q) {
      where.OR = [
        { judul: { contains: q } },
        { nomorDokumen: { contains: q } },
        { employee: { nama: { contains: q } } }
      ];
    }
    if (kategoriUtama) where.kategoriUtama = kategoriUtama;
    if (subKategori) where.subKategori = subKategori;
    if (status) where.status = status;
    if (employeeId) where.employeeId = employeeId;
    if (tahunAkademik) where.tahunAkademik = tahunAkademik;

    const [total, documents] = await Promise.all([
      prisma.document.count({ where }),
      prisma.document.findMany({
        where,
        include: { employee: { select: { nama: true, id: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        data: documents,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let body: any = {};

    if (contentType.includes('application/json')) {
      body = await request.json();
    } else if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      formData.forEach((value, key) => {
        body[key] = value;
      });
    }

    const {
      judul, nomorDokumen, kategoriUtama, subKategori,
      tanggalTerbit, masaBerlaku, semester, tahunAkademik,
      tipeFile, filePath, linkRepository, ukuranFile, catatan,
      employeeId, uploadedById
    } = body;

    if (!judul || !kategoriUtama || !subKategori || !tanggalTerbit || !employeeId) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const document = await prisma.document.create({
      data: {
        judul,
        nomorDokumen,
        kategoriUtama,
        subKategori,
        tanggalTerbit: new Date(tanggalTerbit),
        masaBerlaku: masaBerlaku ? new Date(masaBerlaku) : null,
        semester,
        tahunAkademik,
        tipeFile: tipeFile || 'UPLOAD',
        filePath,
        linkRepository,
        ukuranFile: ukuranFile ? parseInt(ukuranFile) : null,
        catatan,
        employeeId,
        uploadedById,
        status: 'AKTIF',
      },
    });

    return NextResponse.json({ success: true, data: document });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
