/**
 * VisualTestScreen — Debug component to test ALL visual scene types.
 * TODO: remove before production
 *
 * @module components/VisualTestScreen
 */

import React, { useCallback } from "react";
import VisualProblemView from "./VisualProblemView";
import type { VisualProblemData } from "../engine/scenes/types";

const SCENES: VisualProblemData[] = [
  {
    scene: { type: "groups", groups: 3, perGroup: 5, icon: "ball", groupLabel: "cajas", itemLabel: "pelotas" },
    story: "Tyler tiene 3 cajas. En cada caja hay 5 pelotas.",
    question: "¿Cuántas pelotas hay en total?",
    narration: "Tyler tiene 3 cajas. En cada caja hay 5 pelotas. ¿Cuántas pelotas hay en total?",
    answer: 15, options: [10, 12, 15, 18],
  },
  {
    scene: { type: "groups", groups: 4, perGroup: 3, icon: "cookie", groupLabel: "bandejas", itemLabel: "galletas" },
    story: "Mateo hornea 4 bandejas. En cada bandeja hay 3 galletas.",
    question: "¿Cuántas galletas horneó Mateo?",
    narration: "Mateo hornea 4 bandejas. En cada bandeja hay 3 galletas. ¿Cuántas galletas horneó Mateo?",
    answer: 12, options: [9, 10, 12, 15],
  },
  {
    scene: { type: "array", rows: 3, cols: 4, icon: "star", itemLabel: "juguetes" },
    story: "Ana organiza sus juguetes en 3 filas y 4 columnas.",
    question: "¿Cuántos juguetes tiene Ana?",
    narration: "Ana organiza sus juguetes en 3 filas y 4 columnas. ¿Cuántos juguetes tiene Ana?",
    answer: 12, options: [7, 10, 12, 15],
  },
  {
    scene: { type: "array", rows: 2, cols: 6, icon: "book", itemLabel: "libros" },
    story: "En la biblioteca hay 2 estantes con 6 libros cada uno.",
    question: "¿Cuántos libros hay en total?",
    narration: "En la biblioteca hay 2 estantes con 6 libros cada uno. ¿Cuántos libros hay en total?",
    answer: 12, options: [8, 10, 12, 14],
  },
  {
    scene: { type: "number-line", start: 0, jump: 3, jumps: 4, direction: "forward" },
    story: "Salta de 3 en 3 desde el 0, cuatro veces.",
    question: "¿A qué número llegás?",
    narration: "Saltá de 3 en 3 desde el 0. Cuatro saltos. ¿A qué número llegás?",
    answer: 12, options: [9, 10, 12, 15],
  },
  {
    scene: { type: "scale", leftItems: 5, rightItems: 3, icon: "apple", itemLabel: "manzanas" },
    story: "En el lado izquierdo hay 5 manzanas. En el lado derecho hay 3.",
    question: "¿De qué lado hay más manzanas?",
    narration: "En el lado izquierdo hay 5 manzanas. En el lado derecho hay 3. ¿De qué lado hay más manzanas?",
    answer: 5, options: [3, 4, 5, 6],
  },
  {
    scene: { type: "scale", leftItems: 2, rightItems: 6, icon: "ball", itemLabel: "canicas" },
    story: "Valentina tiene 2 canicas a la izquierda y 6 a la derecha.",
    question: "¿Cuántas canicas hay en total?",
    narration: "Valentina tiene 2 canicas a la izquierda y 6 a la derecha. ¿Cuántas canicas hay en total?",
    answer: 8, options: [4, 6, 8, 10],
  },
  {
    scene: { type: "fill", containerLabel: "jarra", totalCapacity: 200, currentFill: 150, unit: "ml", icon: "water" },
    story: "La jarra tiene capacidad de 200 ml. Hay 150 ml de jugo.",
    question: "¿Cuántos ml de jugo hay?",
    narration: "La jarra tiene capacidad de 200 mililitros. Hay 150 mililitros de jugo. ¿Cuántos mililitros hay?",
    answer: 150, options: [100, 125, 150, 175],
  },
  {
    scene: { type: "fill", containerLabel: "botella", totalCapacity: 1000, currentFill: 350, unit: "ml", icon: "water" },
    story: "La botella tiene capacidad de 1 litro. Hay 350 ml de agua.",
    question: "¿Cuántos ml de agua hay?",
    narration: "La botella tiene capacidad de 1 litro. Hay 350 mililitros de agua. ¿Cuántos mililitros hay?",
    answer: 350, options: [250, 300, 350, 400],
  },
  {
    scene: { type: "shop", items: [{ name: "manzana", price: 2, icon: "🍎" }, { name: "galleta", price: 3, icon: "🍪" }], payment: [5] },
    story: "Comprás una manzana de 2€ y una galleta de 3€. Pagás con 5€.",
    question: "¿Cuánto gastaste en total?",
    narration: "Comprás una manzana de 2 euros y una galleta de 3 euros. Pagás con 5 euros. ¿Cuánto gastaste en total?",
    answer: 5, options: [3, 4, 5, 6],
  },
  {
    scene: { type: "shop", items: [{ name: "lápiz", price: 1, icon: "✏️" }, { name: "cuaderno", price: 4, icon: "📓" }, { name: "goma", price: 2, icon: "🧹" }], payment: [7] },
    story: "Comprás un lápiz de 1€, un cuaderno de 4€ y una goma de 2€.",
    question: "¿Cuánto gastaste en total?",
    narration: "Comprás un lápiz de 1 euro, un cuaderno de 4 euros y una goma de 2 euros. ¿Cuánto gastaste en total?",
    answer: 7, options: [5, 7, 9, 11],
  },
  {
    scene: { type: "geometry-shape", shape: "triangle", count: 3, color: "#FF6B35" },
    story: "Ana dibuja un triángulo.",
    question: "¿Cuántos lados tiene un triángulo?",
    narration: "Ana dibuja un triángulo. ¿Cuántos lados tiene un triángulo?",
    answer: 3, options: [2, 3, 4, 5],
  },
  {
    scene: { type: "geometry-shape", shape: "square", count: 4, color: "#00B894" },
    story: "Mateo traza un cuadrado.",
    question: "¿Cuántos lados tiene un cuadrado?",
    narration: "Mateo traza un cuadrado. ¿Cuántos lados tiene un cuadrado?",
    answer: 4, options: [3, 4, 5, 6],
  },
  {
    scene: { type: "geometry-shape", shape: "hexagon", count: 6, color: "#A29BFE" },
    story: "Sofía dibuja un hexágono.",
    question: "¿Cuántos lados tiene un hexágono?",
    narration: "Sofía dibuja un hexágono. ¿Cuántos lados tiene un hexágono?",
    answer: 6, options: [4, 5, 6, 7],
  },
];

export interface VisualTestScreenProps {
  onBack: () => void;
}

const VisualTestScreen: React.FC<VisualTestScreenProps> = ({ onBack }) => {
  const [problemIndex, setProblemIndex] = React.useState(0);
  const [lastResult, setLastResult] = React.useState<string | null>(null);

  const current = SCENES[problemIndex % SCENES.length];

  const handleAnswer = useCallback((answer: number) => {
    const isCorrect = answer === current.answer;
    setLastResult(isCorrect ? "✅ ¡Correcto!" : `❌ Era ${current.answer}`);
    setTimeout(() => {
      setLastResult(null);
      setProblemIndex((i) => i + 1);
    }, 800);
  }, [current.answer]);

  const labels: Record<string, string> = {
    groups: "Grupos", array: "Array", "number-line": "Recta numérica",
    scale: "Balanza", fill: "Capacidad", shop: "Tienda", "geometry-shape": "Geometría",
  };
  const typeLabel = labels[current.scene.type] || current.scene.type;

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(180deg, #EEF2FF 0%, #E0E7FF 100%)",
      display: "flex",
      flexDirection: "column",
    }}>
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "1rem 1.25rem",
      }}>
        <button onClick={onBack}
          style={{
            padding: "0.5rem 1.2rem", fontSize: "0.95rem", fontWeight: 700,
            fontFamily: '"Baloo 2", system-ui, sans-serif',
            color: "#4F46E5", background: "transparent",
            border: "2px solid #4F46E5", borderRadius: "20px", cursor: "pointer",
          }}
        >← Volver</button>
        <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "rgba(49,46,129,0.4)" }}>
          <strong style={{ color: "rgba(49,46,129,0.6)" }}>{typeLabel}</strong> — #{problemIndex + 1}/{SCENES.length}
        </span>
      </div>

      {lastResult && (
        <div style={{
          textAlign: "center", fontSize: "1.2rem", fontWeight: 800,
          color: lastResult.startsWith("✅") ? "#00B894" : "#FF6B35",
          fontFamily: '"Baloo 2", system-ui, sans-serif',
          padding: "0.5rem",
        }}>{lastResult}</div>
      )}

      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <VisualProblemView
          key={problemIndex}
          problem={current}
          onAnswer={handleAnswer}
          problemType="multiple-choice"
        />
      </div>
    </div>
  );
};

export default VisualTestScreen;
