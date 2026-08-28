import { NextResponse } from 'next/server';
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
    const { employeeId, type, foto, latitude, longitude, catatan, alamat, jamMulai, jamSelesai } = body;
    
    if (!employeeId || !type) {
      return NextResponse.json({ success: false, error: 'Parameter employeeId dan type wajib diisi' }, { status: 400 });
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

    // Check if late based on configured jamMulai (default 08:00)
    const [startH, startM] = (jamMulai || '08:00').split(':').map(Number);
    const thresholdMinutes = (startH || 8) * 60 + (startM || 0);
    const clockMinutes = now.getHours() * 60 + now.getMinutes();
    const isLate = clockMinutes > thresholdMinutes;
    const statusMasuk = isLate ? 'TERLAMBAT' : 'TEPAT_WAKTU';

    // Check if early leave based on configured jamSelesai (default 16:00)
    const [endH, endM] = (jamSelesai || '16:00').split(':').map(Number);
    const leaveThreshold = (endH || 16) * 60 + (endM || 0);
    const isEarlyLeave = clockMinutes < leaveThreshold;
    const statusPulang = isEarlyLeave ? 'PULANG_AWAL' : 'TEPAT_WAKTU';

    const locationText = alamat || (latitude && longitude ? `Koordinat: ${latitude.toFixed(5)}, ${longitude.toFixed(5)}` : 'Lokasi tidak tersedia');

    if (type === 'masuk') {
      if (existingRecord) {
        // If already clocked in, update the record with the new photo & location
        const updatedRecord = await prisma.attendance.update({
          where: { id: existingRecord.id },
          data: {
            fotoMasuk: foto || existingRecord.fotoMasuk,
            latitude: latitude || existingRecord.latitude,
            longitude: longitude || existingRecord.longitude,
            catatan: locationText
          }
        });
        return NextResponse.json({ success: true, data: updatedRecord, message: 'Data presensi masuk berhasil diperbarui' });
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
          catatan: locationText
        }
      });
      return NextResponse.json({ success: true, data: newRecord, message: 'Presensi masuk berhasil dicatat' });
    } else if (type === 'pulang') {
      if (!existingRecord) {
        // If clocking out without prior clock-in, create record with both masuk & pulang
        const newRecord = await prisma.attendance.create({
          data: {
            employeeId,
            tanggal: today,
            jamMasuk: now,
            statusMasuk,
            jamPulang: now,
            statusPulang,
            fotoPulang: foto,
            latitude,
            longitude,
            catatan: `Pulang: ${locationText}`
          }
        });
        return NextResponse.json({ success: true, data: newRecord, message: 'Presensi pulang berhasil dicatat' });
      }
      
      const baseNote = existingRecord.catatan ? existingRecord.catatan.split(' | Pulang:')[0] : '';
      const updatedNotes = baseNote 
        ? `${baseNote} | Pulang: ${locationText}`
        : `Pulang: ${locationText}`;

      const updatedRecord = await prisma.attendance.update({
        where: { id: existingRecord.id },
        data: {
          jamPulang: now,
          statusPulang,
          fotoPulang: foto || existingRecord.fotoPulang,
          latitude: latitude || existingRecord.latitude,
          longitude: longitude || existingRecord.longitude,
          catatan: updatedNotes
        }
      });
      return NextResponse.json({ success: true, data: updatedRecord, message: 'Presensi pulang berhasil dicatat dan diperbarui' });
    }
    
    return NextResponse.json({ success: false, error: 'Tipe presensi tidak valid' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
