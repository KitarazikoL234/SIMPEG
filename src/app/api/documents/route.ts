import { NextResponse } from 'next/server';
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/auth";
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    
    if (!session.isLoggedIn) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const kategoriUtama = searchParams.get('kategoriUtama');
    const subKategori = searchParams.get('subKategori');
    const status = searchParams.get('status');
    // If Admin/Pimpinan, they can filter by employeeId. Otherwise, force to their own employeeId.
    let employeeId = searchParams.get('employeeId');
    
    if (session.role !== 'ADMIN' && session.role !== 'PIMPINAN') {
      if (!session.employeeId) {
        return NextResponse.json({ success: false, error: 'User does not have an employee profile' }, { status: 403 });
      }
      employeeId = session.employeeId;
    }

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
    
    const approvalStatus = searchParams.get('approvalStatus');
    if (approvalStatus) where.approvalStatus = approvalStatus;

    if (status) {
      where.status = status;
    } else {
      where.status = { not: 'DIHAPUS' };
    }
    if (employeeId) where.employeeId = employeeId;
    if (tahunAkademik) where.tahunAkademik = tahunAkademik;

    const [total, documents] = await Promise.all([
      prisma.document.count({ where }),
      prisma.document.findMany({
        where,
        include: { employee: { select: { nama: true, id: true } } },
        orderBy: [
          { isPinned: 'desc' },
          { createdAt: 'desc' }
        ],
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
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    
    if (!session.isLoggedIn) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

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
      employeeId, uploadedById, taggedEmployees
    } = body;

    // Prevent Dosen/Tendik from uploading documents to other employee profiles
    if (session.role !== 'ADMIN' && session.role !== 'PIMPINAN') {
      if (employeeId !== session.employeeId) {
        return NextResponse.json({ success: false, error: 'You can only upload documents for yourself' }, { status: 403 });
      }
    }

    if (!judul || !kategoriUtama || !subKategori || !tanggalTerbit || !employeeId) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const autoApprove = (session.role === 'ADMIN' || session.role === 'PIMPINAN');
    const approvalStatus = autoApprove ? 'APPROVED' : 'PENDING';

    const documentData = {
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
      uploadedById,
      status: 'AKTIF',
      approvalStatus,
    };

    // 1. Create document for the primary employee
    const document = await prisma.document.create({
      data: {
        ...documentData,
        employeeId,
      },
    });

    // 2. If there are tagged employees, create a copy for each of them
    if (Array.isArray(taggedEmployees) && taggedEmployees.length > 0) {
      const copies = taggedEmployees.map((tag: any) => {
        if (typeof tag === 'string') {
          return {
            ...documentData,
            employeeId: tag,
          };
        } else {
          return {
            ...documentData,
            employeeId: tag.id,
            tipeFile: tag.tipeFile || documentData.tipeFile,
            filePath: tag.filePath !== undefined ? tag.filePath : documentData.filePath,
            linkRepository: tag.linkRepository !== undefined ? tag.linkRepository : documentData.linkRepository,
            ukuranFile: tag.ukuranFile !== undefined ? tag.ukuranFile : documentData.ukuranFile,
          };
        }
      });
      
      await prisma.document.createMany({
        data: copies
      });
    }

    return NextResponse.json({ success: true, data: document });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
