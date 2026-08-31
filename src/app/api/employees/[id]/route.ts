import { NextRequest, NextResponse } from 'next/server';
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/auth";
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    const { id } = await params;
    
    const employee = await prisma.employee.findUnique({
      where: { id },
      include: {
        educationHistory: { orderBy: { tahunLulus: 'desc' } },
        positionHistory: { orderBy: { tmt: 'desc' } },
        teachingHistory: { orderBy: { tahunAkademik: 'desc' } },
        documents: { orderBy: { tanggalTerbit: 'desc' } },
        user: { select: { id: true, email: true, role: true, isActive: true } },
      },
    });

    if (!employee) {
      return NextResponse.json(
        { success: false, message: 'Pegawai tidak ditemukan' },
        { status: 404 }
      );
    }

    // Dokumen hanya bisa dilihat oleh pemiliknya sendiri, atau oleh ADMIN/PIMPINAN.
    if (session.role !== 'ADMIN' && session.role !== 'PIMPINAN') {
      if (employee.id !== session.employeeId) {
        // Strip documents if the user is not the owner and not an admin/pimpinan
        employee.documents = []; 
      }
    }

    return NextResponse.json({ success: true, data: employee });
  } catch (error) {
    console.error('Error fetching employee:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengambil data pegawai' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Convert empty strings to null for optional unique fields
    const toNull = (v: any) => (v === '' || v === undefined ? null : v);

    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: {
        nip: toNull(body.nip),
        nidn: toNull(body.nidn),
        nidk: toNull(body.nidk),
        nama: body.nama,
        gelarDepan: toNull(body.gelarDepan),
        gelarBelakang: toNull(body.gelarBelakang),
        tempatLahir: toNull(body.tempatLahir),
        tanggalLahir: body.tanggalLahir ? new Date(body.tanggalLahir) : null,
        jenisKelamin: toNull(body.jenisKelamin),
        agama: toNull(body.agama),
        alamat: toNull(body.alamat),
        telepon: toNull(body.telepon),
        email: toNull(body.email),
        tipeKepegawaian: body.tipeKepegawaian,
        statusKepegawaian: body.statusKepegawaian,
        unitKerja: toNull(body.unitKerja),
        jabatanAkademik: toNull(body.jabatanAkademik),
        jabatanStruktural: toNull(body.jabatanStruktural),
        pangkat: toNull(body.pangkat),
        golongan: toNull(body.golongan),
        rumpunIlmu: toNull(body.rumpunIlmu),
        sertifikasiPendidik: body.sertifikasiPendidik || false,
        nomorSertifikasi: toNull(body.nomorSertifikasi),
        tmtPertama: body.tmtPertama ? new Date(body.tmtPertama) : null,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedEmployee,
      message: 'Berhasil mengupdate data pegawai',
    });
  } catch (error) {
    console.error('Error updating employee:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal mengupdate data pegawai' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    await prisma.employee.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Berhasil menghapus data pegawai',
    });
  } catch (error) {
    console.error('Error deleting employee:', error);
    return NextResponse.json(
      { success: false, message: 'Gagal menghapus data pegawai' },
      { status: 500 }
    );
  }
}
