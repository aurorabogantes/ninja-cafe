'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        throw new Error(data.error ?? 'Error al iniciar sesión.');
      }
      router.push('/admin/dashboard');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error inesperado.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">☕</div>
          <h1 className="font-playfair text-3xl font-bold text-wood-pale">Panel Admin</h1>
          <p className="text-stone-medium text-sm mt-1">Café de Montaña</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleLogin}
          className="bg-wood-deep border border-wood-warm/20 rounded-2xl p-6 space-y-4"
        >
          <div>
            <label className="block text-sm text-stone-light mb-1.5" htmlFor="password">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoFocus
              className="w-full bg-wood-medium/30 border border-wood-warm/30 rounded-xl px-4 py-3 text-wood-pale placeholder:text-stone-dark focus:outline-none focus:border-amber-fire transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading || !password}
            className="btn-primary w-full py-3 disabled:opacity-60"
          >
            {isLoading ? 'Verificando…' : 'Entrar al panel →'}
          </button>
        </form>

        <div className="text-center mt-5">
          <a
            href="/"
            className="text-xs text-stone-medium hover:text-stone-light transition-colors"
          >
            ← Ver menú de clientes
          </a>
        </div>
      </div>
    </div>
  );
}
