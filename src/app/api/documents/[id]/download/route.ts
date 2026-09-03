import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const document = await prisma.document.findUnique({ where: { id } });
    
    if (!document) return NextResponse.json({ success: false, error: 'Dokumen tidak ditemukan' }, { status: 404 });
    
    if (document.tipeFile === 'LINK' && document.linkRepository) {
      let url = document.linkRepository;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      return NextResponse.redirect(url);
    }
    
    if (document.tipeFile === 'UPLOAD' && document.filePath) {
      const fullPath = path.join(process.cwd(), 'public', document.filePath);
      if (!fs.existsSync(fullPath)) {
        return new NextResponse(
          `<html><body style="font-family: sans-serif; padding: 2rem; text-align: center;"><h2>Maaf, file fisik tidak ditemukan di server.</h2><p>Data dokumen ada di database, tetapi file fisik (<strong>${document.filePath}</strong>) belum diupload atau hilang.</p><button onclick="window.close()" style="padding: 10px 20px; cursor: pointer;">Tutup Halaman</button></body></html>`,
          { status: 404, headers: { 'Content-Type': 'text/html' } }
        );
      }
      
      const fileBuffer = fs.readFileSync(fullPath);
      const fileName = path.basename(document.filePath);
      
      const url = new URL(request.url);
      const isView = url.searchParams.get('view') === 'true';
      
      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Disposition': isView ? `inline; filename="${fileName}"` : `attachment; filename="${fileName}"`,
          'Content-Type': 'application/pdf',
        },
      });
    }
    
    // No file attached (dummy data or not yet uploaded)
    return new NextResponse(
      `<html><head><meta charset="utf-8"><title>File Tidak Tersedia</title></head>
      <body style="font-family: 'Segoe UI', sans-serif; display:flex; align-items:center; justify-content:center; min-height:100vh; margin:0; background:#f8fafc;">
        <div style="text-align:center; padding:2.5rem; max-width:420px; background:white; border-radius:16px; box-shadow:0 4px 24px rgba(0,0,0,0.08); border:1px solid #e2e8f0;">
          <div style="font-size:3rem; margin-bottom:1rem;">📄</div>
          <h2 style="color:#1e293b; margin:0 0 0.75rem; font-size:1.25rem;">File Belum Tersedia</h2>
          <p style="color:#64748b; margin:0 0 1.5rem; line-height:1.6; font-size:0.9rem;">
            Dokumen ini belum memiliki file yang diupload ke sistem. 
            Silakan upload file melalui halaman pengelolaan dokumen.
          </p>
          <button onclick="window.close()" 
            style="padding:0.6rem 1.5rem; background:#3b82f6; color:white; border:none; border-radius:8px; font-size:0.9rem; font-weight:600; cursor:pointer;">
            Tutup
          </button>
        </div>
      </body></html>`,
      { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
