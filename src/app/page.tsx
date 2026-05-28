'use client';

import { useState, useCallback } from 'react';
import { MenuItem, CartItem, OrderItem } from '@/types';
import { menuItems } from '@/lib/menu';
import MenuCard from '@/components/MenuCard';
import OrderModal from '@/components/OrderModal';

type OrderStep = 'menu' | 'cart' | 'success';

export default function CustomerMenu() {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');
  const [step, setStep] = useState<OrderStep>('menu');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'hot' | 'cold'>('all');
  const [isPlacing, setIsPlacing] = useState(false);
  const [error, setError] = useState('');

  const addToCart = useCallback((item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.item.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { item, quantity: 1 }];
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === itemId);
      if (!existing) return prev;
      if (existing.quantity === 1) return prev.filter((c) => c.item.id !== itemId);
      return prev.map((c) =>
        c.item.id === itemId ? { ...c, quantity: c.quantity - 1 } : c
      );
    });
  }, []);

  const totalItems = cart.reduce((s, c) => s + c.quantity, 0);
  const totalPrice = cart.reduce((s, c) => s + c.item.price * c.quantity, 0);

  const filtered =
    categoryFilter === 'all'
      ? menuItems
      : menuItems.filter((m) => m.category === categoryFilter);

  async function placeOrder() {
    if (cart.length === 0) return;
    setIsPlacing(true);
    setError('');
    try {
      const items: OrderItem[] = cart.map((c) => ({
        menuItemId: c.item.id,
        menuItemName: c.item.name,
        quantity: c.quantity,
        price: c.item.price,
      }));
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerName, items, notes }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? 'Error al enviar el pedido.');
      }
      setCart([]);
      setStep('success');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error inesperado.');
    } finally {
      setIsPlacing(false);
    }
  }

  // ─── Success screen ───────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="text-7xl mb-6 animate-fade-in-up">☕</div>
        <h1
          className="font-playfair text-4xl font-bold text-wood-pale mb-3 animate-fade-in-up"
          style={{ animationDelay: '0.1s' }}
        >
          ¡Pedido enviado!
        </h1>
        <p
          className="text-stone-light text-lg max-w-sm mb-8 animate-fade-in-up"
          style={{ animationDelay: '0.2s' }}
        >
          {customerName ? `¡Gracias, ${customerName}! ` : ''}
          Tu café estará listo en unos momentos. Relájate y disfruta la cabaña 🌲
        </p>
        <div
          className="text-4xl mb-6 animate-fade-in-up"
          style={{ animationDelay: '0.3s' }}
        >
          🌲🔥🌲
        </div>
        <button
          onClick={() => {
            setStep('menu');
            setCustomerName('');
            setNotes('');
          }}
          className="btn-primary text-base animate-fade-in-up"
          style={{ animationDelay: '0.4s' }}
        >
          Volver al menú
        </button>
      </div>
    );
  }

  // ─── Cart / checkout screen ───────────────────────────────────────────────
  if (step === 'cart') {
    return (
      <div className="min-h-screen max-w-lg mx-auto p-5">
        <button
          onClick={() => setStep('menu')}
          className="text-stone-medium hover:text-wood-pale transition-colors mb-6 flex items-center gap-2 text-sm"
        >
          ← Volver al menú
        </button>

        <h1 className="font-playfair text-3xl font-bold text-wood-pale mb-6">
          Tu pedido
        </h1>

        {/* Cart items */}
        <div className="space-y-3 mb-6">
          {cart.map(({ item, quantity }) => (
            <div
              key={item.id}
              className="flex items-center gap-3 bg-wood-deep border border-wood-warm/20 rounded-xl p-4"
            >
              <span className="text-2xl">{item.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-wood-pale text-sm">{item.name}</p>
                <p className="text-xs text-stone-medium">${item.price} c/u</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="w-7 h-7 rounded-full bg-wood-medium text-wood-pale hover:bg-wood-warm transition-colors text-sm font-bold"
                >
                  −
                </button>
                <span className="text-wood-pale font-bold w-5 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => addToCart(item)}
                  className="w-7 h-7 rounded-full bg-wood-medium text-wood-pale hover:bg-wood-warm transition-colors text-sm font-bold"
                >
                  +
                </button>
              </div>
              <span className="text-amber-glow font-bold text-sm w-16 text-right">
                ${item.price * quantity}
              </span>
            </div>
          ))}
        </div>

        {/* Customer name */}
        <div className="mb-4">
          <label
            className="block text-sm text-stone-light mb-1.5"
            htmlFor="name"
          >
            Tu nombre{' '}
            <span className="text-stone-medium text-xs">(opcional)</span>
          </label>
          <input
            id="name"
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value.slice(0, 60))}
            placeholder="¿Cómo te llamamos?"
            maxLength={60}
            className="w-full bg-wood-deep border border-wood-warm/30 rounded-xl px-4 py-3 text-wood-pale placeholder:text-stone-dark focus:outline-none focus:border-amber-fire transition-colors"
          />
        </div>

        {/* Notes */}
        <div className="mb-6">
          <label
            className="block text-sm text-stone-light mb-1.5"
            htmlFor="notes"
          >
            Notas especiales{' '}
            <span className="text-stone-medium text-xs">(opcional)</span>
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value.slice(0, 200))}
            placeholder="Sin azúcar, extra caliente, doble shot…"
            maxLength={200}
            rows={2}
            className="w-full bg-wood-deep border border-wood-warm/30 rounded-xl px-4 py-3 text-wood-pale placeholder:text-stone-dark focus:outline-none focus:border-amber-fire transition-colors resize-none"
          />
        </div>

        {/* Total & place */}
        {error && <p className="text-red-400 text-sm mb-3">{error}</p>}
        <div className="bg-wood-deep border border-wood-warm/20 rounded-xl p-4 mb-4 flex items-center justify-between">
          <span className="text-stone-light">Total</span>
          <span className="font-playfair text-2xl font-bold text-amber-glow">
            ${totalPrice}
          </span>
        </div>
        <button
          onClick={placeOrder}
          disabled={isPlacing}
          className="btn-primary w-full text-base py-3 disabled:opacity-60"
        >
          {isPlacing ? 'Enviando…' : '☕ Confirmar pedido'}
        </button>
      </div>
    );
  }

  // ─── Main menu ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen">
      {/* Hero header */}
      <header
        className="relative overflow-hidden border-b px-5 pt-10 pb-8"
        style={{
          background:
            'linear-gradient(160deg, #1E1108 0%, #2D1A0A 50%, #1A2E23 100%)',
          borderColor: 'rgba(122,74,40,0.25)',
        }}
      >
        {/* Wood grain texture overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(75deg, transparent, transparent 28px, rgba(200,160,80,0.8) 28px, rgba(200,160,80,0.8) 29px)',
          }}
        />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="text-5xl mb-3 animate-fade-in-up">☕</div>
          <h1
            className="font-playfair text-4xl sm:text-5xl font-black text-wood-pale leading-tight mb-2 animate-fade-in-up"
            style={{ animationDelay: '0.05s' }}
          >
            Café de Montaña
          </h1>
          <p
            className="text-stone-light text-base max-w-xs mx-auto leading-relaxed animate-fade-in-up"
            style={{ animationDelay: '0.1s' }}
          >
            Artesanal · Preparado en tu Ninja ES601
          </p>
          <div
            className="flex items-center justify-center gap-3 mt-4 text-2xl opacity-50 animate-fade-in-up"
            style={{ animationDelay: '0.15s' }}
          >
            <span>🌲</span>
            <span>🏔️</span>
            <span>🔥</span>
            <span>🌲</span>
          </div>
        </div>
      </header>

      {/* Sticky bar — filters + cart */}
      <div
        className="sticky top-0 z-30 backdrop-blur-md border-b px-4 py-3 flex items-center justify-between gap-3"
        style={{
          background: 'rgba(16, 8, 4, 0.92)',
          borderColor: 'rgba(122,74,40,0.2)',
        }}
      >
        <div className="flex gap-1.5">
          {(['all', 'hot', 'cold'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setCategoryFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-colors border ${
                categoryFilter === f
                  ? 'bg-amber-fire text-wood-dark border-amber-fire'
                  : 'border-wood-warm/30 text-stone-medium hover:text-wood-pale hover:border-wood-warm/60'
              }`}
            >
              {f === 'all' ? '☕ Todo' : f === 'hot' ? '🔥 Caliente' : '🧊 Frío'}
            </button>
          ))}
        </div>

        <button
          onClick={() => totalItems > 0 && setStep('cart')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all border whitespace-nowrap ${
            totalItems > 0
              ? 'bg-amber-fire text-wood-dark border-amber-fire hover:bg-amber-glow cursor-pointer'
              : 'border-wood-warm/20 text-stone-dark cursor-default'
          }`}
        >
          🛒{' '}
          {totalItems > 0
            ? `${totalItems} ítem${totalItems > 1 ? 's' : ''} · $${totalPrice}`
            : 'Vacío'}
        </button>
      </div>

      {/* Menu grid */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {categoryFilter === 'all' ? (
          <>
            <SectionTitle title="🔥 Bebidas Calientes" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
              {menuItems
                .filter((m) => m.category === 'hot')
                .map((item, i) => (
                  <div
                    key={item.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <MenuCard item={item} onSelect={setSelectedItem} />
                  </div>
                ))}
            </div>
            <SectionTitle title="🧊 Bebidas Frías" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {menuItems
                .filter((m) => m.category === 'cold')
                .map((item, i) => (
                  <div
                    key={item.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <MenuCard item={item} onSelect={setSelectedItem} />
                  </div>
                ))}
            </div>
          </>
        ) : (
          <>
            <SectionTitle
              title={
                categoryFilter === 'hot'
                  ? '🔥 Bebidas Calientes'
                  : '🧊 Bebidas Frías'
              }
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((item, i) => (
                <div
                  key={item.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  <MenuCard item={item} onSelect={setSelectedItem} />
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-stone-medium text-xs border-t border-wood-warm/10">
        <p>Hecho con ☕ en tu Ninja DualBrew Pro ES601 · 🌲 Cabaña de Montaña</p>
      </footer>

      {/* Item detail modal */}
      {selectedItem && (
        <OrderModal
          item={selectedItem}
          cart={cart}
          onAddToCart={addToCart}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-4 mb-5">
      <h2 className="font-playfair text-2xl font-bold text-wood-pale whitespace-nowrap">
        {title}
      </h2>
      <div className="flex-1 h-px bg-wood-warm/20" />
    </div>
  );
}

