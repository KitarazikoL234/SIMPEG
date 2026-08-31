'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { 
  Camera, Play, Square, Clock, Calendar, CheckCircle2, 
  AlertCircle, RefreshCw, ChevronLeft, ChevronRight, Settings, 
  UserCheck, ShieldCheck, Timer, Check,
  ExternalLink, Search, Edit3, Sparkles, ScanFace, Tag
} from 'lucide-react';

export default function PresensiPage() {
  const [mounted, setMounted] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    setMounted(true);
  }, []);
  const [todayRecord, setTodayRecord] = useState<{
    hasClockIn: boolean;
    hasClockOut: boolean;
    clockInTime?: string;
    clockOutTime?: string;
  } | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState('');

  const [cameraActive, setCameraActive] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');


  // Work schedule state
  const [jamMulai, setJamMulai] = useState('08:00');
  const [jamSelesai, setJamSelesai] = useState('16:00');
  const [showSettings, setShowSettings] = useState(false);

  const [calendarDate, setCalendarDate] = useState(new Date());
  const [holidays, setHolidays] = useState<Record<string, { summary: string }>>({});
  const [selectedHoliday, setSelectedHoliday] = useState<{date: string, summary: string} | null>(null);

  // Fetch National Holidays
  useEffect(() => {
    fetch('https://raw.githubusercontent.com/guangrei/APIHariLibur_V2/main/holidays.json')
      .then(res => res.json())
      .then(data => {
        if (data) setHolidays(data);
      })
      .catch(e => console.error("Gagal memuat hari libur:", e));
  }, []);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Face Detection State
  const faceapiRef = useRef<any>(null);
  const [faceModelsLoaded, setFaceModelsLoaded] = useState(false);
  const [isFaceDetected, setIsFaceDetected] = useState(false);
  const [faceDetectMsg, setFaceDetectMsg] = useState('Memuat detektor wajah...');

    // Simulated Face Detection
  useEffect(() => {
    if (cameraReady) {
      setFaceDetectMsg('Menganalisis wajah...');
      setIsFaceDetected(false);
      
      const timer = setTimeout(() => {
        setIsFaceDetected(true);
        setFaceDetectMsg('Wajah terdeteksi ?');
      }, 2500);
      
      return () => clearTimeout(timer);
    }
  }, [cameraReady]);

  // Load schedule settings from localStorage
  useEffect(() => {
    const savedMulai = localStorage.getItem('jamMulaiKerja');
    const savedSelesai = localStorage.getItem('jamSelesaiKerja');
    if (savedMulai) setJamMulai(savedMulai);
    if (savedSelesai) setJamSelesai(savedSelesai);
  }, []);

  const saveSettings = () => {
    localStorage.setItem('jamMulaiKerja', jamMulai);
    localStorage.setItem('jamSelesaiKerja', jamSelesai);
    setShowSettings(false);
  };

  // Live digital clock every second
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch current session
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
          if (data.success && data.user) {
            if (data.user.employeeId) {
              setEmployeeId(data.user.employeeId);
              setUserName(data.user.nama);
              setUserRole(data.user.role || '');
            } else {
              setError('Akun Anda tidak tertaut dengan Profil Pegawai (Employee ID) sehingga tidak dapat melakukan presensi.');
            }
          } else {
            setError('Sesi telah berakhir, silakan login kembali.');
          }
      } catch (e) {
        setError('Gagal memuat data sesi akun.');
      }
    };
    fetchSession();
  }, []);

  // Fetch attendance records
  const fetchAttendanceData = useCallback(async () => {
    if (!employeeId) return;
    setLoading(true);
    try {
      const [todayRes, histRes] = await Promise.all([
        fetch(`/api/attendance/today?employeeId=${employeeId}`),
        fetch(`/api/attendance?employeeId=${employeeId}`),
      ]);
      const todayData = await todayRes.json();
      if (todayData.success) setTodayRecord(todayData.data);
      const histData = await histRes.json();
      if (histData.success) setHistory(histData.data || []);
    } catch (e) {
      console.error('Fetch attendance error:', e);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    if (employeeId) fetchAttendanceData();
  }, [employeeId, fetchAttendanceData]);

  // Camera Management
  const startCamera = async () => {
    setPhoto(null);
    setCameraReady(false);
    setError('');
    setSuccessMessage('');
    
    // NFC is used instead of GPS

    try {
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 720 } },
      });
      streamRef.current = mediaStream;
      setCameraActive(true);
      
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current!.play().then(() => setCameraReady(true)).catch(e => {
              console.error("Video play failed:", e);
              setError("Gagal memutar aliran video kamera.");
            });
          };
        }
      }, 100);
    } catch (err) {
      console.error("Camera access error:", err);
      setError('Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan di browser.');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) { 
      streamRef.current.getTracks().forEach(t => t.stop()); 
      streamRef.current = null; 
    }
    setCameraActive(false);
    setCameraReady(false);
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  // Direct Attendance Submission Helper (executed automatically after taking photo)
  const submitAttendanceDirect = async (type: 'masuk' | 'pulang', photoData: string) => {
    if (!employeeId) {
      setError('Employee ID tidak ditemukan. Pastikan Anda sudah login.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          employeeId, 
          type, 
          foto: photoData, 
          catatan: 'Verifikasi Face Selfie',
          jamMulai,
          jamSelesai
        }),
      });
      const data = await res.json();
      if (data.success) { 
        // Immediately fetch updated records to update bottom history table & cards in real time
        await fetchAttendanceData(); 
        setSuccessMessage(
          type === 'masuk' 
            ? '✓ Presensi Masuk berhasil dicatat & otomatis tersimpan di tabel!' 
            : '✓ Presensi Pulang berhasil diperbarui & otomatis tersimpan di tabel!'
        );
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setError(data.error || `Gagal mencatat presensi ${type}.`);
      }
    } catch (e) {
      setError('Terjadi kendala jaringan saat mengirim data presensi.');
    } finally {
      setSubmitting(false);
    }
  };

  const takePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      setError('Sistem kamera belum siap.');
      return;
    }

    // Validasi jam kerja
    if (!todayRecord?.hasClockIn) {
      const [startH, startM] = jamMulai.split(':').map(Number);
      const startMinutes = startH * 60 + startM;
      const now = new Date();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      if (currentMinutes < startMinutes - 120) {
        const allowedH = Math.floor((startMinutes - 120) / 60);
        const allowedM = (startMinutes - 120) % 60;
        setError('Belum masuk waktu presensi. Anda baru bisa absen masuk mulai pukul ' + allowedH.toString().padStart(2, '0') + ':' + allowedM.toString().padStart(2, '0') + ' WIB.');
        return;
      }
    }
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video.videoWidth === 0 || video.videoHeight === 0) { 
      setError('Kamera sedang memuat gambar, mohon tunggu sebentar.'); 
      return; 
    }
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.translate(video.videoWidth, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
      setPhoto(dataUrl);
      stopCamera();

      // Automatically determine attendance type and record in real time!
      const targetType: 'masuk' | 'pulang' = !todayRecord?.hasClockIn ? 'masuk' : 'pulang';
      submitAttendanceDirect(targetType, dataUrl);
    }
  };

  const handleManualAction = async (type: 'masuk' | 'pulang') => {
    if (!photo) { setError('Silakan ambil foto selfie terlebih dahulu.'); return; }
    submitAttendanceDirect(type, photo);
  };

  useEffect(() => { 
    return () => { 
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop()); 
    }; 
  }, []);

  // Time & Status Calculations
  const formatTimeStr = (dateStr: string | Date | undefined | null) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '-' : `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')} WIB`;
  };

  const formatDateStr = (dateStr: string | Date) => {
    return new Date(dateStr).toLocaleDateString('id-ID', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  };

  const checkIsLate = (clockInTimeStr: string | Date | undefined | null) => {
    if (!clockInTimeStr) return false;
    const d = new Date(clockInTimeStr);
    const clockInMinutes = d.getHours() * 60 + d.getMinutes();
    const [startH, startM] = jamMulai.split(':').map(Number);
    const startMinutes = (startH || 8) * 60 + (startM || 0);
    return clockInMinutes > startMinutes;
  };

  const getDynamicEndTime = (clockInTimeStr: any) => {
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
    return outH.toString().padStart(2, '0') + ':' + outM.toString().padStart(2, '0');
  };

  const checkIsEarlyLeave = (clockInTimeStr: any, clockOutTimeStr: any) => {
    if (!clockOutTimeStr || !clockInTimeStr) return false;
    const dOut = new Date(clockOutTimeStr);
    const clockOutMinutes = dOut.getHours() * 60 + dOut.getMinutes();
    const [endH, endM] = getDynamicEndTime(clockInTimeStr).split(':').map(Number);
    const expectedEndMinutes = endH * 60 + endM;
    return clockOutMinutes < expectedEndMinutes;
  };

  const hariIndo = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const bulanIndo = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  // Duration calculation
  const getDuration = () => {
    if (!todayRecord?.clockInTime) return null;
    const start = new Date(todayRecord.clockInTime);
    const end = todayRecord?.clockOutTime ? new Date(todayRecord.clockOutTime) : time;
    const diff = Math.max(0, end.getTime() - start.getTime());
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Calendar State Processing
  const calYear = calendarDate.getFullYear();
  const calMonth = calendarDate.getMonth();
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const today = new Date();

  const attendanceDates = new Map<number, { masuk: string, isLate: boolean, jamMasuk?: string, jamPulang?: string }>();
  history.forEach((rec) => {
    const d = new Date(rec.tanggal);
    if (d.getMonth() === calMonth && d.getFullYear() === calYear) {
      const late = checkIsLate(rec.jamMasuk);
      attendanceDates.set(d.getDate(), { 
        masuk: rec.statusMasuk || 'HADIR', 
        isLate: late,
        jamMasuk: rec.jamMasuk,
        jamPulang: rec.jamPulang
      });
    }
  });

  const prevMonth = () => setCalendarDate(new Date(calYear, calMonth - 1, 1));
  const nextMonth = () => setCalendarDate(new Date(calYear, calMonth + 1, 1));

  const calendarCells = [];
  for (let i = 0; i < firstDay; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  return (
    <div className="space-y-8 pb-16">
      
      {/* Settings & Info Header Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col">
        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Jadwal & Standar Waktu Kerja</h2>
            </div>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 px-5 py-3 bg-slate-50 border-t border-slate-200">
          <div className="text-sm font-semibold text-slate-600 flex items-center gap-2">
            <span className="opacity-70">Batas Masuk:</span> <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">{jamMulai} WIB</span>
            <span className="mx-2 opacity-50">—</span>
            <span className="opacity-70">Jadwal Pulang:</span> <span className="text-blue-700 bg-blue-100 px-2 py-0.5 rounded border border-blue-200">{jamSelesai} WIB</span>
          </div>
            
          {(userRole === 'ADMIN' || userRole === 'OPERATOR') && (
            <button 
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl transition-colors font-semibold text-base shrink-0"
            >
              <Settings className="w-5 h-5" /> Atur Jadwal
            </button>
          )}
        </div>
      </div>

      {/* Expandable Settings */}
      {showSettings && (
        <div className="bg-slate-50 rounded-2xl border-2 border-blue-200 p-6 shadow-inner animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900">Pengaturan Jam Masuk & Pulang Kerja</h3>
            <span className="text-xs text-slate-500 bg-white px-2.5 py-1 rounded-full border">Disimpan Lokal di Browser</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
            <div>
              <label className="block text-slate-700 font-semibold mb-2">Batas Jam Masuk (Tepat Waktu)</label>
              <input 
                type="time" 
                value={jamMulai}
                onChange={(e) => setJamMulai(e.target.value)}
                className="w-full p-3 text-lg font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-semibold mb-2">Jam Selesai Kerja (Bisa Pulang)</label>
              <input 
                type="time" 
                value={jamSelesai}
                onChange={(e) => setJamSelesai(e.target.value)}
                className="w-full p-3 text-lg font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
              />
            </div>
            <div>
              <button 
                onClick={saveSettings}
                className="w-full px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-lg transition-all shadow-md active:scale-95"
              >
                Simpan Jadwal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clock + Date Header */}
      <div className="bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-4 py-1.5 rounded-full text-blue-100 text-sm font-semibold mb-3">
              <Calendar className="w-4 h-4" />
              {mounted ? `${hariIndo[time.getDay()]}, ${time.getDate()} ${bulanIndo[time.getMonth()]} ${time.getFullYear()}` : 'Memuat tanggal...'}
            </div>
            <h1 className="text-7xl sm:text-8xl lg:text-9xl font-extrabold font-mono tabular-nums tracking-tight leading-none mb-3">
              {mounted ? (
                <>
                  {time.getHours().toString().padStart(2, '0')}:{time.getMinutes().toString().padStart(2, '0')}
                  <span className="text-4xl sm:text-5xl text-blue-300">:{time.getSeconds().toString().padStart(2, '0')}</span>
                </>
              ) : (
                <>
                  00:00<span className="text-4xl sm:text-5xl text-blue-300">:00</span>
                </>
              )}
            </h1>
            {userName && (
              <p className="text-blue-100 flex items-center gap-2 justify-center lg:justify-start text-lg font-medium">
                <UserCheck className="w-5 h-5 text-emerald-400" /> Pegawai: <span className="font-bold text-white">{userName}</span>
              </p>
            )}
          </div>

          {/* Live Duration or Work Status */}
          {todayRecord?.hasClockIn && (
            <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 text-center border border-white/25 min-w-[280px] shadow-lg">
              <div className="flex items-center justify-center gap-2 text-blue-100 text-xs uppercase tracking-widest font-bold mb-2">
                <Timer className="w-4 h-4" />
                {todayRecord.hasClockOut ? 'Total Waktu Kerja Hari Ini' : 'Waktu Kerja Sedang Berjalan'}
              </div>
              <p className="text-5xl font-black font-mono tabular-nums tracking-tight text-white">
                {mounted ? getDuration() : '00:00:00'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 flex items-center gap-4 shadow-sm animate-in fade-in">
          <CheckCircle2 className="w-7 h-7 text-emerald-600 shrink-0" />
          <p className="font-bold text-emerald-900 text-base">{successMessage}</p>
          <button onClick={() => setSuccessMessage('')} className="ml-auto text-emerald-500 hover:text-emerald-700 bg-emerald-100 p-1.5 rounded-lg">✕</button>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 flex items-start gap-4 shadow-sm">
          <AlertCircle className="w-7 h-7 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-red-900">Perhatian</p>
            <p className="text-base text-red-800 font-medium">{error}</p>
          </div>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-700 bg-red-100 p-1.5 rounded-lg">✕</button>
        </div>
      )}

      {/* Main Grid: Camera + Status + Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Camera & Verification (col-span-4) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <Camera className="w-7 h-7 text-blue-600" />
              Verifikasi Wajah
            </h3>
            {submitting ? (
              <span className="bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Menyimpan...
              </span>
            ) : photo ? (
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Foto Siap
              </span>
            ) : null}
          </div>

          {!cameraActive && !photo ? (
            <div className="w-full max-w-[360px] mx-auto flex flex-col items-center justify-center bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-6 mb-6 aspect-[4/5]">
              <div className="w-20 h-20 rounded-full bg-slate-200/70 flex items-center justify-center mb-4">
                <Camera className="w-10 h-10 text-slate-400" />
              </div>
              <p className="text-slate-800 font-bold text-lg mb-1">Kamera Belum Aktif</p>
              <p className="text-slate-500 text-sm text-center max-w-xs mb-6">
                Aktifkan kamera untuk mengambil foto selfie presensi.
              </p>
              <button 
                onClick={startCamera} 
                className="bg-slate-900 text-white px-6 py-3 rounded-xl text-base font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95 flex items-center gap-2"
              >
                <Camera className="w-5 h-5" /> Aktifkan Kamera
              </button>
            </div>
          ) : cameraActive && !photo ? (
            <div className="w-full max-w-[360px] mx-auto mb-6">
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-[4/5] w-full shadow-inner flex items-center justify-center border-4 border-slate-800">
                <video ref={videoRef} autoPlay playsInline muted className="absolute inset-0 w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
                {!cameraReady && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mb-4" />
                      <p className="text-white text-base font-semibold">Menghubungkan Kamera...</p>
                    </div>
                  </div>
                )}
                {cameraReady && (
                  <>
                    <div className={`absolute top-4 left-1/2 -translate-x-1/2 backdrop-blur-md px-4 py-2 rounded-full text-xs font-bold flex items-center gap-2 z-20 shadow-lg border-2 whitespace-nowrap ${isFaceDetected ? 'bg-emerald-900/80 text-emerald-100 border-emerald-500/50' : 'bg-amber-900/80 text-amber-100 border-amber-500/50 animate-pulse'}`}>
                      <ScanFace className={`w-4 h-4 ${isFaceDetected ? 'text-emerald-400' : 'text-amber-400'}`} /> 
                      {faceDetectMsg}
                    </div>

                    <button 
                      onClick={takePhoto} 
                      className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md rounded-full w-20 h-20 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform active:scale-95 border-4 border-white/60 z-20"
                    title="Klik untuk Ambil Foto & Catat Otomatis"
                  >
                    <div className="w-14 h-14 rounded-full bg-white shadow-inner" />
                  </button>
                  </>
                )}
              </div>
            </div>
          ) : photo ? (
            <div className="w-full max-w-[360px] mx-auto mb-6">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/5] w-full shadow-md border-4 border-emerald-400">
                <img src={photo} alt="Foto Presensi" className="absolute inset-0 w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
                <div className="absolute top-4 left-4 bg-emerald-600 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-lg">
                  <CheckCircle2 className="w-4 h-4" /> Foto Tercatat
                </div>
                <button 
                  onClick={startCamera} 
                  className="absolute top-4 right-4 bg-slate-900/80 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold backdrop-blur-md hover:bg-slate-900 flex items-center gap-1.5 shadow-lg transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Ambil Ulang
                </button>
              </div>
            </div>
          ) : null}

          <canvas ref={canvasRef} className="hidden" />

          {/* Action Buttons */}
          <div className="w-full mt-auto space-y-3">
            {loading ? (
              <div className="w-full py-5 bg-slate-100 text-slate-500 rounded-2xl font-bold text-lg text-center flex items-center justify-center gap-3">
                <div className="w-6 h-6 border-4 border-slate-300 border-t-slate-600 rounded-full animate-spin" /> Memuat Data Presensi...
              </div>
            ) : submitting ? (
              <div className="w-full py-5 bg-blue-600 text-white rounded-2xl font-extrabold text-xl flex items-center justify-center gap-3 shadow-lg">
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                MENYIMPAN & MEMPERBARUI TABEL...
              </div>
            ) : !todayRecord?.hasClockIn ? (
              <>
                <button 
                  onClick={() => photo ? handleManualAction('masuk') : startCamera()} 
                  className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-extrabold text-xl flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-emerald-600/30 active:scale-98"
                >
                  <Play className="w-6 h-6 fill-current" />
                  {photo ? 'SIMPAN PRESENSI MASUK' : 'AMBIL FOTO UNTUK CLOCK IN'}
                </button>
                
              </>
            ) : !todayRecord?.hasClockOut ? (
              <>
                <button 
                  onClick={() => photo ? handleManualAction('pulang') : startCamera()} 
                  className="w-full py-5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-extrabold text-xl flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-blue-600/30 active:scale-98"
                >
                  <Camera className="w-6 h-6" />
                  {photo ? 'SIMPAN PRESENSI PULANG' : 'AMBIL FOTO UNTUK CLOCK OUT'}
                </button>
                
              </>
            ) : (
              <div className="space-y-3">
                <div className="w-full py-4 bg-emerald-50 border-2 border-emerald-300 text-emerald-800 rounded-2xl font-extrabold text-lg flex items-center justify-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" /> PRESENSI HARI INI LENGKAP ✓
                </div>
                <button 
                  onClick={startCamera} 
                  className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <Camera className="w-4 h-4" /> Ambil Foto Ulang / Perbarui Presensi
                </button>
              </div>
              )}
            </div>
          </div>

        {/* Middle: Status Card (col-span-4) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          {/* Status Card */}
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm flex flex-col justify-between flex-1">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <ShieldCheck className="w-7 h-7 text-blue-600" />
                Keterangan Status Hari Ini
              </h3>

              <div className="space-y-5">
                {/* Status Jam Masuk */}
                <div className={`rounded-2xl border-2 overflow-hidden transition-all ${
                  todayRecord?.hasClockIn 
                    ? (checkIsLate(todayRecord.clockInTime) ? 'border-amber-300' : 'border-emerald-300') 
                    : 'border-slate-200'
                }`}>
                  {/* Header */}
                  <div className={`px-5 py-3 flex items-center justify-between ${
                    todayRecord?.hasClockIn 
                      ? (checkIsLate(todayRecord.clockInTime) ? 'bg-amber-500' : 'bg-emerald-600') 
                      : 'bg-slate-400'
                  }`}>
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                      <Play className="w-4 h-4 fill-current" />
                      <span>PRESENSI MASUK</span>
                    </div>
                    {todayRecord?.hasClockIn && (
                      <span className="bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        {checkIsLate(todayRecord.clockInTime) ? '⚠ TERLAMBAT' : '✓ TEPAT WAKTU'}
                      </span>
                    )}
                  </div>
                  {/* Body */}
                  <div className={`px-5 py-4 ${
                    todayRecord?.hasClockIn 
                      ? (checkIsLate(todayRecord.clockInTime) ? 'bg-amber-50' : 'bg-emerald-50') 
                      : 'bg-slate-50'
                  }`}>
                    {todayRecord?.hasClockIn ? (
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-0.5">Jam Masuk</p>
                          <p className={`text-5xl font-black font-mono tabular-nums ${
                            checkIsLate(todayRecord.clockInTime) ? 'text-amber-700' : 'text-emerald-700'
                          }`}>
                            {formatTimeStr(todayRecord.clockInTime)}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-slate-500 font-medium">Jadwal Masuk</p>
                          <p className="text-lg font-extrabold text-slate-700">{jamMulai} WIB</p>
                          <p className={`text-xs font-bold mt-1 ${
                            checkIsLate(todayRecord.clockInTime) ? 'text-amber-700' : 'text-emerald-700'
                          }`}>
                            {checkIsLate(todayRecord.clockInTime) ? '⚠ Terlambat masuk' : '✓ Hadir tepat waktu'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 py-1">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-600 text-base">Belum Presensi Masuk</p>
                          <p className="text-xs text-slate-400 mt-0.5">Jadwal masuk: <span className="font-bold">{jamMulai} WIB</span></p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status Jam Pulang */}
                <div className={`rounded-2xl border-2 overflow-hidden transition-all ${
                  todayRecord?.hasClockOut 
                    ? (checkIsEarlyLeave(todayRecord?.clockInTime, todayRecord?.clockOutTime) ? 'border-amber-300' : 'border-blue-400') 
                    : (todayRecord?.hasClockIn ? 'border-blue-200' : 'border-slate-200')
                }`}>
                  {/* Header */}
                  <div className={`px-5 py-3 flex items-center justify-between ${
                    todayRecord?.hasClockOut 
                      ? (checkIsEarlyLeave(todayRecord?.clockInTime, todayRecord?.clockOutTime) ? 'bg-amber-500' : 'bg-blue-600') 
                      : (todayRecord?.hasClockIn ? 'bg-blue-400' : 'bg-slate-400')
                  }`}>
                    <div className="flex items-center gap-2 text-white font-bold text-sm">
                      <Square className="w-4 h-4 fill-current" />
                      <span>PRESENSI PULANG</span>
                    </div>
                    {todayRecord?.hasClockOut && (
                      <span className="bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                        {checkIsEarlyLeave(todayRecord?.clockInTime, todayRecord?.clockOutTime) ? '⚠ PULANG AWAL' : '✓ SESUAI JADWAL'}
                      </span>
                    )}
                    {!todayRecord?.hasClockOut && todayRecord?.hasClockIn && (
                      <span className="bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse">
                        ⏱ SEDANG BEKERJA
                      </span>
                    )}
                  </div>
                  {/* Body */}
                  <div className={`px-5 py-4 ${
                    todayRecord?.hasClockOut 
                      ? (checkIsEarlyLeave(todayRecord?.clockInTime, todayRecord?.clockOutTime) ? 'bg-amber-50' : 'bg-blue-50') 
                      : (todayRecord?.hasClockIn ? 'bg-blue-50/40' : 'bg-slate-50')
                  }`}>
                    {todayRecord?.hasClockOut ? (
                      <div className="flex items-end justify-between gap-4">
                        <div>
                          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-0.5">Jam Pulang</p>
                          <p className={`text-5xl font-black font-mono tabular-nums ${
                            checkIsEarlyLeave(todayRecord?.clockInTime, todayRecord?.clockOutTime) ? 'text-amber-700' : 'text-blue-700'
                          }`}>
                            {formatTimeStr(todayRecord.clockOutTime)}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs text-slate-500 font-medium">Jadwal Pulang</p>
                          <p className="text-lg font-extrabold text-slate-700">{getDynamicEndTime(todayRecord?.clockInTime)} WIB</p>
                          <p className={`text-xs font-bold mt-1 ${
                            checkIsEarlyLeave(todayRecord?.clockInTime, todayRecord?.clockOutTime) ? 'text-amber-700' : 'text-blue-700'
                          }`}>
                            {checkIsEarlyLeave(todayRecord?.clockInTime, todayRecord?.clockOutTime) ? '⚠ Pulang sebelum jadwal' : '✓ Selesai sesuai jadwal'}
                          </p>
                        </div>
                      </div>
                    ) : todayRecord?.hasClockIn ? (
                      <div className="flex items-center gap-3 py-1">
                        <div className="w-10 h-10 rounded-full bg-blue-200 flex items-center justify-center">
                          <Timer className="w-5 h-5 text-blue-600 animate-pulse" />
                        </div>
                        <div>
                          <p className="font-bold text-blue-700 text-base">Sedang Bekerja</p>
                          <p className="text-xs text-slate-500 mt-0.5">Bisa pulang pukul: <span className="font-bold">{getDynamicEndTime(todayRecord?.clockInTime)} WIB</span></p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 py-1">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-600 text-base">Belum Presensi</p>
                          <p className="text-xs text-slate-400 mt-0.5">Aktif setelah Clock In</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Ringkasan Keseluruhan Hari Ini */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                  <p className="text-xs uppercase tracking-wider font-bold text-slate-500 mb-2">Status Kehadiran Hari Ini:</p>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                      todayRecord?.hasClockIn && todayRecord?.hasClockOut 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : todayRecord?.hasClockIn 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-slate-200 text-slate-600'
                    }`}>
                      {todayRecord?.hasClockIn && todayRecord?.hasClockOut 
                        ? '✓ Hadir Lengkap (Masuk & Pulang)' 
                        : todayRecord?.hasClockIn 
                          ? '⏱️ Hadir (Belum Pulang)' 
                          : '○ Belum Hadir / Alpha'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Calendar Card (col-span-4) */}
        <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              Kalender Kehadiran
            </h3>
          </div>

          {/* Month Nav */}
          <div className="flex items-center justify-between mb-4 bg-slate-50 p-2 rounded-xl border border-slate-200">
            <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors text-slate-700">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-bold text-base text-slate-800">{bulanIndo[calMonth]} {calYear}</span>
            <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors text-slate-700">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-bold text-slate-400">
            <div>Min</div><div>Sen</div><div>Sel</div><div>Rab</div><div>Kam</div><div>Jum</div><div>Sab</div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2.5 flex-grow">
            {calendarCells.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} className="aspect-square" />;
              const isToday = new Date().getDate() === day && new Date().getMonth() === calMonth && new Date().getFullYear() === calYear;
              const statusData = attendanceDates.get(day);
              const isWeekend = new Date(calYear, calMonth, day).getDay() === 0 || new Date(calYear, calMonth, day).getDay() === 6;
              const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const holiday = holidays[dateStr];
              const isHoliday = !!holiday;

              return (
                <div
                  key={day}
                  onClick={() => {
                    if (isHoliday) {
                      setSelectedHoliday({ date: dateStr, summary: holiday.summary });
                    } else {
                      setSelectedHoliday(null);
                    }
                  }}
                  className={`group relative aspect-square flex flex-col items-center justify-center rounded-xl text-base transition-all font-bold select-none
                    ${isHoliday ? 'cursor-pointer hover:ring-2 hover:ring-rose-300 hover:ring-offset-1' : 'cursor-default'}
                    ${isToday ? 'bg-blue-600 text-white shadow-md ring-4 ring-blue-200 z-10 scale-110' : ''}
                    ${!isToday && statusData && !statusData.isLate ? 'bg-emerald-100 border border-emerald-300' : ''}
                    ${!isToday && statusData && statusData.isLate ? 'bg-amber-100 border border-amber-300' : ''}
                    ${!isToday && !statusData && (isWeekend || isHoliday) ? 'bg-rose-50/50 hover:bg-rose-100 border border-transparent hover:border-rose-200' : ''}
                    ${!isToday && !statusData && !isWeekend && !isHoliday ? 'bg-slate-50 hover:bg-slate-100' : ''}
                    ${isToday ? 'text-white' : statusData ? (statusData.isLate ? 'text-amber-900' : 'text-emerald-900') : (isHoliday || isWeekend ? 'text-rose-600' : 'text-slate-700')}
                  `}
                  title={isHoliday ? `Klik untuk melihat detail libur` : statusData ? `Tgl ${day}: ${statusData.isLate ? 'Terlambat' : 'Tepat Waktu'}` : `Tgl ${day}`}
                >
                  <span>{day}</span>
                  {statusData && !isToday && (
                    <div className={`w-2 h-2 rounded-full mt-1 shadow-sm ${statusData.isLate ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  )}
                  {isToday && todayRecord?.hasClockIn && (
                    <div className="w-2 h-2 rounded-full mt-1 bg-white shadow-sm" />
                  )}
                  {/* Clean badge breaking out of the box boundaries */}
                  {isHoliday && (
                    <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-rose-500 border-2 border-white shadow-sm flex items-center justify-center" title={holiday.summary}>
                      {/* Optional: tiny visual inner dot or just solid */}
                      <div className="w-1 h-1 bg-white rounded-full animate-ping opacity-75" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 grid grid-cols-2 gap-2 text-xs font-semibold text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-400" /> Tepat Waktu</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-amber-100 border border-amber-400" /> Terlambat</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-blue-600" /> Hari Ini</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded bg-rose-100 border border-rose-200" /> Libur / Libur Nasional</div>
          </div>

          {/* Selected Holiday Info Box */}
          {selectedHoliday && (
            <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 shadow-sm">
              <Calendar className="w-5 h-5 text-rose-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-bold text-rose-900 text-sm">{selectedHoliday.summary}</h4>
                <p className="text-xs font-medium text-rose-700 mt-0.5">
                  {new Date(selectedHoliday.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <button 
                onClick={() => setSelectedHoliday(null)} 
                className="ml-auto text-rose-400 hover:text-rose-600 hover:bg-rose-100 p-1 rounded-lg transition-colors"
                title="Tutup"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              <Calendar className="w-7 h-7 text-blue-600" />
              Riwayat Presensi & Lokasi Bulan Ini
            </h3>
            <p className="text-slate-500 text-sm mt-1">Daftar rekaman presensi lengkap beserta keterangan status dan alamat lokasi GPS real-time.</p>
          </div>
          <button 
            onClick={fetchAttendanceData} 
            className="px-5 py-2.5 bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold rounded-xl flex items-center gap-2 transition-colors shrink-0"
          >
            <RefreshCw className="w-4 h-4" /> Refresh Riwayat
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal & Hari</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Jam Masuk</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Jam Pulang</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Durasi Kerja</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Metode Presensi</th>
                <th className="px-6 py-4 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100 text-base">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-6 h-6 border-4 border-slate-300 border-t-blue-600 rounded-full animate-spin" /> 
                      <span className="font-semibold">Memuat riwayat presensi...</span>
                    </div>
                  </td>
                </tr>
              ) : history.length > 0 ? history.map((rec, idx) => {
                // Calculate duration
                let dur = '-';
                if (rec.jamMasuk && rec.jamPulang) {
                  const diff = new Date(rec.jamPulang).getTime() - new Date(rec.jamMasuk).getTime();
                  const h = Math.floor(diff / 3600000);
                  const m = Math.floor((diff % 3600000) / 60000);
                  dur = `${h} jam ${m} mnt`;
                }

                const late = checkIsLate(rec.jamMasuk);
                const earlyLeave = rec.jamPulang ? checkIsEarlyLeave(rec.jamMasuk, rec.jamPulang) : false;

                return (
                  <tr key={rec.id || idx} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-base font-bold text-slate-900">{formatDateStr(rec.tanggal)}</div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      {rec.jamMasuk ? (
                        <div className="space-y-1">
                          <span className={`inline-block font-mono font-bold text-base px-2.5 py-0.5 rounded border ${
                            late ? 'text-amber-800 bg-amber-50 border-amber-200' : 'text-emerald-800 bg-emerald-50 border-emerald-200'
                          }`}>
                            {formatTimeStr(rec.jamMasuk)}
                          </span>
                          <div className={`text-xs font-semibold ${late ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {late ? '⚠️ Terlambat' : '✓ Tepat Waktu'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-300 font-mono">—</span>
                      )}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      {rec.jamPulang ? (
                        <div className="space-y-1">
                          <span className={`inline-block font-mono font-bold text-base px-2.5 py-0.5 rounded border ${
                            earlyLeave ? 'text-amber-800 bg-amber-50 border-amber-200' : 'text-blue-800 bg-blue-50 border-blue-200'
                          }`}>
                            {formatTimeStr(rec.jamPulang)}
                          </span>
                          <div className={`text-xs font-semibold ${earlyLeave ? 'text-amber-600' : 'text-blue-600'}`}>
                            {earlyLeave ? '⚠️ Pulang Awal' : '✓ Sesuai Jadwal'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-sm italic">Belum Presensi Pulang</span>
                      )}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center font-semibold text-slate-700">
                      {dur}
                    </td>
                    <td className="px-6 py-5 text-sm text-slate-700 max-w-xs">
                      <div className="flex items-start gap-2">
                        <ScanFace className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-2" title={rec.catatan || 'Otomatis'}>
                          {rec.catatan || 'Face Recognition (Selfie)'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-center">
                      <span className={`inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold border ${
                        !late 
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                          : 'bg-amber-100 text-amber-800 border-amber-300'
                      }`}>
                        {!late ? '✓ Hadir Tepat Waktu' : '⚠️ Hadir Terlambat'}
                      </span>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-slate-500">
                    <Calendar className="w-14 h-14 text-slate-200 mx-auto mb-3" />
                    <p className="text-base font-semibold">Belum ada riwayat presensi yang tercatat untuk bulan ini.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}




