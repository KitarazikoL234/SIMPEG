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

    return NextResponse.json({ success: true, data: newTicket });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
