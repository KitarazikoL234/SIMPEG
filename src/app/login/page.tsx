"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, AlertCircle, ArrowRight, ShieldCheck, Database, Fingerprint, RefreshCcw } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Captcha State
  const [captchaChars, setCaptchaChars] = useState<{char:string, x:number, y:number, rotate:number, color:string}[]>([]);
  const [captchaText, setCaptchaText] = useState("");
  const [captchaLines, setCaptchaLines] = useState<{x1:number, y1:number, x2:number, y2:number}[]>([]);
  const [captchaAnswer, setCaptchaAnswer] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    generateCaptcha();

    // Auto-trigger fingerprint if preferred
    if (localStorage.getItem('preferFingerprint') === 'true') {
      // Small delay to let the UI render first
      setTimeout(() => {
        handleFingerprintLogin(true);
      }, 500);
    }
  }, []);

  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let text = '';
    const charMeta = [];
    const colors = ["#1e293b", "#334155", "#0f172a", "#1d4ed8", "#b91c1c", "#047857"];
    
    for (let i = 0; i < 5; i++) {
      const char = chars.charAt(Math.floor(Math.random() * chars.length));
      text += char;
      charMeta.push({
        char,
        x: 15 + (i * 20),
        y: 35 + (Math.random() * 8 - 4),
        rotate: Math.random() * 40 - 20,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
    
    setCaptchaText(text);
    setCaptchaChars(charMeta);
    
    // Generate noise lines
    const lines = Array.from({length: 4}).map(() => ({
      x1: Math.random() * 120,
      y1: Math.random() * 40,
      x2: Math.random() * 120,
      y2: Math.random() * 40
    }));
    setCaptchaLines(lines);
    
    setCaptchaAnswer("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (captchaAnswer.toLowerCase() !== captchaText.toLowerCase()) {
      setError("Kode Captcha salah. Silakan coba lagi.");
      generateCaptcha();
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        router.push("/dashboard");
      } else {
        const data = await res.json();
        setError(data.error || "Login gagal. Periksa email dan password Anda.");
        generateCaptcha();
        setLoading(false);
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem. Silakan coba lagi.");
      setLoading(false);
    }
  };

  const handleFingerprintLogin = async (isAuto = false) => {
    try {
      if (window.PublicKeyCredential) {
        await navigator.credentials.get({
          publicKey: {
            challenge: new Uint8Array(32),
            rpId: window.location.hostname,
            userVerification: 'required',
            timeout: 60000,
          }
        });
        
        localStorage.setItem('preferFingerprint', 'true');
        alert('Autentikasi sidik jari berhasil!');
        router.push("/dashboard");
      } else {
        if (!isAuto) alert('Perangkat/Browser Anda tidak mendukung Autentikasi Sidik Jari (WebAuthn).');
      }
    } catch (e: any) {
      // If it was an auto-prompt and user cancelled, just fail silently so they can use password
      if (!isAuto) {
        if (e.name === 'NotAllowedError') {
          alert('Autentikasi dibatalkan atau sidik jari tidak dikenali.');
        } else {
          alert('Gagal menggunakan sidik jari. Pastikan sidik jari Anda sudah diatur.');
        }
      }
    }
  };

  const features = [
    { text: "Pusat Data Pegawai Terpadu", icon: Database },
    { text: "Terintegrasi SISTER Kemdikbud", icon: ShieldCheck },
    { text: "Presensi & Portofolio Digital", icon: Fingerprint }
  ];

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex bg-white font-sans">
      
      {/* Left Panel - Branding (50%) */}
      <div className="hidden lg:flex w-1/2 relative bg-gradient-to-br from-blue-700 to-cyan-500 items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/4 -right-20 w-64 h-64 bg-cyan-300 opacity-20 rounded-full blur-3xl"></div>

        <div className="relative z-10 w-full max-w-md animate-fade-in flex flex-col items-start">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-8 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-cyan-300 animate-pulse"></span>
            <span className="text-xs font-semibold text-white tracking-widest uppercase">Sistem Kepegawaian</span>
          </div>
          
          <h1 className="text-5xl lg:text-6xl font-black text-white mb-4 tracking-tight leading-[1.1]">
            SIM<span className="text-cyan-300">PEG</span>
          </h1>
          
          <p className="text-xl text-blue-50 font-medium mb-12 opacity-90">
            Pusat Data & Arsip Digital<br />STIKES Baktara.
          </p>
          
          <div className="space-y-6 w-full">
            {features.map((feature, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-5 text-white animate-slide-in opacity-0 [animation-fill-mode:forwards]"
                style={{ animationDelay: `${300 + idx * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 border border-white/10 shadow-sm backdrop-blur-sm">
                  <feature.icon className="w-6 h-6 text-cyan-300" />
                </div>
                <span className="font-medium text-lg tracking-wide opacity-90">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-8 left-12 right-12 flex justify-between text-blue-100/60 text-sm font-medium">
          <span>&copy; {new Date().getFullYear()} STIKES Baktara</span>
          <span>Versi 2.0</span>
        </div>
      </div>

      {/* Right Panel - Login Form (50%) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 bg-slate-50">
        
        <div className="w-full max-w-[420px] bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-8 sm:p-10 animate-popup">
          
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Selamat Datang</h2>
            <p className="text-slate-500 font-medium mt-2 text-sm">Masuk dengan akun Anda untuk melanjutkan</p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50/80 border border-rose-100 flex items-center gap-3 animate-fade-in">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <p className="text-sm font-semibold text-rose-800">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Username</label>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3.5 bg-slate-50/50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 hover:border-slate-300"
                placeholder="Masukkan username Anda"
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1 mb-1">
                <label className="text-sm font-bold text-slate-700">Password</label>
                <Link 
                  href="/reset-password"
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Lupa Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50/50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 hover:border-slate-300 pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Captcha Field */}
            <div className="space-y-2 pt-2">
              <label className="text-sm font-bold text-slate-700 ml-1">Keamanan (Captcha)</label>
              <div className="flex items-center gap-3">
                <div className="bg-slate-50 border-2 border-slate-200 rounded-2xl overflow-hidden shrink-0 w-[120px] h-[52px] relative flex justify-center items-center">
                  <svg width="120" height="52" viewBox="0 0 120 52" className="absolute inset-0 pointer-events-none">
                    {/* Noise Lines */}
                    {captchaLines.map((line, i) => (
                      <line key={i} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} stroke={i % 2 === 0 ? "#cbd5e1" : "#94a3b8"} strokeWidth="1.5" />
                    ))}
                    {/* Characters */}
                    {captchaChars.map((item, i) => (
                      <text 
                        key={i} 
                        x={item.x} 
                        y={item.y} 
                        transform={`rotate(${item.rotate} ${item.x} ${item.y})`}
                        fontSize="24" 
                        fontFamily="monospace"
                        fontWeight="bold"
                        fill={item.color}
                      >
                        {item.char}
                      </text>
                    ))}
                  </svg>
                </div>
                <input
                  type="text"
                  required
                  value={captchaAnswer}
                  onChange={(e) => setCaptchaAnswer(e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50/50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 hover:border-slate-300"
                  placeholder="Ketik kode di kiri"
                  maxLength={5}
                />
                <button 
                  type="button"
                  onClick={generateCaptcha}
                  className="p-3.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition-colors border-2 border-slate-200"
                  title="Ganti Captcha"
                >
                  <RefreshCcw className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-4 rounded-2xl transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/25 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                {loading ? (
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Masuk</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 text-xs font-semibold uppercase">Atau</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <button
                type="button"
                onClick={() => handleFingerprintLogin(false)}
                className="w-full flex items-center justify-center gap-2 bg-slate-800 text-white font-bold py-3.5 rounded-2xl transition-all hover:bg-slate-900 hover:shadow-lg hover:shadow-slate-800/20 active:scale-[0.98]"
              >
                <Fingerprint className="w-5 h-5" />
                <span>Masuk dengan Sidik Jari</span>
              </button>
            </div>

            <p className="text-center text-sm font-medium text-slate-500 pt-4">
              Belum punya akun? <Link href="/register" className="text-blue-600 hover:text-blue-700 font-bold">Daftar sekarang</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
