/**
 * TiendaGame — Pagar precio exacto con monedas (euros).
 *
 * 3 rondas progresivas: fácil (≤1€), medio (1-3€), difícil (3-5€).
 *
 * @module components/TiendaGame
 */

import React, { useState, useMemo, useCallback } from "react";

export interface TiendaGameProps {
  onWin: (starsToAdd: number) => void;
  onSkip: () => void;
}

interface Coin {
  label: string;
  value: number;
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
  emoji: string;
}

const PRODUCTS: Product[] = [
  { name: "Manzana", emoji: "🍎" },
  { name: "Pan", emoji: "🍞" },
  { name: "Leche", emoji: "🥛" },
  { name: "Galletas", emoji: "🍪" },
  { name: "Agua", emoji: "💧" },
  { name: "Lápiz", emoji: "✏️" },
  { name: "Chocolate", emoji: "🍫" },
  { name: "Helado", emoji: "🍦" },
  { name: "Globo", emoji: "🎈" },
];

function randomProduct(): Product {
  return PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)];
}

function generatePrice(round: number): number {
  if (round === 0) {
    // ≤1€: prices in round 5c increments
    const cents = [50, 65, 80, 95, 110, 125, 150, 175, 200];
    return cents[Math.floor(Math.random() * cents.length)];
  }
  if (round === 1) {
    // 1-3€
    const cents = [150, 185, 220, 250, 275, 300, 350, 400, 450, 500];
    return cents[Math.floor(Math.random() * cents.length)];
  }
  // 3-5€
  const cents = [300, 350, 400, 450, 500, 550, 600, 700, 800, 900, 1000];
  return cents[Math.floor(Math.random() * cents.length)];
}

function formatCents(cents: number): string {
  const euros = Math.floor(cents / 100);
  const centimos = cents % 100;
  return `${euros},${centimos.toString().padStart(2, "0")} €`;
}

const TiendaGame: React.FC<TiendaGameProps> = ({ onWin, onSkip }) => {
  const [round, setRound] = useState(0);
  const [product] = useState(randomProduct);
  const [priceCents, setPriceCents] = useState(() => generatePrice(0));
  const [paid, setPaid] = useState<Coin[]>([]);
  const [won, setWon] = useState(false);
  const [roundWon, setRoundWon] = useState(false);

  const totalPaid = useMemo(() => paid.reduce((sum, c) => sum + c.value, 0), [paid]);

  const handleAddCoin = useCallback(
    (coin: Coin) => {
      if (won || roundWon) return;
      const newTotal = totalPaid + coin.value;
      if (newTotal > priceCents) return;
      const newPaid = [...paid, coin];
      setPaid(newPaid);
      if (newTotal === priceCents) {
        setRoundWon(true);
        setTimeout(() => {
          if (round >= 2) {
            setWon(true);
            setTimeout(() => onWin(1), 1000);
          } else {
            setRound((r) => r + 1);
            setPriceCents(generatePrice(round + 1));
            setPaid([]);
            setRoundWon(false);
          }
        }, 1200);
      }
    },
    [paid, totalPaid, priceCents, round, won, roundWon, onWin],
  );

  const handleUndo = useCallback(() => {
    if (won || roundWon || paid.length === 0) return;
    setPaid(paid.slice(0, -1));
  }, [paid, won, roundWon]);

  const handleReset = useCallback(() => {
    if (won || roundWon) return;
    setPaid([]);
  }, [won, roundWon]);

  return (
    <div className="smartick-tienda">
      <div className="smartick-tienda__header">
        <h2 className="smartick-tienda__title">🏪 Pagá el producto</h2>
        {!won && (
          <button className="smartick-tienda__skip" onClick={onSkip} type="button">✕</button>
        )}
      </div>

      <div className="smartick-balanza__rounds">
        {[0, 1, 2].map((r) => (
          <span key={r} className={`smartick-balanza__round-dot ${r < round ? "smartick-balanza__round-dot--done" : ""} ${r === round ? "smartick-balanza__round-dot--active" : ""}`}>
            {r + 1}
          </span>
        ))}
      </div>

      <div className="smartick-tienda__product">
        <span className="smartick-tienda__product-emoji">{product.emoji}</span>
        <span className="smartick-tienda__product-name">{product.name}</span>
        <span className="smartick-tienda__product-price">{formatCents(priceCents)}</span>
      </div>

      <div className="smartick-tienda__payment">
        <div className="smartick-tienda__payment-header">
          <span>Pagado:</span>
          <span className="smartick-tienda__payment-total">{formatCents(totalPaid)}</span>
        </div>
        <div className="smartick-tienda__payment-coins">
          {paid.length === 0 ? (
            <span className="smartick-tienda__payment-empty">Seleccioná monedas</span>
          ) : (
            paid.map((c, i) => <span key={i} className="smartick-tienda__coin-display" title={c.label}>{c.emoji}</span>)
          )}
        </div>
      </div>

      <div className="smartick-tienda__status">
        {won ? (
          <span className="smartick-tienda__win">🎉 ¡Completaste! +1 ⭐</span>
        ) : roundWon ? (
          <span className="smartick-tienda__exact">✓ ¡Pago exacto!</span>
        ) : totalPaid === 0 ? (
          <span className="smartick-tienda__hint">Pagá {formatCents(priceCents)}</span>
        ) : (
          <span className="smartick-tienda__remaining">Faltan {formatCents(priceCents - totalPaid)}</span>
        )}
      </div>

      {!won && !roundWon && (
        <div className="smartick-tienda__coins">
          {COINS.map((coin) => (
            <button
              key={coin.label}
              className="smartick-tienda__coin-btn"
              onClick={() => handleAddCoin(coin)}
              type="button"
              disabled={totalPaid + coin.value > priceCents}
              title={coin.label}
            >
              <span className="smartick-tienda__coin-emoji">{coin.emoji}</span>
              <span className="smartick-tienda__coin-label">{coin.label}</span>
            </button>
          ))}
        </div>
      )}

      {!won && !roundWon && paid.length > 0 && (
        <div className="smartick-tienda__actions">
          <button className="smartick-tienda__undo" onClick={handleUndo} type="button">↩ Quitar última</button>
          <button className="smartick-tienda__reset" onClick={handleReset} type="button">🔄 Empezar de nuevo</button>
        </div>
      )}
    </div>
  );
};

export default TiendaGame;
