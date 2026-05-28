import { NextRequest, NextResponse } from 'next/server';
import { updateOrderStatus, deleteOrder } from '@/lib/store';
import { verifyAdminToken, getTokenFromCookieHeader } from '@/lib/auth';
import { OrderStatus } from '@/types';

const VALID_STATUSES: OrderStatus[] = ['new', 'preparing', 'ready', 'completed'];

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = getTokenFromCookieHeader(req.headers.get('cookie'));
  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  const { id } = await params;
  const { status } = await req.json() as { status?: OrderStatus };

  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Estado inválido.' }, { status: 400 });
  }

  const updated = updateOrderStatus(id, status);
  if (!updated) {
    return NextResponse.json({ error: 'Pedido no encontrado.' }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const token = getTokenFromCookieHeader(req.headers.get('cookie'));
  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }

  const { id } = await params;
  const ok = deleteOrder(id);
  if (!ok) {
    return NextResponse.json({ error: 'Pedido no encontrado.' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
