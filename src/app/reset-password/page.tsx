"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, KeyRound, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="w-full max-w-md bg-white rounded-[32px] shadow-xl border border-slate-100 p-8 sm:p-10 animate-popup">
        
        <Link href="/login" className="inline-flex items-center text-sm font-bold text-slate-500 hover:text-blue-600 mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Login
        </Link>

        {submitted ? (
          <div className="text-center animate-fade-in">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Tautan Terkirim!</h2>
            <p className="text-slate-500 font-medium mb-8">
              Kami telah mengirimkan instruksi untuk mengatur ulang kata sandi ke email yang terkait dengan <span className="font-bold text-slate-700">{email}</span>
            </p>
            <Link 
              href="/login"
              className="block w-full text-center bg-slate-900 text-white font-bold py-3.5 rounded-2xl transition-all hover:bg-slate-800"
            >
              Tutup
            </Link>
          </div>
        ) : (
          <div>
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-6">
              <KeyRound className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">Lupa Password?</h2>
            <p className="text-slate-500 font-medium text-sm mb-8">
              Jangan khawatir! Masukkan username atau NIP Anda di bawah ini dan kami akan mengirimkan instruksi untuk mengatur ulang kata sandi.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 ml-1">Username / NIP</label>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-3.5 bg-slate-50/50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10 outline-none transition-all font-medium text-slate-900 placeholder:text-slate-400"
                  placeholder="Contoh: pimpinan"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full flex items-center justify-center bg-blue-600 text-white font-bold py-4 rounded-2xl transition-all hover:bg-blue-700 hover:shadow-lg disabled:opacity-70"
              >
                {loading ? (
                  <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Kirim Tautan Reset"
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
