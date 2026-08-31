const fs = require('fs');
const file = 'src/app/(dashboard)/presensi/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// Replace checkIsEarlyLeave
const oldCheckIsEarlyLeave =   const checkIsEarlyLeave = (clockOutTimeStr: string | Date | undefined | null) => {
    if (!clockOutTimeStr) return false;
    const d = new Date(clockOutTimeStr);
    const clockOutMinutes = d.getHours() * 60 + d.getMinutes();
    const [endH, endM] = jamSelesai.split(':').map(Number);
    const endMinutes = (endH || 16) * 60 + (endM || 0);
    return clockOutMinutes < endMinutes;
  };;

const newCheckIsEarlyLeave =   const getDynamicEndTime = (clockInTimeStr: any) => {
    if (!clockInTimeStr) return jamSelesai;
    const dIn = new Date(clockInTimeStr);
    const clockInMinutes = dIn.getHours() * 60 + dIn.getMinutes();

    const [startH, startM] = jamMulai.split(':').map(Number);
    const [endH, endM] = jamSelesai.split(':').map(Number);
    let workDurationMins = (endH * 60 + endM) - (startH * 60 + startM);
    if (workDurationMins <= 0) workDurationMins = 8 * 60;

    const expectedEndMinutes = clockInMinutes + workDurationMins;
    const outH = Math.floor(expectedEndMinutes / 60) % 24;
    const outM = expectedEndMinutes % 60;
    return \\:\\;
  };

  const checkIsEarlyLeave = (clockInTimeStr: any, clockOutTimeStr: any) => {
    if (!clockOutTimeStr || !clockInTimeStr) return false;
    const dOut = new Date(clockOutTimeStr);
    const clockOutMinutes = dOut.getHours() * 60 + dOut.getMinutes();
    
    const [endH, endM] = getDynamicEndTime(clockInTimeStr).split(':').map(Number);
    const expectedEndMinutes = endH * 60 + endM;
    
    return clockOutMinutes < expectedEndMinutes;
  };;

code = code.replace(oldCheckIsEarlyLeave, newCheckIsEarlyLeave);

// Update calls to checkIsEarlyLeave
code = code.replace(/checkIsEarlyLeave\(todayRecord\.clockOutTime\)/g, 'checkIsEarlyLeave(todayRecord?.clockInTime, todayRecord?.clockOutTime)');
code = code.replace(/checkIsEarlyLeave\(rec\.jamPulang\)/g, 'checkIsEarlyLeave(rec.jamMasuk, rec.jamPulang)');

// Update 'Bisa pulang pukul' text
code = code.replace(/Bisa pulang pukul: <span className="font-bold">\{jamSelesai\} WIB<\/span>/g, 'Bisa pulang pukul: <span className="font-bold">{getDynamicEndTime(todayRecord?.clockInTime)} WIB</span>');

// Update 'Jadwal Pulang' value in card
code = code.replace(/<p className="text-lg font-extrabold text-slate-700">\{jamSelesai\} WIB<\/p>/g, '<p className="text-lg font-extrabold text-slate-700">{getDynamicEndTime(todayRecord?.clockInTime)} WIB</p>');

fs.writeFileSync(file, code);
console.log('Fixed early leave logic!');
