/**
 * TiendaGame — Pagar el precio exacto con monedas (dinero: euros).
 *
 * Se muestra un producto con su precio (ej: "2,35 €"). El usuario
 * selecciona monedas/billetes hasta juntar el importe exacto.
 * Cuando el total coincide, gana.
 *
 * @module components/TiendaGame
 */

import React, { useState, useMemo, useCallback } from "react";

export interface TiendaGameProps {
  onWin: (starsToAdd: number) => void;
  onSkip: () => void;
}

// ── Constants ────────────────────────────────────

interface Coin {
  label: string;
  value: number; // in cents
  emoji: string;
}

const COINS: Coin[] = [
  { label: "1c", value: 1, emoji: "🟤" },
  { label: "2c", value: 2, emoji: "🟤" },
  { label: "5c", value: 5, emoji: "🟤" },
  { label: "10c", value: 10, emoji: "🟡" },
  { label: "20c", value: 20, emoji: "🟡" },
  { label: "50c", value: 50, emoji: "🟡" },
  { label: "1€", value: 100, emoji: "🟡" },
  { label: "2€", value: 200, emoji: "🟡" },
];

interface Product {
  name: string;
  priceCents: number; // in cents
  emoji: string;
}

const PRODUCTS: Product[] = [
  { name: "Manzana", priceCents: 125, emoji: "🍎" },
  { name: "Pan", priceCents: 230, emoji: "🍞" },
  { name: "Leche", priceCents: 315, emoji: "🥛" },
  { name: "Galletas", priceCents: 150, emoji: "🍪" },
  { name: "Agua", priceCents: 110, emoji: "💧" },
  { name: "Lápiz", priceCents: 85, emoji: "✏️" },
  { name: "Chocolate", priceCents: 200, emoji: "🍫" },
  { name: "Globo", priceCents: 170, emoji: "🎈" },
  { name: "Helado", priceCents: 280, emoji: "🍦" },
];

function randomProduct(): Product {
  return PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
}

function formatCents(cents: number): string {
  const euros = Math.floor(cents / 100);
  const centimos = cents % 100;
  return `${euros},${centimos.toString().padStart(2, "0")} €`;
}

// ── Component ────────────────────────────────────

const TiendaGame: React.FC<TiendaGameProps> = ({ onWin, onSkip }) => {
  const [product] = useState(randomProduct);
  const [paid, setPaid] = useState<Coin[]>([]);
  const [won, setWon] = useState(false);

  const totalPaid = useMemo(
    () => paid.reduce((sum, c) => sum + c.value, 0),
    [paid],
  );

  const isExact = totalPaid === product.priceCents;
  const isOver = totalPaid > product.priceCents;

  const handleAddCoin = useCallback(
    (coin: Coin) => {
      if (won) return;
      const newTotal = totalPaid + coin.value;
      if (newTotal > product.priceCents) return; // Can't overpay
      const newPaid = [...paid, coin];
      setPaid(newPaid);

      if (newTotal === product.priceCents) {
        setWon(true);
        setTimeout(() => onWin(1), 1200);
      }
    },
    [paid, totalPaid, product.priceCents, won, onWin],
  );

  const handleUndo = useCallback(() => {
    if (won || paid.length === 0) return;
    setPaid(paid.slice(0, -1));
  }, [paid, won]);

  const handleReset = useCallback(() => {
    if (won) return;
    setPaid([]);
  }, [won]);

  return (
    <div className="smartick-tienda">
      <div className="smartick-tienda__header">
        <h2 className="smartick-tienda__title">🏪 Pagá el producto</h2>
        {!won && (
          <button
            className="smartick-tienda__skip"
            onClick={onSkip}
            type="button"
            aria-label="Saltar"
          >
            ✕
          </button>
        )}
      </div>

      {/* ── Product display ─────────────────────── */}
      <div className="smartick-tienda__product">
        <span className="smartick-tienda__product-emoji">{product.emoji}</span>
        <span className="smartick-tienda__product-name">{product.name}</span>
        <span className="smartick-tienda__product-price">
          {formatCents(product.priceCents)}
        </span>
      </div>

      {/* ── Payment area ────────────────────────── */}
      <div className="smartick-tienda__payment">
        <div className="smartick-tienda__payment-header">
          <span>Pagado:</span>
          <span className="smartick-tienda__payment-total">
            {formatCents(totalPaid)}
          </span>
        </div>
        <div className="smartick-tienda__payment-coins">
          {paid.length === 0 ? (
            <span className="smartick-tienda__payment-empty">
              Seleccioná monedas abajo
            </span>
          ) : (
            paid.map((c, i) => (
              <span key={i} className="smartick-tienda__coin-display" title={c.label}>
                {c.emoji}
              </span>
            ))
          )}
        </div>
      </div>

      {/* ── Status ──────────────────────────────── */}
      <div className="smartick-tienda__status">
        {won ? (
          <span className="smartick-tienda__win">🎉 ¡Pago exacto! +1 ⭐</span>
        ) : isExact && totalPaid > 0 ? (
          <span className="smartick-tienda__exact">✓ ¡Justo!</span>
        ) : isOver ? (
          <span className="smartick-tienda__over">Te sobra plata</span>
        ) : totalPaid === 0 ? (
          <span className="smartick-tienda__hint">
            Pagá {formatCents(product.priceCents - totalPaid)}
          </span>
        ) : (
          <span className="smartick-tienda__remaining">
            Faltan {formatCents(product.priceCents - totalPaid)}
          </span>
        )}
      </div>

      {/* ── Coins ───────────────────────────────── */}
      {!won && (
        <div className="smartick-tienda__coins">
          {COINS.map((coin) => (
            <button
              key={coin.label}
              className="smartick-tienda__coin-btn"
              onClick={() => handleAddCoin(coin)}
              type="button"
              disabled={totalPaid + coin.value > product.priceCents}
              title={coin.label}
            >
              <span className="smartick-tienda__coin-emoji">{coin.emoji}</span>
              <span className="smartick-tienda__coin-label">{coin.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* ── Actions ─────────────────────────────── */}
      <div className="smartick-tienda__actions">
        {!won && paid.length > 0 && (
          <>
            <button
              className="smartick-tienda__undo"
              onClick={handleUndo}
              type="button"
            >
              ↩ Quitar última
            </button>
            <button
              className="smartick-tienda__reset"
              onClick={handleReset}
              type="button"
            >
              🔄 Empezar de nuevo
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TiendaGame;
