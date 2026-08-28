# Panduan Deployment SIMPEG ke VPS Ubuntu

Panduan ini disesuaikan untuk spesifikasi server dari gambar yang Anda berikan (VPS Ubuntu 24.04, RAM 2GB, MySQL 8.0).

## 1. Persiapan Database MySQL
Aplikasi saat ini sudah diubah agar mendukung MySQL (Option B). 
1. Di VPS Anda, login ke MySQL:
   ```bash
   mysql -u root -p
   ```
2. Buat database baru untuk SIMPEG:
   ```sql
   CREATE DATABASE simpeg_baktara;
   ```
3. Sesuaikan koneksi di file `.env` dalam folder project:
   ```env
   DATABASE_URL="mysql://root:password_mysql_anda@localhost:3306/simpeg_baktara"
   ```

## 2. Mengunggah File Project ke VPS
1. Anda bisa menggunakan FTP (seperti FileZilla) atau `git clone` untuk memindahkan seluruh isi folder project ke server Anda. 
2. Rekomendasi lokasi folder: `/var/www/simpeg-baktara`

## 3. Proses Instalasi & Menjalankan (Langkah Otomatis)
Kami telah menyediakan skrip otomatis untuk mempermudah pekerjaan Anda.

1. Buka terminal (SSH) VPS Anda, arahkan ke folder project:
   ```bash
   cd /var/www/simpeg-baktara
   ```
2. Jalankan skrip deploy:
   ```bash
   sudo bash deploy.sh
   ```
   *Skrip ini akan otomatis:*
   - Memastikan **Node.js** terinstal.
   - Menginstal **PM2** (agar aplikasi berjalan terus di background).
   - Mengunduh dependensi (`npm install`).
   - Menyinkronkan tabel ke database MySQL (`npx prisma db push`).
   - Membangun aplikasi (`npm run build`).
   - Menyalakan aplikasi di latar belakang.

## 4. (Opsional) Menggunakan Domain Anda (Nginx)
Jika Anda menggunakan Nginx, cukup buat Server Block baru:

```nginx
server {
    listen 80;
    server_name simpeg.domainanda.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```
Lalu jalankan `sudo systemctl restart nginx`.
Aplikasi SIMPEG Anda sudah online sepenuhnya! 🚀
