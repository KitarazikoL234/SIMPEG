import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { SessionData, sessionOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (!session.isLoggedIn) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        user: { select: { nama: true, email: true } },
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { sender: { select: { nama: true, role: true } } }
        }
      }
    });

    if (!ticket) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    // Validate access
    if (session.role !== 'ADMIN' && session.role !== 'PIMPINAN' && ticket.userId !== session.userId) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ success: true, data: ticket });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if (!session.isLoggedIn || !session.userId) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { message, action } = body; // action can be "CLOSE"

    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    // Validate access
    if (session.role !== 'ADMIN' && session.role !== 'PIMPINAN' && ticket.userId !== session.userId) {
      return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
    }

    if (action === 'CLOSE') {
      await prisma.ticket.update({ where: { id }, data: { status: 'SELESAI' } });
      return NextResponse.json({ success: true, message: "Ticket closed" });
    }

    if (action === 'UPDATE_STATUS' && body.status) {
      await prisma.ticket.update({ where: { id }, data: { status: body.status } });
      return NextResponse.json({ success: true, message: "Status updated" });
    }

    if (!message) return NextResponse.json({ success: false, error: "Message is required" }, { status: 400 });

    const newMessage = await prisma.ticketMessage.create({
      data: {
        ticketId: id,
        senderId: session.userId,
        message,
        isFromAdmin: session.role === 'ADMIN'
      }
    });

    // Update ticket status if it's admin replying
    if (session.role === 'ADMIN' && (ticket.status === 'OPEN' || ticket.status === 'BARU')) {
      await prisma.ticket.update({ where: { id }, data: { status: 'DIPROSES', updatedAt: new Date() } });
    } else {
      await prisma.ticket.update({ where: { id }, data: { updatedAt: new Date() } });
    }

    return NextResponse.json({ success: true, data: newMessage });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
