"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, Eye, EyeOff, AlertCircle, ArrowRight, Server, ShieldCheck, Fingerprint } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

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
        setLoading(false);
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem. Silakan coba lagi.");
      setLoading(false);
    }
  };

  const features = [
    { text: "Pusat Data Pegawai Terpadu", icon: Server },
    { text: "Sinkronisasi Langsung ke SISTER", icon: ShieldCheck },
    { text: "Rekap Presensi Digital & Absensi", icon: Fingerprint }
  ];

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex bg-slate-50 relative overflow-hidden">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-[spin_10s_linear_infinite]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-[spin_12s_linear_infinite_reverse]" />

      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-cyan-500 shadow-2xl z-10">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        
        {/* Animated Background Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

        <div className="relative z-20 flex-1 flex flex-col justify-center max-w-xl mx-auto w-full">
          <div className="animate-popup" style={{ animationDelay: '100ms' }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 backdrop-blur-md mb-6">
              <span className="flex h-2 w-2 rounded-full bg-green-400 animate-pulse"></span>
              <span className="text-xs font-semibold text-white tracking-wide">Sistem Aktif</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight drop-shadow-lg">
              SIM<span className="text-cyan-300">PEG</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 font-light mb-12 max-w-lg leading-relaxed">
              Platform Manajemen Kepegawaian & Arsip Digital <span className="font-semibold text-white">STIKES Baktara</span>.
            </p>
          </div>
          
          <div className="space-y-6">
            {features.map((feature, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-4 bg-white/10 border border-white/10 backdrop-blur-md p-4 rounded-2xl animate-slide-in opacity-0 [animation-fill-mode:forwards]" 
                style={{ animationDelay: `${300 + idx * 150}ms` }}
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center shadow-inner">
                  <feature.icon className="w-6 h-6 text-cyan-300" />
                </div>
                <span className="font-semibold text-lg text-white">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-20 mt-12 pt-8 border-t border-white/20 text-blue-100/80 text-sm flex justify-between animate-fade-in" style={{ animationDelay: '800ms' }}>
          <span>&copy; {new Date().getFullYear()} STIKES Baktara</span>
          <span>Versi 2.0</span>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="w-full lg:w-[45%] flex flex-col items-center justify-center p-6 sm:p-12 z-20 relative">
        <div className="w-full max-w-md animate-popup" style={{ animationDelay: '200ms' }}>
          
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-blue-900/10 border border-white p-8 sm:p-10">
            <div className="mb-10 text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-6 shadow-lg shadow-blue-600/30 rotate-3 hover:rotate-0 transition-transform duration-300">
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Selamat Datang</h2>
              <p className="text-slate-500 font-medium mt-2">Silakan masuk ke akun Anda</p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-start gap-3 animate-popup">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <p className="text-sm font-medium text-rose-800 leading-snug">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700 ml-1">Username / NIP</label>
                <div className="relative group">
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 group-hover:border-slate-300"
                    placeholder="Masukkan username Anda"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400 group-hover:border-slate-300 pr-12"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-xl text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full relative overflow-hidden group bg-blue-600 text-white font-bold py-4 rounded-2xl transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100 shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40"
                >
                  <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative flex items-center justify-center gap-2">
                    {loading ? (
                      <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Masuk ke Sistem</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </div>
                </button>
              </div>
            </form>
          </div>
          
          <div className="mt-8 text-center lg:hidden">
            <p className="text-sm font-semibold text-slate-500">&copy; {new Date().getFullYear()} SIMPEG STIKES Baktara</p>
          </div>
        </div>
      </div>
    </div>
  );
}
