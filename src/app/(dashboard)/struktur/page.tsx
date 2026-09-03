'use client';

import React from 'react';
import { Users, User, Shield, Briefcase, GraduationCap } from 'lucide-react';

export default function StrukturOrganisasiPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Struktur Organisasi</h1>
          <p className="text-slate-500 mt-1">Bagan struktur kepegawaian dan kepemimpinan institusi.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm overflow-x-auto">
        <div className="min-w-[800px] py-10 flex flex-col items-center">
          
          {/* Level 1: Pimpinan */}
          <div className="flex flex-col items-center">
            <div className="bg-blue-600 text-white rounded-2xl p-6 w-72 text-center shadow-lg border-4 border-blue-100 z-10 relative">
              <Shield className="w-10 h-10 mx-auto mb-3 text-blue-100" />
              <h2 className="text-xl font-bold">Ketua STIKES</h2>
              <p className="text-blue-100 text-sm mt-1">Pimpinan Utama</p>
            </div>
            
            {/* Vertical Line */}
            <div className="w-1 h-12 bg-slate-300"></div>
            
            {/* Horizontal Line connecting Level 2 */}
            <div className="w-full max-w-[600px] h-1 bg-slate-300 relative">
              <div className="absolute top-0 left-0 w-1 h-12 bg-slate-300"></div>
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-12 bg-slate-300"></div>
              <div className="absolute top-0 right-0 w-1 h-12 bg-slate-300"></div>
            </div>
          </div>

          {/* Level 2: Administrasi & Akademik */}
          <div className="flex justify-between w-full max-w-[600px] mt-12 relative">
            
            {/* Branch 1: Administrasi / Kepegawaian */}
            <div className="flex flex-col items-center w-64">
              <div className="bg-indigo-500 text-white rounded-2xl p-5 w-full text-center shadow-md border-2 border-indigo-100 z-10">
                <Briefcase className="w-8 h-8 mx-auto mb-2 text-indigo-100" />
                <h3 className="text-lg font-bold">Administrasi & Umum</h3>
                <p className="text-indigo-100 text-xs mt-1">BAK / Kepegawaian</p>
              </div>
              
              <div className="w-1 h-8 bg-slate-300"></div>
              
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 w-56 text-center shadow-sm z-10">
                <Users className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                <h4 className="font-bold text-slate-700">Tenaga Kependidikan</h4>
                <p className="text-slate-500 text-xs mt-1">(Tendik)</p>
              </div>
            </div>

            {/* Branch 2: Wakil Ketua / Staff Khusus */}
            <div className="flex flex-col items-center w-64">
              <div className="bg-teal-500 text-white rounded-2xl p-5 w-full text-center shadow-md border-2 border-teal-100 z-10">
                <User className="w-8 h-8 mx-auto mb-2 text-teal-100" />
                <h3 className="text-lg font-bold">Wakil Ketua</h3>
                <p className="text-teal-100 text-xs mt-1">Bidang I, II, & III</p>
              </div>
            </div>

            {/* Branch 3: Akademik */}
            <div className="flex flex-col items-center w-64">
              <div className="bg-amber-500 text-white rounded-2xl p-5 w-full text-center shadow-md border-2 border-amber-100 z-10">
                <GraduationCap className="w-8 h-8 mx-auto mb-2 text-amber-100" />
                <h3 className="text-lg font-bold">Akademik</h3>
                <p className="text-amber-100 text-xs mt-1">Prodi & Fakultas</p>
              </div>
              
              <div className="w-1 h-8 bg-slate-300"></div>
              
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 w-56 text-center shadow-sm z-10">
                <Users className="w-6 h-6 mx-auto mb-2 text-slate-400" />
                <h4 className="font-bold text-slate-700">Tenaga Pengajar</h4>
                <p className="text-slate-500 text-xs mt-1">(Dosen)</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
