import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const tipe = searchParams.get('tipeKepegawaian');
    const status = searchParams.get('statusKepegawaian');
    const unitKerja = searchParams.get('unitKerja');
    
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const where: Prisma.EmployeeWhereInput = {
      ...(search && {
        OR: [
          { nama: { contains: search } },
          { nip: { contains: search } },
          { nidn: { contains: search } },
        ],
      }),
      ...(tipe && { tipeKepegawaian: tipe }),
      ...(status && { statusKepegawaian: status }),
      ...(unitKerja && { unitKerja: unitKerja }),
    };

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip,
        take: limit,
        orderBy: { nama: 'asc' },
      }),
      prisma.employee.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        data: employees,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data pegawai' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Basic validation
    if (!body.nama || !body.tipeKepegawaian) {
      return NextResponse.json(
        { success: false, message: 'Nama dan Tipe Kepegawaian wajib diisi' },
        { status: 400 }
      );
    }

    const newEmployee = await prisma.employee.create({
      data: {
        nip: body.nip || null,
        nidn: body.nidn || null,
        nidk: body.nidk || null,
        nama: body.nama,
        gelarDepan: body.gelarDepan || null,
        gelarBelakang: body.gelarBelakang || null,
        tempatLahir: body.tempatLahir || null,
        tanggalLahir: body.tanggalLahir ? new Date(body.tanggalLahir) : null,
        jenisKelamin: body.jenisKelamin || null,
        agama: body.agama || null,
        alamat: body.alamat || null,
        telepon: body.telepon || null,
        email: body.email || null,
        tipeKepegawaian: body.tipeKepegawaian,
        statusKepegawaian: body.statusKepegawaian || 'AKTIF',
        unitKerja: body.unitKerja || null,
        jabatanAkademik: body.jabatanAkademik || null,
        jabatanStruktural: body.jabatanStruktural || null,
        pangkat: body.pangkat || null,
        golongan: body.golongan || null,
        rumpunIlmu: body.rumpunIlmu || null,
        sertifikasiPendidik: body.sertifikasiPendidik || false,
        nomorSertifikasi: body.nomorSertifikasi || null,
        tmtPertama: body.tmtPertama ? new Date(body.tmtPertama) : null,
      },
    });

    return NextResponse.json({
      success: true,
      data: newEmployee,
      message: 'Berhasil menambahkan pegawai baru',
    });
  } catch (error) {
    console.error('Error creating employee:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menambahkan pegawai' },
      { status: 500 }
    );
  }
}
