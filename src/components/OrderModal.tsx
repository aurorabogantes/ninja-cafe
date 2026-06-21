'use client';

import { useEffect } from 'react';
import { MenuItem, CartItem } from '@/types';
import {
  X, Coffee, Droplets, FlaskConical, Maximize2, Flame, Snowflake, ChevronRight, IceCreamBowl,
} from 'lucide-react';

interface Props {
  item: MenuItem;
  cart: CartItem[];
  onAddToCart: (item: MenuItem) => void;
  onClose: () => void;
}

export default function OrderModal({ item, cart, onAddToCart, onClose }: Props) {
  const cartQty = cart.find((c) => c.item.id === item.id)?.quantity ?? 0;
  const isHot = item.category === 'hot';
  const isDessert = item.category === 'dessert';

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
        className="absolute inset-0 bg-black/75 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-wood-deep border border-wood-warm/30 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scale-in">
        {/* Header */}
        <div className="sticky top-0 bg-wood-deep border-b border-wood-warm/20 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isHot
                  ? 'bg-amber-fire/20 border border-amber-fire/30'
                  : isDessert
                  ? 'bg-amber-glow/20 border border-amber-glow/30'
                  : 'bg-forest-medium/30 border border-forest-light/30'
              }`}
            >
              {isHot
                ? <Coffee size={20} className="text-amber-glow" />
                : isDessert
                ? <IceCreamBowl size={20} className="text-amber-soft" />
                : <Droplets size={20} className="text-forest-light" />
              }
            </div>
            <div>
              <h2 className="font-playfair text-xl font-bold text-wood-pale">{item.name}</h2>
              <p className="text-xs text-stone-medium uppercase tracking-wider">
                {item.brewType} · {item.brewSize}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-medium hover:text-wood-pale hover:bg-wood-medium/40 transition-colors"
            aria-label="Cerrar"
          >
            <X size={18} />
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
            <div className="flex items-center gap-2">
              <FlaskConical size={13} className="text-stone-medium" />
              <p className="text-xs text-stone-medium uppercase tracking-wider font-semibold">Perfil de la bebida</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <InfoPill icon={<FlaskConical size={14} />} label="Método" value={item.brewType} />
              <InfoPill icon={<Maximize2 size={14} />} label="Tamaño" value={item.brewSize} />
              <InfoPill
                icon={isHot ? <Flame size={14} /> : isDessert ? <IceCreamBowl size={14} /> : <Snowflake size={14} />}
                label="Temperatura"
                value={isHot ? 'Caliente' : isDessert ? 'Helado' : 'Frío'}
              />
            </div>
          </div>

          {/* Add to cart */}
          <div className="flex justify-end pt-2">
            <button
              onClick={() => {
                onAddToCart(item);
                onClose();
              }}
              className="btn-primary flex items-center gap-2"
            >
              {cartQty > 0 ? `Añadir otra (+${cartQty})` : 'Agregar al pedido'}
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoPill({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <div className="text-amber-glow mt-0.5 flex-shrink-0">{icon}</div>
      <div>
        <span className="text-xs text-stone-medium uppercase tracking-wider block">{label}</span>
        <span className="text-sm text-wood-pale font-medium">{value}</span>
      </div>
    </div>
  );
}
