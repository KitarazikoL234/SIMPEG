import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function run() {
  const records = await prisma.attendance.findMany();
  let count = 0;
  for (const rec of records) {
    if (rec.catatan && rec.catatan.includes('Lokasi tidak tersedia')) {
      const newNote = rec.catatan.replace(/Lokasi tidak tersedia/g, 'Verifikasi Face Selfie');
      await prisma.attendance.update({ where: { id: rec.id }, data: { catatan: newNote }});
      count++;
    }
  }
  console.log('Fixed ' + count + ' records');
}
run();
