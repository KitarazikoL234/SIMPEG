const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Update semua dokumen: hapus link Google Drive palsu, ganti jadi tipe UPLOAD
  const result = await prisma.document.updateMany({
    data: { 
      tipeFile: 'UPLOAD', 
      linkRepository: null,
      filePath: null
    }
  });
  console.log('✅ Updated', result.count, 'dokumen (link palsu dihapus)');
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
