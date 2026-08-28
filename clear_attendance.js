const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  await prisma.attendance.deleteMany({});
  console.log('Riwayat presensi dikosongkan!');
}
main().catch(console.error).finally(() => prisma.$disconnect());
