
import fs from 'fs';

const file = 'src/app/(dashboard)/dokumen/page.tsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace('Trash2, Pencil', 'Trash2, Pencil, AlertTriangle');

const oldState = const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');;
const newState = oldState + '\n  const [confirmDialog, setConfirmDialog] = useState<{isOpen: boolean, docId: string}>({isOpen: false, docId: \\'\\'});';
code = code.replace(oldState, newState);

const oldDelete =   const deleteDocument = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus dokumen ini? Tindakan ini tidak dapat dibatalkan.')) return;
    try {
      const res = await fetch(\/api/documents/\\, { method: 'DELETE' });
      if (res.ok) {
        setDocuments(documents.filter(doc => doc.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'Gagal menghapus dokumen');
      }
    } catch (e) {
      alert('Terjadi kesalahan saat menghapus dokumen');
    }
  };;

const newDelete =   const confirmDelete = (id: string) => {
    setConfirmDialog({ isOpen: true, docId: id });
  };

  const executeDelete = async () => {
    const id = confirmDialog.docId;
    setConfirmDialog({ isOpen: false, docId: '' });
    try {
      const res = await fetch(\/api/documents/\\, { method: 'DELETE' });
      if (res.ok) {
        setDocuments(documents.filter(doc => doc.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'Gagal menghapus dokumen');
      }
    } catch (e) {
      alert('Terjadi kesalahan saat menghapus dokumen');
    }
  };;

code = code.replace(oldDelete, newDelete);
code = code.replace(/deleteDocument\(doc\.id\)/g, 'confirmDelete(doc.id)');

const modalHTML = 
      {/* Custom Confirmation Modal */}
      {confirmDialog.isOpen && (
        <div className=\ixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-fade-in\>
          <div className=\g-white rounded-3xl shadow-xl w-full max-w-sm overflow-hidden animate-popup\>
            <div className=\p-8 text-center\>
              <div className=\w-20 h-20 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-5\>
                <AlertTriangle className=\w-10 h-10\ />
              </div>
              <h3 className=\	ext-xl font-bold text-slate-900 mb-2\>Hapus Dokumen?</h3>
              <p className=\	ext-slate-500 mb-8 leading-relaxed\>
                Apakah Anda yakin ingin menghapus dokumen ini? Tindakan ini tidak dapat dibatalkan.
              </p>
              <div className=\lex gap-3 w-full\>
                <button 
                  onClick={() => setConfirmDialog({ isOpen: false, docId: '' })}
                  className=\lex-1 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold transition-all active:scale-95\
                >
                  Batal
                </button>
                <button 
                  onClick={executeDelete}
                  className=\lex-1 px-4 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-bold transition-all shadow-sm active:scale-95\
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
;

code = code.replace(/<\/div>\s*<\/div>\s*\);\s*}\s*$/, modalHTML + '\n    </div>\n  </div>\n  );\n}');

fs.writeFileSync(file, code);
console.log('Update success');

