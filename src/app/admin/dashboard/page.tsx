'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Order, OrderStatus } from '@/types';
import AdminOrderCard from '@/components/AdminOrderCard';

const STATUS_FILTERS: { value: 'all' | OrderStatus; label: string }[] = [
  { value: 'all', label: '📋 Todos' },
  { value: 'new', label: '🔔 Nuevos' },
  { value: 'preparing', label: '⚙️ En prep.' },
  { value: 'ready', label: '✅ Listos' },
  { value: 'completed', label: '✓ Entregados' },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<'all' | OrderStatus>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [lastCount, setLastCount] = useState(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.status === 401) {
        router.replace('/admin');
        return;
      }
      const data = (await res.json()) as Order[];
      setOrders(data);
      setIsLoading(false);
      return data;
    } catch {
      setIsLoading(false);
    }
  }, [router]);

  // Play a simple notification chime using Web Audio API
  function playChime() {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioContext();
      }
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(660, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      // Silently ignore — AudioContext may be blocked until user interaction
    }
  }

  // Initial load
  useEffect(() => {
    fetchOrders().then((data) => {
      if (data) setLastCount(data.filter((o) => o.status === 'new').length);
    });
  }, [fetchOrders]);

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const data = await fetchOrders();
      if (data) {
        const newCount = data.filter((o) => o.status === 'new').length;
        if (newCount > lastCount) playChime();
        setLastCount(newCount);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [fetchOrders, lastCount]);

  async function handleStatusChange(id: string, status: OrderStatus) {
    try {
      await fetch(`/api/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o))
      );
    } catch {
      // silently fail — next poll will sync
    }
  }

  async function handleDelete(id: string) {
    try {
      await fetch(`/api/orders/${id}`, { method: 'DELETE' });
      setOrders((prev) => prev.filter((o) => o.id !== id));
    } catch {
      // silently fail
    }
  }

  async function handleLogout() {
    await fetch('/api/auth', { method: 'DELETE' });
    router.replace('/admin');
  }

  const filtered =
    filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  const newCount = orders.filter((o) => o.status === 'new').length;
  const preparingCount = orders.filter((o) => o.status === 'preparing').length;

  return (
    <div className="min-h-screen">
      {/* Top nav */}
      <header
        className="border-b px-5 py-4 flex items-center justify-between"
        style={{
          background: 'linear-gradient(90deg, #1E1108, #1A2E23)',
          borderColor: 'rgba(122,74,40,0.25)',
        }}
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl">☕</span>
          <div>
            <h1 className="font-playfair text-lg font-bold text-wood-pale leading-none">
              Panel de Control
            </h1>
            <p className="text-xs text-stone-medium">Café de Montaña</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/admin/qr"
            className="text-xs text-stone-light hover:text-wood-pale transition-colors border border-wood-warm/30 hover:border-wood-warm/60 px-3 py-1.5 rounded-lg"
          >
            📱 Código QR
          </a>
          <button
            onClick={handleLogout}
            className="text-xs text-stone-medium hover:text-red-400 transition-colors"
          >
            Salir
          </button>
        </div>
      </header>

      {/* Stats bar */}
      <div
        className="border-b px-5 py-3 flex items-center gap-6 text-sm overflow-x-auto"
        style={{ borderColor: 'rgba(122,74,40,0.15)' }}
      >
        <Stat
          label="Nuevos"
          value={newCount}
          highlight={newCount > 0}
          color="text-amber-fire"
        />
        <Stat label="En preparación" value={preparingCount} color="text-blue-300" />
        <Stat
          label="Total hoy"
          value={orders.length}
          color="text-stone-light"
        />
        <div className="ml-auto text-xs text-stone-dark whitespace-nowrap">
          🔄 Actualiza cada 5 s
        </div>
      </div>

      {/* Filter tabs */}
      <div
        className="border-b px-5 py-3 flex gap-2 overflow-x-auto"
        style={{ borderColor: 'rgba(122,74,40,0.15)' }}
      >
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`text-xs px-3 py-1.5 rounded-full font-semibold whitespace-nowrap transition-colors border ${
              filter === f.value
                ? 'bg-amber-fire text-wood-dark border-amber-fire'
                : 'border-wood-warm/30 text-stone-medium hover:text-wood-pale hover:border-wood-warm/60'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Orders */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        {isLoading ? (
          <div className="text-center py-20 text-stone-medium">
            <div className="text-4xl mb-3 animate-spin inline-block">⚙️</div>
            <p>Cargando pedidos…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-stone-medium">
            <div className="text-5xl mb-4 opacity-30">☕</div>
            <p className="font-playfair text-xl text-stone-medium">
              {filter === 'all'
                ? 'Aún no hay pedidos'
                : 'No hay pedidos en este estado'}
            </p>
            <p className="text-sm mt-2 text-stone-dark">
              Los pedidos aparecerán aquí en tiempo real
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((order) => (
              <AdminOrderCard
                key={order.id}
                order={order}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  color,
  highlight,
}: {
  label: string;
  value: number;
  color: string;
  highlight?: boolean;
}) {
  return (
    <div className={`flex items-center gap-1.5 ${highlight ? 'animate-pulse' : ''}`}>
      <span className={`font-bold text-base ${color}`}>{value}</span>
      <span className="text-stone-dark text-xs">{label}</span>
    </div>
  );
}
