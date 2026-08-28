'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Plus, Clock, CheckCircle, XCircle, Search, Send, User, Shield, Info, AlertTriangle, ArrowLeft } from 'lucide-react';
import { formatDate } from '@/lib/utils';

export default function BantuanPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  
  // View states
  const [activeView, setActiveView] = useState<'LIST' | 'CREATE' | 'DETAIL'>('LIST');
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  
  // Form states
  const [newSubject, setNewSubject] = useState('');
  const [newKategori, setNewKategori] = useState('SISTER');
  const [newMessage, setNewMessage] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, status: string}>({isOpen: false, status: ''});

  useEffect(() => {
    fetchUserData();
    fetchTickets();
  }, []);

  const fetchUserData = async () => {
    const res = await fetch('/api/auth/me');
    const json = await res.json();
    if (json.success) setUserData(json.user);
  };

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tickets');
      const json = await res.json();
      if (json.success) setTickets(json.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const fetchTicketDetail = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tickets/${id}`);
      const json = await res.json();
      if (json.success) {
        setSelectedTicket(json.data);
        setActiveView('DETAIL');
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject || !newMessage) return;
    
    setSubmitting(true);
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: newSubject, kategori: newKategori, message: newMessage })
      });
      const json = await res.json();
      if (json.success) {
        setNewSubject('');
        setNewMessage('');
        setActiveView('LIST');
        fetchTickets();
      }
    } catch (e) {
      console.error(e);
    }
    setSubmitting(false);
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage || !selectedTicket) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/tickets/${selectedTicket.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyMessage })
      });
      const json = await res.json();
      if (json.success) {
        setReplyMessage('');
        fetchTicketDetail(selectedTicket.id); // Refresh chat
      }
    } catch (e) {
      console.error(e);
    }
    setSubmitting(false);
  };

  const handleUpdateStatus = (newStatus: string) => {
    setConfirmDialog({ isOpen: true, status: newStatus });
  };

  const executeStatusUpdate = async () => {
    setConfirmDialog({ ...confirmDialog, isOpen: false });
    try {
      await fetch(`/api/tickets/${selectedTicket.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'UPDATE_STATUS', status: confirmDialog.status })
      });
      fetchTicketDetail(selectedTicket.id);
      fetchTickets();
    } catch (e) {}
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'BARU': 
      case 'OPEN': return 'bg-blue-100 text-blue-700';
      case 'DIPROSES': 
      case 'IN_PROGRESS': return 'bg-amber-100 text-amber-700';
      case 'TERTUNDA': return 'bg-orange-100 text-orange-700';
      case 'SELESAI': 
      case 'CLOSED': return 'bg-green-100 text-green-700';
      case 'BATAL': return 'bg-slate-200 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getKategoriLabel = (kat: string) => {
    switch (kat) {
      case 'SISTER': return 'Integrasi SISTER';
      case 'AKUN': return 'Masalah Akun / Password';
      case 'TEKNIS': return 'Kendala Teknis (Error)';
      case 'UMUM': return 'Pertanyaan Umum';
      default: return kat;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Pusat Bantuan & Layanan</h1>
          <p className="text-lg text-slate-500 mt-1">
            {userData?.role === 'ADMIN' ? 'Kelola keluhan dan permintaan akses pegawai' : 'Sampaikan keluhan atau minta sinkronisasi data'}
          </p>
        </div>
        
        {activeView === 'LIST' && (
          <button 
            onClick={() => setActiveView('CREATE')}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-base font-medium transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" /> Buat Tiket Baru
          </button>
        )}
      </div>

      {activeView === 'LIST' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500">Memuat data...</div>
          ) : tickets.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900">Belum ada tiket bantuan</h3>
              <p className="text-slate-500 mt-1">Daftar tiket komunikasi Anda akan muncul di sini.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {tickets.map(ticket => (
                <div 
                  key={ticket.id} 
                  onClick={() => fetchTicketDetail(ticket.id)}
                  className="p-6 hover:bg-slate-50 cursor-pointer transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                      <span className="text-sm font-semibold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                        {getKategoriLabel(ticket.kategori)}
                      </span>
                      {userData?.role === 'ADMIN' && (
                        <span className="text-sm text-slate-500 flex items-center gap-1"><User className="w-3.5 h-3.5"/> {ticket.user?.nama}</span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">{ticket.subject}</h3>
                    <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" /> Diperbarui: {formatDate(ticket.updatedAt)}
                    </p>
                  </div>
                  <ChevronRight className="w-6 h-6 text-slate-400" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeView === 'CREATE' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-3xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Buat Tiket Keluhan / Bantuan</h2>
            <button onClick={() => setActiveView('LIST')} className="text-slate-500 hover:text-slate-700 font-medium">Batal</button>
          </div>
          
          <form onSubmit={handleCreateTicket} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
              <select 
                value={newKategori} onChange={e => setNewKategori(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="SISTER">Integrasi SISTER</option>
                <option value="AKUN">Masalah Akun / Password</option>
                <option value="TEKNIS">Kendala Teknis (Error)</option>
                <option value="UMUM">Pertanyaan Umum</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subjek / Judul</label>
              <input 
                type="text" required value={newSubject} onChange={e => setNewSubject(e.target.value)}
                placeholder="Contoh: Mohon bukakan akses tarik SISTER"
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pesan / Penjelasan Detail</label>
              <textarea 
                required rows={5} value={newMessage} onChange={e => setNewMessage(e.target.value)}
                placeholder="Jelaskan kendala atau permintaan Anda secara detail..."
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button 
              type="submit" disabled={submitting}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium disabled:opacity-50"
            >
              {submitting ? 'Mengirim...' : 'Kirim Tiket'}
            </button>
          </form>
        </div>
      )}

      {activeView === 'DETAIL' && selectedTicket && (
        <div className="flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-[600px]">
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-white">
            <div className="flex flex-col items-start gap-4">
              <button 
                onClick={() => { setActiveView('LIST'); fetchTickets(); }} 
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors border border-slate-200"
              >
                 <ArrowLeft className="w-4 h-4" /> Kembali ke Daftar
              </button>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{selectedTicket.subject}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(selectedTicket.status)}`}>
                    {selectedTicket.status}
                  </span>
                  <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">Oleh: {selectedTicket.user?.nama}</span>
                </div>
              </div>
            </div>
            {selectedTicket.status !== 'SELESAI' && selectedTicket.status !== 'CLOSED' && selectedTicket.status !== 'BATAL' && (
              <div className="flex gap-2">
                {userData?.role === 'ADMIN' ? (
                  <select 
                    value={selectedTicket.status}
                    onChange={(e) => handleUpdateStatus(e.target.value)}
                    className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="BARU">Baru</option>
                    <option value="DIPROSES">Diproses</option>
                    <option value="TERTUNDA">Tertunda</option>
                    <option value="SELESAI">Selesai</option>
                    <option value="BATAL">Batal</option>
                  </select>
                ) : (
                  <button onClick={() => handleUpdateStatus('BATAL')} className="px-4 py-2 bg-rose-100 hover:bg-rose-200 text-rose-700 rounded-lg text-sm font-semibold transition-colors">
                    Batalkan Tiket
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
            {selectedTicket.messages.map((msg: any) => {
              const isMe = msg.senderId === userData?.id;
              const isAdmin = msg.isFromAdmin;
              
              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                    isMe ? 'bg-blue-600 text-white rounded-tr-sm' : 
                    isAdmin ? 'bg-amber-100 text-amber-900 border border-amber-200 rounded-tl-sm' : 
                    'bg-white text-slate-800 border border-slate-200 rounded-tl-sm'
                  }`}>
                    <div className="flex items-center gap-2 mb-1 opacity-80">
                      <span className="text-xs font-semibold flex items-center gap-1">
                        {isAdmin && !isMe && <Shield className="w-3 h-3" />}
                        {msg.sender?.nama || 'Saya'}
                      </span>
                      <span className="text-[10px]">{formatDate(msg.createdAt)}</span>
                    </div>
                    <div className="text-[15px] whitespace-pre-wrap leading-relaxed">{msg.message}</div>
                  </div>
                </div>
              );
            })}
            {(selectedTicket.status === 'CLOSED' || selectedTicket.status === 'SELESAI' || selectedTicket.status === 'BATAL') && (
              <div className="text-center py-4">
                <span className="bg-slate-200 text-slate-600 px-4 py-1.5 rounded-full text-xs font-bold">
                  {selectedTicket.status === 'BATAL' ? 'Tiket ini telah dibatalkan' : 'Tiket ini telah diselesaikan'}
                </span>
              </div>
            )}
          </div>

          {/* Reply Input */}
          {selectedTicket.status !== 'CLOSED' && selectedTicket.status !== 'SELESAI' && selectedTicket.status !== 'BATAL' && (
            <div className="p-4 bg-white border-t border-slate-200">
              <form onSubmit={handleReply} className="flex gap-3">
                <input 
                  type="text" 
                  value={replyMessage}
                  onChange={e => setReplyMessage(e.target.value)}
                  placeholder="Ketik balasan Anda..."
                  className="flex-1 px-4 py-3 bg-slate-100 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
                <button 
                  type="submit" disabled={submitting || !replyMessage}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl disabled:opacity-50 flex items-center gap-2 font-medium transition-colors"
                >
                  <Send className="w-5 h-5" /> Kirim
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {confirmDialog.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden animate-popup">
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-5">
                <AlertTriangle className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Konfirmasi Status</h3>
              <p className="text-slate-500 mb-8 leading-relaxed">
                Apakah Anda yakin ingin mengubah status tiket ini menjadi <span className="font-bold text-slate-700">{confirmDialog.status}</span>?
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setConfirmDialog({ isOpen: false, status: '' })}
                  className="flex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold transition-all active:scale-95"
                >
                  Batal
                </button>
                <button 
                  onClick={executeStatusUpdate}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-all shadow-sm active:scale-95"
                >
                  Ya, Lanjutkan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Komponen ikon kecil ChevronRight yang dipakai di list
function ChevronRight(props: any) {
  return <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;
}
