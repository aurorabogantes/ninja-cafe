'use client';

import { useState, useCallback } from 'react';
import { Order, OrderStatus, AISuggestion } from '@/types';
import { menuItems } from '@/lib/menu';

type SugState = 'idle' | 'loading' | 'done' | 'error';

function AiSuggestionPanel({ menuItemId }: { menuItemId: string }) {
  const [state, setState] = useState<SugState>('idle');
  const [data, setData] = useState<AISuggestion | null>(null);

  const menuItem = menuItems.find((m) => m.id === menuItemId);

  const fetch_ = useCallback(async () => {
    if (!menuItem) return;
    setState('loading');
    try {
      const res = await fetch('/api/ai-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          drinkName: menuItem.name,
          description: menuItem.description,
          brewType: menuItem.brewType,
        }),
      });
      const json = (await res.json()) as AISuggestion;
      setData(json);
      setState('done');
    } catch {
      setState('error');
    }
  }, [menuItem]);

  return (
    <div className="mt-3 rounded-lg border border-amber-fire/30 bg-amber-fire/5 p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-amber-glow flex items-center gap-1.5">
          🤖 Sugerencias IA — Tueste & Molienda
        </span>
        {state === 'idle' && (
          <button
            onClick={fetch_}
            className="text-xs bg-amber-fire text-wood-dark font-bold px-2.5 py-1 rounded-lg hover:bg-amber-glow transition-colors"
          >
            Consultar ✨
          </button>
        )}
      </div>
      {state === 'idle' && (
        <p className="text-xs text-stone-dark italic">Presiona consultar para obtener recomendaciones personalizadas.</p>
      )}
      {state === 'loading' && (
        <div className="flex items-center gap-2 text-stone-light text-xs">
          <div className="w-3 h-3 border-2 border-amber-fire border-t-transparent rounded-full animate-spin" />
          Analizando perfil de sabor…
        </div>
      )}
      {state === 'error' && (
        <p className="text-xs text-red-400">No se pudo obtener sugerencias.</p>
      )}
      {state === 'done' && data && (
        <div className="space-y-2">
          <AiRow icon="🌰" label="Tueste" value={data.roast} />
          <AiRow icon="⚙️" label="Molienda" value={data.grind} />
          <AiRow icon="🌡️" label="Temperatura" value={data.temperature} />
          <p className="text-xs text-stone-light italic pt-1 border-t border-amber-fire/20">{data.notes}</p>
        </div>
      )}
    </div>
  );
}

function AiRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-sm mt-0.5">{icon}</span>
      <div>
        <span className="text-xs text-stone-medium uppercase tracking-wider block">{label}</span>
        <span className="text-xs text-wood-pale font-medium">{value}</span>
      </div>
    </div>
  );
}

interface Props {
  order: Order;
  onStatusChange: (id: string, status: OrderStatus) => void;
  onDelete: (id: string) => void;
}

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; next?: OrderStatus; nextLabel?: string }> = {
  new: {
    label: 'Nuevo',
    color: 'bg-amber-fire/20 text-amber-fire border-amber-fire/40',
    next: 'preparing',
    nextLabel: '→ En preparación',
  },
  preparing: {
    label: 'En preparación',
    color: 'bg-blue-500/20 text-blue-300 border-blue-400/40',
    next: 'ready',
    nextLabel: '→ Listo',
  },
  ready: {
    label: '✓ Listo',
    color: 'bg-forest-light/20 text-forest-light border-forest-light/40',
    next: 'completed',
    nextLabel: '→ Entregado',
  },
  completed: {
    label: 'Entregado',
    color: 'bg-stone-medium/20 text-stone-medium border-stone-medium/40',
  },
};

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

export default function AdminOrderCard({ order, onStatusChange, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);

  const config = STATUS_CONFIG[order.status];
  const total = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div
      className={`rounded-xl border transition-all duration-200 overflow-hidden ${
        order.status === 'new'
          ? 'border-amber-fire/50 shadow-lg shadow-amber-fire/10'
          : 'border-wood-warm/20'
      } bg-wood-deep`}
    >
      {/* Order header */}
      <div className="p-4 flex items-center gap-3">
        {/* Status dot */}
        <div
          className={`w-3 h-3 rounded-full flex-shrink-0 ${
            order.status === 'new'
              ? 'bg-amber-fire animate-pulse'
              : order.status === 'preparing'
              ? 'bg-blue-400'
              : order.status === 'ready'
              ? 'bg-forest-light'
              : 'bg-stone-medium'
          }`}
        />

        {/* Customer & time */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-playfair font-bold text-wood-pale text-base">
              {order.customerName}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${config.color}`}>
              {config.label}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-stone-medium mt-0.5">
            <span>🕐 {formatTime(order.createdAt)}</span>
            <span>·</span>
            <span>{order.items.reduce((s, i) => s + i.quantity, 0)} ítem(s)</span>
            <span>·</span>
            <span className="text-amber-glow font-semibold">${total}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {config.next && (
            <button
              onClick={() => onStatusChange(order.id, config.next!)}
              className="text-xs bg-forest-deep text-forest-light border border-forest-light/30 hover:bg-forest-medium hover:text-wood-pale px-3 py-1.5 rounded-lg transition-colors font-medium"
            >
              {config.nextLabel}
            </button>
          )}
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-stone-medium hover:text-wood-pale transition-colors px-2 py-1.5 rounded-lg hover:bg-wood-medium/30 text-sm"
            aria-label="Expandir pedido"
          >
            {expanded ? '▲' : '▼'}
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-wood-warm/20 p-4 space-y-3">
          {/* Notes */}
          {order.notes && (
            <div className="text-xs bg-amber-fire/10 border border-amber-fire/20 rounded-lg p-3 text-stone-pale italic">
              📝 Nota: {order.notes}
            </div>
          )}

          {/* Items */}
          <div className="space-y-2">
            {order.items.map((orderItem) => {
              const menuItem = menuItems.find((m) => m.id === orderItem.menuItemId);
              const isActive = activeItemId === orderItem.menuItemId;
              return (
                <div key={orderItem.menuItemId} className="rounded-lg overflow-hidden border border-wood-warm/20">
                  <button
                    className="w-full text-left px-4 py-3 flex items-center justify-between hover:bg-wood-medium/20 transition-colors"
                    onClick={() => setActiveItemId(isActive ? null : orderItem.menuItemId)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{menuItem?.emoji ?? '☕'}</span>
                      <div>
                        <span className="text-sm font-semibold text-wood-pale">
                          {orderItem.quantity > 1 && (
                            <span className="text-amber-fire mr-1">×{orderItem.quantity}</span>
                          )}
                          {orderItem.menuItemName}
                        </span>
                        {menuItem && (
                          <p className="text-xs text-stone-medium">
                            {menuItem.brewType} · {menuItem.brewSize}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-amber-glow font-semibold">
                        ${orderItem.price * orderItem.quantity}
                      </span>
                      <span className="text-stone-medium text-xs">
                        {isActive ? '▲' : '▼ ver pasos'}
                      </span>
                    </div>
                  </button>

                  {/* Prep steps + AI suggestions */}
                  {isActive && menuItem && (
                    <div className="px-4 pb-4 bg-wood-dark/30 border-t border-wood-warm/20">
                      <p className="text-xs text-stone-medium uppercase tracking-wider font-semibold mt-3 mb-2">
                        📋 Pasos de preparación — Ninja ES601
                      </p>
                      <ol className="space-y-2">
                        {menuItem.prepSteps.map((step, i) => (
                          <li key={i} className="flex gap-3 text-sm text-stone-light">
                            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-amber-fire/20 text-amber-fire text-xs flex items-center justify-center font-bold mt-0.5">
                              {i + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                      <AiSuggestionPanel menuItemId={orderItem.menuItemId} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Delete */}
          {order.status === 'completed' && (
            <div className="pt-1 text-right">
              <button
                onClick={() => onDelete(order.id)}
                className="text-xs text-red-400/70 hover:text-red-400 transition-colors underline"
              >
                Eliminar pedido
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
