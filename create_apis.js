const fs = require('fs/promises');
const path = require('path');

async function createFiles() {
  const baseDir = 'C:\\Users\\lasah\\.gemini\\antigravity\\scratch\\simpeg-stikes-baktara';
  const apiDir = path.join(baseDir, 'src', 'app', 'api');
  const appDir = path.join(baseDir, 'src', 'app', '(dashboard)');
  
  const files = [
    {
      dir: path.join(apiDir, 'documents'),
      name: 'route.ts',
      content: `import { NextResponse } from 'next/server';
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
}`
    },
    {
      dir: path.join(apiDir, 'documents', '[id]'),
      name: 'route.ts',
      content: `import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const document = await prisma.document.findUnique({
      where: { id },
      include: { employee: true },
    });
    if (!document) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: document });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const document = await prisma.document.update({
      where: { id },
      data: body,
    });
    return NextResponse.json({ success: true, data: document });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const document = await prisma.document.findUnique({ where: { id } });
    if (!document) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    if (document.tipeFile === 'UPLOAD' && document.filePath) {
      try {
        await fs.unlink(path.join(process.cwd(), 'public', document.filePath));
      } catch (e) {
        console.error('File to delete not found', e);
      }
    }

    await prisma.document.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}`
    },
    {
      dir: path.join(apiDir, 'documents', '[id]', 'download'),
      name: 'route.ts',
      content: `import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const document = await prisma.document.findUnique({ where: { id } });
    
    if (!document) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    
    if (document.tipeFile === 'LINK' && document.linkRepository) {
      return NextResponse.redirect(document.linkRepository);
    }
    
    if (document.tipeFile === 'UPLOAD' && document.filePath) {
      const fullPath = path.join(process.cwd(), 'public', document.filePath);
      if (!fs.existsSync(fullPath)) {
        return NextResponse.json({ success: false, error: 'File not found on disk' }, { status: 404 });
      }
      
      const fileBuffer = fs.readFileSync(fullPath);
      const fileName = path.basename(document.filePath);
      
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Disposition': \`attachment; filename="\${fileName}"\`,
          'Content-Type': 'application/pdf',
        },
      });
    }
    
    return NextResponse.json({ success: false, error: 'Invalid document file type' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}`
    },
    {
      dir: path.join(apiDir, 'upload'),
      name: 'route.ts',
      content: `import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }
    
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ success: false, error: 'Only PDF files are allowed' }, { status: 400 });
    }
    
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'File size exceeds 10MB limit' }, { status: 400 });
    }
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'documents');
    await fs.mkdir(uploadDir, { recursive: true });
    
    const uuid = crypto.randomUUID();
    const ext = path.extname(file.name);
    const fileName = \`\${uuid}\${ext}\`;
    const relativePath = \`/uploads/documents/\${fileName}\`;
    const absolutePath = path.join(uploadDir, fileName);
    
    await fs.writeFile(absolutePath, buffer);
    
    return NextResponse.json({ 
      success: true, 
      data: {
        filePath: relativePath,
        ukuranFile: file.size,
        fileName: file.name
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}`
    },
    {
      dir: path.join(apiDir, 'attendance'),
      name: 'route.ts',
      content: `import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    
    const where: any = {
      tanggal: {
        gte: startDate,
        lte: endDate,
      }
    };
    
    if (employeeId) where.employeeId = employeeId;
    
    const attendances = await prisma.attendance.findMany({
      where,
      include: { employee: { select: { nama: true, unitKerja: true } } },
      orderBy: { tanggal: 'desc' },
    });
    
    return NextResponse.json({ success: true, data: attendances });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { employeeId, type, foto, latitude, longitude, catatan } = body;
    
    if (!employeeId || !type) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }
    
    const now = new Date();
    // Normalize date to midnight local time for the "tanggal" field
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const existingRecord = await prisma.attendance.findFirst({
      where: {
        employeeId,
        tanggal: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    });

    // Check if late (after 08:00 AM)
    const clockTime = now.getHours() * 60 + now.getMinutes();
    const threshold = 8 * 60; // 08:00 AM
    const isLate = clockTime > threshold;
    const statusMasuk = isLate ? 'TERLAMBAT' : 'TEPAT_WAKTU';

    if (type === 'masuk') {
      if (existingRecord) {
        return NextResponse.json({ success: false, error: 'Already clocked in today' }, { status: 400 });
      }
      
      const newRecord = await prisma.attendance.create({
        data: {
          employeeId,
          tanggal: today,
          jamMasuk: now,
          statusMasuk,
          fotoMasuk: foto,
          latitude,
          longitude,
          catatan
        }
      });
      return NextResponse.json({ success: true, data: newRecord });
    } else if (type === 'pulang') {
      if (!existingRecord) {
        return NextResponse.json({ success: false, error: 'No clock in record found for today' }, { status: 400 });
      }
      if (existingRecord.jamPulang) {
        return NextResponse.json({ success: false, error: 'Already clocked out today' }, { status: 400 });
      }
      
      const updatedRecord = await prisma.attendance.update({
        where: { id: existingRecord.id },
        data: {
          jamPulang: now,
          statusPulang: 'TEPAT_WAKTU', // simplified for now
          fotoPulang: foto,
          latitude,
          longitude, // Update to latest location
          catatan: existingRecord.catatan ? \`\${existingRecord.catatan} | \${catatan || ''}\` : catatan
        }
      });
      return NextResponse.json({ success: true, data: updatedRecord });
    }
    
    return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}`
    },
    {
      dir: path.join(apiDir, 'attendance', 'today'),
      name: 'route.ts',
      content: `import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    
    if (!employeeId) {
      return NextResponse.json({ success: false, error: 'Employee ID required' }, { status: 400 });
    }
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const record = await prisma.attendance.findFirst({
      where: {
        employeeId,
        tanggal: {
          gte: today,
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    });
    
    return NextResponse.json({
      success: true,
      data: {
        hasClockIn: !!record?.jamMasuk,
        hasClockOut: !!record?.jamPulang,
        clockInTime: record?.jamMasuk,
        clockOutTime: record?.jamPulang
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}`
    },
    {
      dir: path.join(apiDir, 'attendance', 'recap'),
      name: 'route.ts',
      content: `import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') || (new Date().getMonth() + 1).toString());
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString());
    const unitKerja = searchParams.get('unitKerja');
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    
    const employeeWhere: any = {};
    if (unitKerja) employeeWhere.unitKerja = unitKerja;
    
    const employees = await prisma.employee.findMany({
      where: employeeWhere,
      include: {
        attendances: {
          where: {
            tanggal: {
              gte: startDate,
              lte: endDate
            }
          }
        }
      }
    });
    
    const data = employees.map(emp => {
      const attendances = emp.attendances;
      let tepatWaktu = 0;
      let terlambat = 0;
      
      attendances.forEach(att => {
        if (att.statusMasuk === 'TEPAT_WAKTU') tepatWaktu++;
        if (att.statusMasuk === 'TERLAMBAT') terlambat++;
      });
      
      return {
        id: emp.id,
        nama: emp.nama,
        nip: emp.nip,
        unitKerja: emp.unitKerja,
        hadir: attendances.length,
        tepatWaktu,
        terlambat,
        tidakHadir: 20 - attendances.length // assuming 20 working days for now
      };
    });
    
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}`
    },
    {
      dir: path.join(apiDir, 'search'),
      name: 'route.ts',
      content: `import { NextResponse } from 'next/server';
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
}`
    }
  ];

  for (const f of files) {
    await fs.mkdir(f.dir, { recursive: true });
    await fs.writeFile(path.join(f.dir, f.name), f.content);
    console.log('Created: ' + path.join(f.dir, f.name));
  }
}

createFiles().catch(console.error);
