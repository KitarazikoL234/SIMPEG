'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { JABATAN_AKADEMIK_OPTIONS } from '@/types';

export default function EditPegawaiPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    nama: '',
    gelarDepan: '',
    gelarBelakang: '',
    tempatLahir: '',
    tanggalLahir: '',
    jenisKelamin: '',
    agama: '',
    alamat: '',
    telepon: '',
    email: '',
    nip: '',
    nidn: '',
    nidk: '',
    tipeKepegawaian: 'DOSEN',
    statusKepegawaian: 'AKTIF',
    unitKerja: '',
    jabatanAkademik: '',
    jabatanStruktural: '',
    pangkat: '',
    golongan: '',
    rumpunIlmu: '',
    tmtPertama: '',
    sertifikasiPendidik: false,
    nomorSertifikasi: '',
  });

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await fetch(`/api/employees/${id}`);
        const data = await res.json();
        if (data.success && data.data) {
          const emp = data.data;
          setFormData({
            nama: emp.nama || '',
            gelarDepan: emp.gelarDepan || '',
            gelarBelakang: emp.gelarBelakang || '',
            tempatLahir: emp.tempatLahir || '',
            tanggalLahir: emp.tanggalLahir ? emp.tanggalLahir.split('T')[0] : '',
            jenisKelamin: emp.jenisKelamin || '',
            agama: emp.agama || '',
            alamat: emp.alamat || '',
            telepon: emp.telepon || '',
            email: emp.email || '',
            nip: emp.nip || '',
            nidn: emp.nidn || '',
            nidk: emp.nidk || '',
            tipeKepegawaian: emp.tipeKepegawaian || 'DOSEN',
            statusKepegawaian: emp.statusKepegawaian || 'AKTIF',
            unitKerja: emp.unitKerja || '',
            jabatanAkademik: emp.jabatanAkademik || '',
            jabatanStruktural: emp.jabatanStruktural || '',
            pangkat: emp.pangkat || '',
            golongan: emp.golongan || '',
            rumpunIlmu: emp.rumpunIlmu || '',
            tmtPertama: emp.tmtPertama ? emp.tmtPertama.split('T')[0] : '',
            sertifikasiPendidik: emp.sertifikasiPendidik || false,
            nomorSertifikasi: emp.nomorSertifikasi || '',
          });
        } else {
          setError('Pegawai tidak ditemukan');
        }
      } catch (err) {
        setError('Gagal memuat data pegawai');
      } finally {
        setLoading(false);
      }
    };
    fetchEmployee();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        router.push(`/pegawai/${id}`);
      } else {
        setError(data.error || 'Gagal menyimpan perubahan');
      }
    } catch (err) {
      setError('Terjadi kesalahan pada sistem');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-4">
        <Link href={`/pegawai/${id}`} className="p-2 rounded-lg bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Edit Data Pegawai</h1>
          <p className="text-slate-500 text-sm">Ubah informasi pegawai di bawah ini</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* DATA PRIBADI */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-lg font-semibold text-slate-800">Data Pribadi</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Nama Lengkap <span className="text-red-500">*</span></label>
              <input required name="nama" value={formData.nama} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Gelar Depan</label>
              <input name="gelarDepan" value={formData.gelarDepan} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Dr., Ir." />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Gelar Belakang</label>
              <input name="gelarBelakang" value={formData.gelarBelakang} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="S.Kom., M.Kom." />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Tempat Lahir</label>
              <input name="tempatLahir" value={formData.tempatLahir} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Tanggal Lahir</label>
              <input type="date" name="tanggalLahir" value={formData.tanggalLahir} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Jenis Kelamin</label>
              <select name="jenisKelamin" value={formData.jenisKelamin} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                <option value="">Pilih Jenis Kelamin</option>
                <option value="LAKI_LAKI">Laki-laki</option>
                <option value="PEREMPUAN">Perempuan</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Agama</label>
              <select name="agama" value={formData.agama} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                <option value="">Pilih Agama</option>
                <option value="Islam">Islam</option>
                <option value="Kristen">Kristen</option>
                <option value="Katolik">Katolik</option>
                <option value="Hindu">Hindu</option>
                <option value="Buddha">Buddha</option>
                <option value="Konghucu">Konghucu</option>
              </select>
            </div>

            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium text-slate-700">Alamat Lengkap</label>
              <textarea name="alamat" value={formData.alamat} onChange={handleChange} rows={3} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">No. Telepon / WhatsApp</label>
              <input type="tel" name="telepon" value={formData.telepon} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
        </div>

        {/* DATA KEPEGAWAIAN */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <h2 className="text-lg font-semibold text-slate-800">Data Kepegawaian</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-medium text-slate-700 block mb-2">Tipe Kepegawaian</label>
              <div className="flex gap-4">
                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors flex-1 ${formData.tipeKepegawaian === 'DOSEN' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <input type="radio" name="tipeKepegawaian" value="DOSEN" checked={formData.tipeKepegawaian === 'DOSEN'} onChange={handleChange} className="w-4 h-4 text-blue-600" />
                  <span className="ml-3 font-medium text-slate-900">Dosen</span>
                </label>
                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-colors flex-1 ${formData.tipeKepegawaian === 'TENDIK' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                  <input type="radio" name="tipeKepegawaian" value="TENDIK" checked={formData.tipeKepegawaian === 'TENDIK'} onChange={handleChange} className="w-4 h-4 text-blue-600" />
                  <span className="ml-3 font-medium text-slate-900">Tendik</span>
                </label>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">NIP</label>
              <input name="nip" value={formData.nip} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>

            {formData.tipeKepegawaian === 'DOSEN' && (
              <>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">NIDN</label>
                  <input name="nidn" value={formData.nidn} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-slate-700">NIDK</label>
                  <input name="nidk" value={formData.nidk} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Status Kepegawaian</label>
              <select name="statusKepegawaian" value={formData.statusKepegawaian} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                <option value="AKTIF">Aktif</option>
                <option value="NONAKTIF">Non-Aktif</option>
                <option value="CUTI">Cuti</option>
                <option value="PENSIUN">Pensiun</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Unit Kerja</label>
              <input name="unitKerja" value={formData.unitKerja} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>

            {formData.tipeKepegawaian === 'DOSEN' && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Jabatan Akademik</label>
                <select name="jabatanAkademik" value={formData.jabatanAkademik} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                  <option value="">Pilih Jabatan Akademik</option>
                  {JABATAN_AKADEMIK_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Jabatan Struktural</label>
              <input name="jabatanStruktural" value={formData.jabatanStruktural} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Pangkat</label>
              <input name="pangkat" value={formData.pangkat} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Golongan</label>
              <input name="golongan" value={formData.golongan} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="III/a" />
            </div>

            {formData.tipeKepegawaian === 'DOSEN' && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700">Rumpun Ilmu</label>
                <input name="rumpunIlmu" value={formData.rumpunIlmu} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">TMT Pertama</label>
              <input type="date" name="tmtPertama" value={formData.tmtPertama} onChange={handleChange} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
        </div>

        {/* SERTIFIKASI */}
        {formData.tipeKepegawaian === 'DOSEN' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-semibold text-slate-800">Sertifikasi</h2>
            </div>
            <div className="p-6 space-y-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input type="checkbox" name="sertifikasiPendidik" checked={formData.sertifikasiPendidik} onChange={handleChange} className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                <span className="font-medium text-slate-700">Memiliki Sertifikasi Pendidik (Serdos)</span>
              </label>
              {formData.sertifikasiPendidik && (
                <div className="space-y-1 pl-8">
                  <label className="text-sm font-medium text-slate-700">Nomor Sertifikasi</label>
                  <input name="nomorSertifikasi" value={formData.nomorSertifikasi} onChange={handleChange} className="w-full md:w-1/2 px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                </div>
              )}
            </div>
          </div>
        )}

        {/* BUTTONS */}
        <div className="flex justify-end gap-4">
          <Link href={`/pegawai/${id}`} className="px-6 py-2 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-all">
            Batal
          </Link>
          <button type="submit" disabled={saving} className="px-6 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-2">
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Menyimpan...
              </>
            ) : (
              'Simpan Perubahan'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
