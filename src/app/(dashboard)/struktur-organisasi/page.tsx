'use client';

import React from 'react';
import { Network, Users, User, Shield, Briefcase, GraduationCap } from 'lucide-react';

export default function StrukturOrganisasiPage() {
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
          <Network className="w-8 h-8 text-blue-600" />
          Struktur Organisasi
        </h1>
        <p className="text-slate-500 mt-2">Bagan struktur organisasi STIKES Baktara</p>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm overflow-x-auto">
        <div className="min-w-[800px] py-10 flex flex-col items-center">
          {/* Level 1: Pimpinan */}
          <div className="flex flex-col items-center">
            <div className="bg-blue-600 text-white p-4 rounded-2xl shadow-md w-64 text-center relative z-10 border-4 border-white">
              <Shield className="w-8 h-8 mx-auto mb-2 text-blue-200" />
              <h3 className="font-bold text-lg">Pimpinan / Ketua</h3>
              <p className="text-blue-100 text-sm">STIKES Baktara</p>
            </div>
            {/* Vertical Line */}
            <div className="w-1 h-12 bg-slate-300"></div>
          </div>

          {/* Level 2 Container */}
          <div className="relative flex justify-center w-full">
            {/* Horizontal Line connecting children */}
            <div className="absolute top-0 w-3/4 h-1 bg-slate-300"></div>
            
            <div className="flex justify-between w-full max-w-4xl px-8">
              
              {/* Branch 1: Administrasi / Manajemen */}
              <div className="flex flex-col items-center">
                <div className="w-1 h-8 bg-slate-300"></div>
                <div className="bg-amber-500 text-white p-4 rounded-2xl shadow-md w-60 text-center relative z-10 border-4 border-white">
                  <Briefcase className="w-8 h-8 mx-auto mb-2 text-amber-200" />
                  <h3 className="font-bold">Administrasi & Manajemen</h3>
                  <p className="text-amber-100 text-sm">BAUK, BAAK, Keuangan</p>
                </div>
                <div className="w-1 h-8 bg-slate-300"></div>
                <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl shadow-sm w-48 text-center mt-2">
                  <Users className="w-5 h-5 mx-auto mb-1 text-slate-400" />
                  <p className="font-semibold text-slate-700 text-sm">Staff Administrasi</p>
                </div>
              </div>

              {/* Branch 2: Akademik / Dosen */}
              <div className="flex flex-col items-center">
                <div className="w-1 h-8 bg-slate-300"></div>
                <div className="bg-emerald-500 text-white p-4 rounded-2xl shadow-md w-60 text-center relative z-10 border-4 border-white">
                  <GraduationCap className="w-8 h-8 mx-auto mb-2 text-emerald-200" />
                  <h3 className="font-bold">Akademik & Prodi</h3>
                  <p className="text-emerald-100 text-sm">Kaprodi, LPPM</p>
                </div>
                <div className="flex gap-4 mt-8 relative">
                  {/* Small horizontal line connecting Dosen and Tendik */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-40 h-1 bg-slate-300"></div>
                  
                  <div className="flex flex-col items-center">
                    <div className="absolute -top-8 w-1 h-8 bg-slate-300"></div>
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl shadow-sm w-40 text-center">
                      <User className="w-5 h-5 mx-auto mb-1 text-blue-500" />
                      <p className="font-semibold text-slate-700 text-sm">Dosen</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center relative">
                    <div className="absolute -top-8 w-1 h-8 bg-slate-300"></div>
                    <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl shadow-sm w-40 text-center">
                      <User className="w-5 h-5 mx-auto mb-1 text-amber-500" />
                      <p className="font-semibold text-slate-700 text-sm">Tenaga Kependidikan</p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
