"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, UserPlus, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    nama: "",
    nip: "",
    email: "",
    password: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1500);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans py-12">
      <div className="w-full max-w-[480px] bg-white rounded-[32px] shadow-xl border border-slate-100 p-8 sm:p-10 animate-popup">
        
        <Link href="/login" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-blue-600 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Login
        </Link>

        {submitted ? (
          <div className="text-center animate-fade-in py-8">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Registrasi Berhasil!</h2>
            <p className="text-slate-500 font-medium mb-8">
              Akun Anda telah berhasil dibuat. Silakan login menggunakan NIP/Email dan kata sandi yang baru saja Anda daftarkan.
            </p>
            <Link 
              href="/login"
              className="block w-full text-center bg-blue-600 text-white font-bold py-4 rounded-2xl transition-all hover:bg-blue-700"
            >
              Lanjutkan ke Login
            </Link>
          </div>
        ) : (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Daftar Akun Baru</h2>
              <p className="text-slate-500 font-medium mt-2 text-sm">Lengkapi data di bawah ini untuk membuat akun SIMPEG</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Nama Lengkap</label>
                <input
                  type="text"
                  name="nama"
                  required
                  value={formData.nama}
                  onChange={handleChange}
                  className="w-full px-5 py-3.5 bg-slate-50/50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                  placeholder="Nama Lengkap beserta gelar"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">NIP / NIDN</label>
                <input
                  type="text"
                  name="nip"
                  required
                  value={formData.nip}
                  onChange={handleChange}
                  className="w-full px-5 py-3.5 bg-slate-50/50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                  placeholder="Nomor Induk Pegawai"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Email Aktif</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-5 py-3.5 bg-slate-50/50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                  placeholder="contoh@stikesbaktara.ac.id"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
                <input
                  type="password"
                  name="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-5 py-3.5 bg-slate-50/50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                  placeholder="Minimal 6 karakter"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-4 rounded-2xl transition-all hover:bg-blue-700 hover:shadow-lg disabled:opacity-70"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      <span>Daftar Sekarang</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
