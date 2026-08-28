import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }
    
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ success: false, error: 'Only PDF files are allowed' }, { status: 400 });
    }
    
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ success: false, error: 'File size exceeds 10MB limit' }, { status: 400 });
    }
    
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'documents');
    await fs.mkdir(uploadDir, { recursive: true });
    
    const uuid = crypto.randomUUID();
    const ext = path.extname(file.name);
    const fileName = `${uuid}${ext}`;
    const relativePath = `/uploads/documents/${fileName}`;
    const absolutePath = path.join(uploadDir, fileName);
    
    await fs.writeFile(absolutePath, buffer);
    
    return NextResponse.json({ 
      success: true, 
      data: {
        filePath: relativePath,
        ukuranFile: file.size,
        fileName: file.name
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
