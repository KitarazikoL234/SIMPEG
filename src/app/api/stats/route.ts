import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalPegawai,
      totalDosen,
      totalTendik,
      totalDokumen,
      dokumenPendidikan,
      dokumenPenelitian,
      dokumenPengabdian,
      dokumenPenunjang,
      dokumenKepegawaian,
      recentDocuments,
      presensiHariIni,
      activeTickets,
    ] = await Promise.all([
      prisma.employee.count(),
      prisma.employee.count({ where: { tipeKepegawaian: "DOSEN" } }),
      prisma.employee.count({ where: { tipeKepegawaian: "TENDIK" } }),
      prisma.document.count(),
      prisma.document.count({ where: { kategoriUtama: "PENDIDIKAN" } }),
      prisma.document.count({ where: { kategoriUtama: "PENELITIAN" } }),
      prisma.document.count({ where: { kategoriUtama: "PENGABDIAN" } }),
      prisma.document.count({ where: { kategoriUtama: "PENUNJANG" } }),
      prisma.document.count({ where: { kategoriUtama: "KEPEGAWAIAN" } }),
      prisma.document.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { employee: { select: { nama: true, gelarDepan: true, gelarBelakang: true } } },
      }),
      prisma.attendance.count({
        where: {
          tanggal: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999)),
          },
          jamMasuk: { not: null },
        },
      }),
      prisma.ticket.count({
        where: {
          status: { in: ['BARU', 'OPEN', 'DIPROSES', 'IN_PROGRESS', 'TERTUNDA'] }
        }
      })
    ]);

    // Documents expiring within 30 days
    const now = new Date();
    const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const expiringDocuments = await prisma.document.findMany({
      where: {
        masaBerlaku: {
          gte: now,
          lte: thirtyDaysLater,
        },
        status: "AKTIF",
      },
      include: { employee: { select: { nama: true, gelarDepan: true, gelarBelakang: true } } },
      orderBy: { masaBerlaku: "asc" },
      take: 5,
    });

    const formatNama = (emp: { nama: string; gelarDepan?: string | null; gelarBelakang?: string | null }) => {
      const parts = [];
      if (emp.gelarDepan) parts.push(emp.gelarDepan);
      parts.push(emp.nama);
      if (emp.gelarBelakang) parts.push(emp.gelarBelakang);
      return parts.join(" ");
    };

    return NextResponse.json({
      totalPegawai,
      totalDosen,
      totalTendik,
      totalDokumen,
      activeTickets,
      presensiHariIni,
      dokumenPerKategori: [
        dokumenPendidikan,
        dokumenPenelitian,
        dokumenPengabdian,
        dokumenPenunjang,
        dokumenKepegawaian,
      ],
      dokumenTerbaru: recentDocuments.map((doc) => ({
        id: doc.id,
        judul: doc.judul,
        pegawai: formatNama(doc.employee),
        tanggal: doc.tanggalTerbit.toISOString(),
        kategori: doc.kategoriUtama,
        subKategori: doc.subKategori,
      })),
      dokumenKadaluarsa: expiringDocuments.map((doc) => ({
        id: doc.id,
        judul: doc.judul,
        pegawai: formatNama(doc.employee),
        kategori: doc.kategoriUtama,
        tanggal: doc.masaBerlaku!.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
        sisaHari: Math.ceil(
          (doc.masaBerlaku!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        ),
      })),
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
