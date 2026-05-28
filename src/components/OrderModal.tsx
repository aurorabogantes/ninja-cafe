'use client';

import { useEffect } from 'react';
import { MenuItem, CartItem } from '@/types';

interface Props {
  item: MenuItem;
  cart: CartItem[];
  onAddToCart: (item: MenuItem) => void;
  onClose: () => void;
}

export default function OrderModal({ item, cart, onAddToCart, onClose }: Props) {
  const cartQty = cart.find((c) => c.item.id === item.id)?.quantity ?? 0;

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={item.name}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-wood-deep border border-wood-warm/30 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-wood-deep border-b border-wood-warm/20 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{item.emoji}</span>
            <div>
              <h2 className="font-playfair text-xl font-bold text-wood-pale">{item.name}</h2>
              <p className="text-xs text-stone-medium uppercase tracking-wider">
                {item.brewType} · {item.brewSize}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-medium hover:text-wood-pale transition-colors text-2xl leading-none"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Description */}
          <p className="text-stone-light leading-relaxed text-base">{item.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-3 py-1 rounded-full bg-wood-medium/50 text-stone-pale capitalize border border-wood-warm/20"
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Flavor profile */}
          <div className="rounded-xl bg-wood-medium/20 border border-wood-warm/20 p-4 space-y-3">
            <p className="text-xs text-stone-medium uppercase tracking-wider font-semibold">☕ Perfil de la bebida</p>
            <div className="grid grid-cols-2 gap-3">
              <InfoPill icon="⚗️" label="Método" value={item.brewType} />
              <InfoPill icon="📐" label="Tamaño" value={item.brewSize} />
              <InfoPill
                icon={item.category === 'hot' ? '🔥' : '🧊'}
                label="Temperatura"
                value={item.category === 'hot' ? 'Caliente' : 'Frío'}
              />
            </div>
          </div>

          {/* Price & Add to cart */}
          <div className="flex items-center justify-between pt-2">
            <span className="font-playfair text-3xl font-bold text-amber-glow">
              ${item.price}
            </span>
            <button
              onClick={() => {
                onAddToCart(item);
                onClose();
              }}
              className="btn-primary flex items-center gap-2"
            >
              {cartQty > 0 ? `Añadir otra (+${cartQty})` : 'Agregar al pedido'} →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoPill({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-base mt-0.5">{icon}</span>
      <div>
        <span className="text-xs text-stone-medium uppercase tracking-wider block">{label}</span>
        <span className="text-sm text-wood-pale font-medium">{value}</span>
      </div>
    </div>
  );
}
