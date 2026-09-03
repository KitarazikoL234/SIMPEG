import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { SessionData, sessionOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (!session.isLoggedIn) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    let tickets;
    if (session.role === 'ADMIN' || session.role === 'PIMPINAN') {
      tickets = await prisma.ticket.findMany({
        include: { user: { select: { nama: true, email: true } } },
        orderBy: { updatedAt: 'desc' }
      });
    } else {
      tickets = await prisma.ticket.findMany({
        where: { userId: session.userId },
        orderBy: { updatedAt: 'desc' }
      });
    }

    return NextResponse.json({ success: true, data: tickets });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (!session.isLoggedIn || !session.userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { subject, kategori, message } = body;

    if (!subject || !message) {
      return NextResponse.json({ success: false, error: "Subject and message are required" }, { status: 400 });
    }

    // Buat tiket awal dari user
    const newTicket = await prisma.ticket.create({
      data: {
        subject,
        kategori: kategori || 'UMUM',
        status: 'BARU',
        userId: session.userId,
        messages: {
          create: {
            message,
            senderId: session.userId,
            isFromAdmin: session.role === 'ADMIN'
          }
        }
      }
    });

    // 🤖 LOGIKA AUTO-REPLY BOT 🤖
    // Hanya berjalan jika tiket dibuat oleh user biasa (bukan Admin)
    if (session.role !== 'ADMIN') {
      // Cari 1 akun admin untuk dijadikan pengirim pesan bot
      const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
      
      if (adminUser) {
        const lowerMsg = message.toLowerCase() + " " + subject.toLowerCase();
        let botReply = "";

        if (lowerMsg.includes("password") || lowerMsg.includes("sandi") || lowerMsg.includes("login")) {
          botReply = "Halo! Saya Asisten Virtual SIMPEG. 🤖\n\nUntuk masalah password atau kendala login, Anda bisa mencoba menggunakan fitur 'Lupa Password' di halaman awal. Jika akun Anda terkunci, mohon lampirkan NIK/NIP Anda di sini agar kami bisa meresetnya dari sistem.";
        } else if (lowerMsg.includes("sister") || lowerMsg.includes("sinkronisasi") || lowerMsg.includes("tarik")) {
          botReply = "Halo! Saya Asisten Virtual SIMPEG. 🤖\n\nTerkait integrasi SISTER, sinkronisasi data dilakukan secara otomatis setiap jam 00:00 WIB. Jika Anda membutuhkan sinkronisasi paksa (force sync) saat ini juga, mohon cantumkan NIDN Anda dan kami akan memprosesnya.";
        } else if (lowerMsg.includes("cuti") || lowerMsg.includes("absen") || lowerMsg.includes("presensi")) {
          botReply = "Halo! Saya Asisten Virtual SIMPEG. 🤖\n\nUntuk masalah presensi atau pengajuan cuti, pastikan Anda telah melampirkan bukti surat yang valid (PDF/JPG) jika ada. Admin bagian kepegawaian akan segera mengecek data kehadiran Anda.";
        } else {
          botReply = "Halo! Terima kasih telah menghubungi layanan bantuan SIMPEG. 🤖\n\nTiket Anda telah kami terima dengan nomor antrean #" + newTicket.id.split('-')[0].toUpperCase() + ".\n\nMohon menunggu sebentar, Admin / Tim IT kami akan segera membalas pesan Anda di jam kerja (08:00 - 16:00).";
        }

        // Simpan balasan bot ke database
        await prisma.ticketMessage.create({
          data: {
            message: botReply,
            senderId: adminUser.id,
            isFromAdmin: true,
            ticketId: newTicket.id
          }
        });
      }
    }

    return NextResponse.json({ success: true, data: newTicket });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
