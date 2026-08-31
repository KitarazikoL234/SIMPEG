const fs = require('fs');
const file = 'src/app/(dashboard)/presensi/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldCode =   const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      setError('Sistem kamera belum siap.');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;;

const newCode =   const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      setError('Sistem kamera belum siap.');
      return;
    }

    // Validasi jam kerja (hanya bisa absen maksimal 2 jam sebelum jam mulai)
    if (!todayRecord?.hasClockIn) {
      const [startH, startM] = jamMulai.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      
      if (currentMinutes < startMinutes - 120) {
        const allowedH = Math.floor((startMinutes - 120) / 60);
        const allowedM = (startMinutes - 120) % 60;
        setError(\Belum masuk waktu presensi. Anda baru bisa absen masuk mulai pukul \:\ WIB.\);
        return;
      }
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;;

code = code.replace(oldCode, newCode);
fs.writeFileSync(file, code);
console.log('Fixed takePhoto!');
