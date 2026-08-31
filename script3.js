const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fix() {
  const records = await prisma.attendance.findMany();
  for (const rec of records) {
    if (rec.catatan) {
      let newNote = rec.catatan.replace(/Lokasi tidak tersedia/g, 'Verifikasi Face Selfie');
      if (newNote !== rec.catatan) {
        await prisma.attendance.update({
          where: { id: rec.id },
          data: { catatan: newNote }
        });
        console.log('Fixed', rec.id);
      }
    }
  }
}

fix()
  .catch(console.error)
  .finally(() => prisma.());
