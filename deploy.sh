#!/bin/bash

# ==============================================================================
# SCRIPT DEPLOYMENT SIMPEG UNTUK VPS UBUNTU (IDCloudHost)
# ==============================================================================
# Script ini akan menginstal Node.js, PM2, dan Nginx (jika belum ada),
# lalu mem-build dan menjalankan aplikasi SIMPEG di latar belakang.
#
# Cara Penggunaan:
# 1. Pindahkan folder project ini ke server (misal ke /var/www/simpeg-baktara)
# 2. Buka terminal server, arahkan ke folder tersebut
# 3. Jalankan perintah: sudo bash deploy.sh
# ==============================================================================

echo "🚀 Memulai proses instalasi dan deployment SIMPEG..."

# 1. Cek & Install Node.js (Versi 20 LTS)
if ! command -v node &> /dev/null; then
    echo "📦 Menginstal Node.js (Versi 20)..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "✅ Node.js sudah terinstal: $(node -v)"
fi

# 2. Cek & Install PM2
if ! command -v pm2 &> /dev/null; then
    echo "📦 Menginstal PM2..."
    sudo npm install -g pm2
else
    echo "✅ PM2 sudah terinstal"
fi

# 3. Install Dependensi Aplikasi
echo "📦 Menginstal package NPM aplikasi..."
npm install

# 4. Push Database MySQL
echo "🗄️ Menyiapkan database MySQL..."
# Pastikan Anda sudah membuat database kosong bernama "simpeg_baktara" di MySQL server Anda
# dan menyesuaikan DATABASE_URL di file .env
npx prisma generate
npx prisma db push

# Opsional: Jika ingin memasukkan data dummy (Pegawai & Dokumen)
# npx ts-node prisma/seed.ts
# npx ts-node prisma/seed-documents.ts

# 5. Build Aplikasi Next.js
echo "🏗️ Membangun (Build) aplikasi untuk Production..."
npm run build

# 6. Jalankan dengan PM2
echo "🚀 Menjalankan aplikasi dengan PM2..."
pm2 stop simpeg-baktara || true
pm2 delete simpeg-baktara || true
pm2 start npm --name "simpeg-baktara" -- run start -- -p 3000
pm2 save
pm2 startup

echo "====================================================================="
echo "🎉 DEPLOYMENT SELESAI!"
echo "Aplikasi berjalan di port 3000 (http://10.111.175.218:3000)"
echo ""
echo "Untuk menghubungkan ke Domain/Subdomain Anda tanpa port 3000,"
echo "Anda bisa mengatur Nginx Proxy Pass ke port 3000."
echo "====================================================================="
