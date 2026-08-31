const fs = require('fs');
const file = 'src/app/(dashboard)/dokumen/page.tsx';
let code = fs.readFileSync(file, 'utf8');

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

fs.writeFileSync(file, code);
console.log('Functions replaced!');
