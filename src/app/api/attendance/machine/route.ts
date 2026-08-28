import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    // Mesin absensi biasanya mengirimkan data dalam bentuk JSON
    const body = await request.json();
    
    // Contoh format yang diharapkan dari mesin/script penarik data:
    // {
    //   "userId": "12345",      // ID User di mesin sidik jari (bisa disamakan dengan NIP)
    //   "timestamp": "2023-10-25T07:30:00Z", // Waktu scan dalam format ISO
    //   "apiKey": "SECRET_KEY"  // Keamanan sederhana
    // }
    const { userId, timestamp, apiKey } = body;

    // 1. Verifikasi Keamanan (Opsional namun disarankan)
    if (apiKey !== 'KODE_RAHASIA_KANTOR_123') {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    if (!userId || !timestamp) {
      return NextResponse.json({ success: false, message: 'Data tidak lengkap (butuh userId dan timestamp)' }, { status: 400 });
    }

    // 2. Cari pegawai berdasarkan userId (misal kita asumsikan userId di mesin = NIP pegawai)
    const employee = await prisma.employee.findFirst({
      where: {
        nip: userId
      }
    });

    if (!employee) {
      return NextResponse.json({ success: false, message: `Pegawai dengan NIP/UserID ${userId} tidak ditemukan di sistem` }, { status: 404 });
    }

    // 3. Konversi timestamp dari mesin ke objek Date JavaScript
    const scanTime = new Date(timestamp);
    const scanDateOnly = new Date(scanTime.getFullYear(), scanTime.getMonth(), scanTime.getDate());
    
    // 4. Cek apakah hari ini sudah ada presensi untuk pegawai tersebut
    const existingAttendance = await prisma.attendance.findFirst({
      where: {
        employeeId: employee.id,
        tanggal: {
          gte: scanDateOnly,
          lt: new Date(scanDateOnly.getTime() + 24 * 60 * 60 * 1000)
        }
      }
    });

    if (!existingAttendance) {
      // JIKA BELUM ADA: Berarti ini adalah JAM MASUK (Clock In)
      // Tentukan status masuk berdasarkan jam (contoh: batas masuk jam 08:00)
      const hours = scanTime.getHours();
      const minutes = scanTime.getMinutes();
      const isLate = (hours > 8) || (hours === 8 && minutes > 0);

      await prisma.attendance.create({
        data: {
          employeeId: employee.id,
          tanggal: scanTime,
          jamMasuk: scanTime,
          statusMasuk: isLate ? 'TERLAMBAT' : 'TEPAT_WAKTU',
          catatan: 'Dari Mesin Sidik Jari'
        }
      });

      return NextResponse.json({ success: true, message: 'Berhasil mencatat JAM MASUK via Sidik Jari', employee: employee.nama });
    
    } else {
      // JIKA SUDAH ADA: Berarti ini adalah JAM PULANG (Clock Out)
      // Bisa juga ditambahkan logika untuk mencegah double-scan dalam waktu berdekatan
      
      const timeDiffMinutes = (scanTime.getTime() - new Date(existingAttendance.jamMasuk!).getTime()) / (1000 * 60);
      
      if (timeDiffMinutes < 5) {
        return NextResponse.json({ success: false, message: 'Scan terlalu cepat, diabaikan untuk mencegah double-scan' });
      }

      await prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: {
          jamPulang: scanTime,
          statusPulang: 'TEPAT_WAKTU',
          catatan: existingAttendance.catatan === 'Dari Mesin Sidik Jari' 
            ? 'Dari Mesin Sidik Jari' 
            : existingAttendance.catatan + ' & Sidik Jari (Pulang)'
        }
      });

      return NextResponse.json({ success: true, message: 'Berhasil mencatat JAM PULANG via Sidik Jari', employee: employee.nama });
    }

  } catch (error: any) {
    console.error('API Mesin Absensi Error:', error);
    return NextResponse.json({ success: false, message: 'Terjadi kesalahan server internal' }, { status: 500 });
  }
}
