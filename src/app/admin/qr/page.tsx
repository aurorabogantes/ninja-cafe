'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Coffee, ArrowLeft } from 'lucide-react';

export default function QRPage() {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [menuUrl, setMenuUrl] = useState('');

  useEffect(() => {
    const origin = window.location.origin;
    setMenuUrl(origin);
    setCustomUrl(origin);
  }, []);

  useEffect(() => {
    if (!customUrl) return;
    QRCode.toDataURL(customUrl, {
      width: 360,
      margin: 2,
      color: {
        dark: '#1E1108',
        light: '#F5ECD7',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setQrDataUrl(url))
      .catch(() => {});
  }, [customUrl]);

  function handlePrint() {
    window.print();
  }

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <header
        className="border-b px-5 py-4 flex items-center justify-between"
        style={{
          background: 'linear-gradient(90deg, #1E1108, #1A2E23)',
          borderColor: 'rgba(122,74,40,0.25)',
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-fire/15 border border-amber-fire/25 flex items-center justify-center">
            <Coffee size={18} className="text-amber-glow" />
          </div>
          <h1 className="font-playfair text-lg font-bold text-wood-pale">
            Código QR del Menú
          </h1>
        </div>
        <a
          href="/admin/dashboard"
          className="text-xs text-stone-light hover:text-wood-pale transition-colors flex items-center gap-1"
        >
          <ArrowLeft size={13} /> Volver al panel
        </a>
      </header>

      <main className="max-w-md mx-auto px-5 py-10 text-center space-y-6">
        {/* QR Display */}
        <div
          className="rounded-2xl p-6 border inline-block mx-auto print:border-none"
          style={{
            background: '#F5ECD7',
            borderColor: 'rgba(122,74,40,0.3)',
          }}
        >
          {qrDataUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={qrDataUrl}
              alt="QR del menú"
              className="w-64 h-64 mx-auto"
            />
          ) : (
            <div className="w-64 h-64 mx-auto flex items-center justify-center text-wood-medium">
              Generando QR…
            </div>
          )}
          <p className="mt-3 text-wood-medium font-playfair font-bold text-sm">
            ☕ Café de Montaña
          </p>
          <p className="text-xs text-wood-warm mt-1">Escanea para ver el menú</p>
        </div>

        {/* URL display */}
        <div
          className="bg-wood-deep border border-wood-warm/20 rounded-xl p-4 text-left"
        >
          <p className="text-xs text-stone-medium uppercase tracking-wider mb-2">
            URL del menú
          </p>
          <p className="text-sm text-amber-glow font-mono break-all">{menuUrl}</p>
        </div>

        {/* Custom URL input */}
        <div
          className="bg-wood-deep border border-wood-warm/20 rounded-xl p-4 text-left"
        >
          <label
            className="block text-xs text-stone-medium uppercase tracking-wider mb-2"
            htmlFor="custom-url"
          >
            Personalizar URL del QR
          </label>
          <div className="flex gap-2">
            <input
              id="custom-url"
              type="url"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              placeholder="https://tu-dominio.com"
              className="flex-1 bg-wood-medium/30 border border-wood-warm/30 rounded-lg px-3 py-2 text-wood-pale text-sm placeholder:text-stone-dark focus:outline-none focus:border-amber-fire transition-colors"
            />
          </div>
          <p className="text-xs text-stone-dark mt-2">
            Cuando despliegues en producción, cambia esto a tu URL pública.
            También puedes editar <code className="text-amber-soft">NEXT_PUBLIC_APP_URL</code> en{' '}
            <code className="text-amber-soft">.env.local</code>.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-center">
          <button onClick={handlePrint} className="btn-primary">
            🖨️ Imprimir QR
          </button>
          {qrDataUrl && (
            <a
              href={qrDataUrl}
              download="cafe-montana-qr.png"
              className="btn-secondary"
            >
              ⬇ Descargar PNG
            </a>
          )}
        </div>

        {/* Instructions */}
        <div
          className="bg-wood-deep border border-amber-fire/20 rounded-xl p-4 text-left text-sm space-y-2"
        >
          <p className="text-amber-glow font-semibold">📋 Instrucciones de uso</p>
          <ol className="text-stone-light space-y-1.5 list-decimal list-inside text-xs leading-relaxed">
            <li>Imprime o muestra este QR en tu cabaña o barra de café.</li>
            <li>Los clientes lo escanean con la cámara del teléfono.</li>
            <li>Se abre el menú directamente, sin apps ni registros.</li>
            <li>Los pedidos aparecen en tiempo real en tu panel de control.</li>
            <li>
              Para que funcione en una red local (WiFi de la cabaña), asegúrate
              de que la URL use la IP local de tu computadora, p. ej.{' '}
              <code className="text-amber-soft">http://192.168.1.X:3000</code>.
            </li>
          </ol>
        </div>
      </main>

      {/* Print styles */}
      <style>{`
        @media print {
          header, .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>
    </div>
  );
}
