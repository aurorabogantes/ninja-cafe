import { createClient } from '@supabase/supabase-js';
import { Order } from '@/types';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToOrder(row: any): Order {
  return {
    id: row.id,
    customerName: row.customer_name,
    items: row.items,
    status: row.status,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(rowToOrder);
}

export async function addOrder(order: Order): Promise<void> {
  const { error } = await supabase.from('orders').insert({
    id: order.id,
    customer_name: order.customerName,
    items: order.items,
    status: order.status,
    notes: order.notes,
    created_at: order.createdAt,
  });
  if (error) throw error;
}

export async function updateOrderStatus(
  id: string,
  status: Order['status'],
): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  if (error) return null;
  return rowToOrder(data);
}

export async function deleteOrder(id: string): Promise<boolean> {
  const { error, count } = await supabase
    .from('orders')
    .delete({ count: 'exact' })
    .eq('id', id);
  if (error) return false;
  return (count ?? 0) > 0;
}
