import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const document = await prisma.document.findUnique({
      where: { id },
      include: { employee: true },
    });
    if (!document) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: document });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Strip fields that are not in the Prisma schema
    const { hasMasaBerlaku, ...rest } = body;
    
    // Build clean update data
    const updateData: any = {};
    const allowedFields = [
      'employeeId', 'judul', 'nomorDokumen', 'kategoriUtama', 'subKategori',
      'tipeFile', 'filePath', 'linkRepository', 'ukuranFile',
      'semester', 'tahunAkademik', 'catatan', 'status'
    ];
    
    for (const field of allowedFields) {
      if (rest[field] !== undefined) {
        updateData[field] = rest[field] || null;
      }
    }
    
    // Handle date fields
    if (rest.tanggalTerbit) {
      updateData.tanggalTerbit = new Date(rest.tanggalTerbit);
    }
    if (rest.masaBerlaku) {
      updateData.masaBerlaku = new Date(rest.masaBerlaku);
    } else {
      updateData.masaBerlaku = null;
    }
    
    // Don't overwrite filePath/ukuranFile with empty values if no new file uploaded
    if (!updateData.filePath) {
      delete updateData.filePath;
      delete updateData.ukuranFile;
    }

    // Determine the target documents to update
    const targetIds = [id];
    
    // First, fetch the original document to check for copies
    const originalDoc = await prisma.document.findUnique({ where: { id } });
    if (!originalDoc) return NextResponse.json({ success: false, error: 'Document not found' }, { status: 404 });

    if (body.applyToAll) {
      const copiesWhere: any = {};
      if (originalDoc.tipeFile === 'UPLOAD' && originalDoc.filePath) {
        copiesWhere.filePath = originalDoc.filePath;
      } else if (originalDoc.tipeFile === 'LINK' && originalDoc.linkRepository) {
        copiesWhere.linkRepository = originalDoc.linkRepository;
        copiesWhere.judul = originalDoc.judul;
        copiesWhere.tanggalTerbit = originalDoc.tanggalTerbit;
      }
      
      if (Object.keys(copiesWhere).length > 0) {
        const copies = await prisma.document.findMany({ where: copiesWhere, select: { id: true } });
        copies.forEach(copy => {
          if (!targetIds.includes(copy.id)) targetIds.push(copy.id);
        });
      }
    }

    // Update all targeted documents
    await prisma.document.updateMany({
      where: { id: { in: targetIds } },
      data: updateData,
    });

    // Create NEW copies for newly tagged employees
    if (Array.isArray(body.taggedEmployees) && body.taggedEmployees.length > 0) {
      // Find which tagged employees ALREADY have a copy (so we don't duplicate again)
      const existingCopies = await prisma.document.findMany({
        where: { id: { in: targetIds } },
        select: { employeeId: true }
      });
      const existingEmployeeIds = existingCopies.map(c => c.employeeId);
      
      const newTags = body.taggedEmployees.filter((empId: string) => !existingEmployeeIds.includes(empId));
      
      if (newTags.length > 0) {
        // Base document for new copies is the updated data merged with original data
        const finalDocData = { ...originalDoc, ...updateData };
        delete finalDocData.id;
        delete finalDocData.createdAt;
        delete finalDocData.updatedAt;
        
        const newCopies = newTags.map((empId: string) => ({
          ...finalDocData,
          employeeId: empId,
        }));
        
        await prisma.document.createMany({ data: newCopies });
      }
    }

    // Fetch the updated main document to return
    const updatedDocument = await prisma.document.findUnique({ where: { id } });
    return NextResponse.json({ success: true, data: updatedDocument });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    // Allow partial updates for specific toggles
    const updateData: any = {};
    if (body.isPinned !== undefined) updateData.isPinned = body.isPinned;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.approvalStatus !== undefined) updateData.approvalStatus = body.approvalStatus;

    const document = await prisma.document.update({
      where: { id },
      data: updateData,
    });
    return NextResponse.json({ success: true, data: document });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const permanent = searchParams.get('permanent') === 'true';

    const document = await prisma.document.findUnique({ where: { id } });
    if (!document) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });

    if (permanent) {
      if (document.tipeFile === 'UPLOAD' && document.filePath) {
        try {
          await fs.unlink(path.join(process.cwd(), 'public', document.filePath));
        } catch (e) {
          console.error('File to delete not found', e);
        }
      }
      await prisma.document.delete({ where: { id } });
      return NextResponse.json({ success: true, message: 'Permanently deleted' });
    }

    // Soft delete: Change status to 'DIHAPUS' instead of hard deleting
    await prisma.document.update({ 
      where: { id },
      data: { status: 'DIHAPUS' }
    });
    
    // Return previous status so the client knows what to restore it to if they click Undo
    return NextResponse.json({ success: true, previousStatus: document.status });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
