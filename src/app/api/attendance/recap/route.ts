import { NextResponse } from 'next/server';
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
}
