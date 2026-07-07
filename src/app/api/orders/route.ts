import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { addOrder, getOrders } from '@/lib/store';
import { verifyAdminToken, getTokenFromCookieHeader } from '@/lib/auth';
import { Order, OrderItem } from '@/types';

export async function GET(req: NextRequest) {
  const token = getTokenFromCookieHeader(req.headers.get('cookie'));
  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: 'No autorizado.' }, { status: 401 });
  }
  const orders = await getOrders();
  return NextResponse.json(orders);
}

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    customerName?: string;
    items?: OrderItem[];
    notes?: string;
  };

  const { customerName = '', items, notes = '' } = body;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'El carrito está vacío.' }, { status: 400 });
  }

  // Validate each item
  for (const item of items) {
    if (
      typeof item.menuItemId !== 'string' ||
      typeof item.menuItemName !== 'string' ||
      typeof item.quantity !== 'number' ||
      item.quantity < 1 ||
      item.quantity > 20 ||
      typeof item.price !== 'number'
    ) {
      return NextResponse.json({ error: 'Datos de pedido inválidos.' }, { status: 400 });
    }
  }

  const safeName = String(customerName).slice(0, 60).trim();
  const safeNotes = String(notes).slice(0, 200).trim();

  const order: Order = {
    id: uuidv4(),
    customerName: safeName || 'Anónimo',
    items,
    status: 'new',
    notes: safeNotes,
    createdAt: new Date().toISOString(),
  };

  try {
    await addOrder(order);
  } catch (err) {
    console.error('addOrder failed:', err);
    return NextResponse.json({ error: 'No se pudo guardar el pedido.' }, { status: 500 });
  }
  return NextResponse.json(order, { status: 201 });
}
