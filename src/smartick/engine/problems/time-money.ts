import type {
  GeneratorContext,
  GeneratorResult,
  ProblemGenerator,
  SubSkillId,
} from "../types";
import { SUB_SKILL_IDS } from "../types";
import {
  createSeededRng,
  rngInt,
  rngPick,
  rngShuffle,
  generateDistractors,
} from "./templates";
import type { ShopScene } from "../scenes/types";

// ──────────────────────────────────────────────
// Skill-11-01: Lectura de reloj
// ──────────────────────────────────────────────

function generadorTiempoReloj(ctx: GeneratorContext): GeneratorResult {
  const rng = createSeededRng(ctx.seed + ctx.sessionProblemIndex * 89 + 1);

  let text: string;
  let answer: number;

  switch (ctx.tier) {
    case 1: {
      // EASY: en punto — la manecilla grande apunta al 12
      const hora = rngInt(rng, 1, 12);
      answer = 12; // manecilla grande apunta a 12
      text = `Son las ${hora}:00. ¿A qué número apunta la manecilla grande (de los minutos)?`;
      break;
    }
    case 2: {
      // MEDIUM: cuarto de hora
      const hora = rngInt(rng, 1, 12);
      const minutos = rngPick(rng, [15, 30, 45]);
      // La manecilla grande apunta a: 15→3, 30→6, 45→9
      answer = minutos / 15 * 3;
      text = `Son las ${hora}:${minutos.toString().padStart(2, "0")}. ¿A qué número apunta la manecilla grande?`;
      break;
    }
    default: {
      // HARD: intervalos de 5 minutos
      const hora = rngInt(rng, 1, 11);
      const opcionesMinutos = [5, 10, 20, 25, 35, 40, 50, 55];
      const minutos = rngPick(rng, opcionesMinutos);
      answer = minutos / 5;
      text = `Son las ${hora}:${minutos.toString().padStart(2, "0")}. ¿A qué número apunta la manecilla grande?`;
      break;
    }
  }

  const errors = [
    answer + 1 > 12 ? 1 : answer + 1,
    answer - 1 < 1 ? 12 : answer - 1,
    answer + 2 > 12 ? answer - 10 : answer + 2,
  ];

  const options = generateDistractors(answer, 3, rng, errors);

  // Clock visual: hour hand points to the hour, minute hand to the minute
  const visualData = {
    type: "clock" as const,
    data: {
      hour: 0,
      minute: 0,
      showNumbers: true,
    },
  };

  // Infer hour/minute from the answer (minute hand position) and context
  // For tier 1: hour is random, minute=0 (en punto)
  // For tier 2-3: use the generated time
  if (ctx.tier === 1) {
    // Reconstruct hour from the text (en punto)
    const hourMatch = text.match(/(\d+):00/);
    if (hourMatch) {
      visualData.data.hour = parseInt(hourMatch[1], 10) % 12 || 12;
      visualData.data.minute = 0;
    } else {
      visualData.data.hour = 3;
      visualData.data.minute = 0;
    }
  } else if (ctx.tier === 2) {
    const hourMatch = text.match(/(\d+):(\d+)/);
    if (hourMatch) {
      visualData.data.hour = parseInt(hourMatch[1], 10) % 12 || 12;
      visualData.data.minute = parseInt(hourMatch[2], 10);
    }
  } else {
    const hourMatch = text.match(/(\d+):(\d+)/);
    if (hourMatch) {
      visualData.data.hour = parseInt(hourMatch[1], 10) % 12 || 12;
      visualData.data.minute = parseInt(hourMatch[2], 10);
    }
  }

  return {
    text,
    answer,
    type: "multiple-choice",
    options: rngShuffle(rng, [...options, answer]),
    visualData,
  };
}

// ──────────────────────────────────────────────
// Skill-11-02: Horas y minutos
// ──────────────────────────────────────────────

function generadorTiempoHorasMin(ctx: GeneratorContext): GeneratorResult {
  const rng = createSeededRng(ctx.seed + ctx.sessionProblemIndex * 97 + 1);

  let text: string;
  let answer: number;

  switch (ctx.tier) {
    case 1: {
      // EASY: horas enteras a minutos
      const horas = rngInt(rng, 2, 6);
      answer = horas * 60;
      text = `¿Cuántos minutos son ${horas} horas?`;
      break;
    }
    case 2: {
      // MEDIUM: horas y medias horas
      const modo = rng() > 0.5 ? "horas-a-min" : "min-a-horas";
      if (modo === "horas-a-min") {
        const horas = rngInt(rng, 2, 5);
        const media = rng() > 0.5;
        answer = horas * 60 + (media ? 30 : 0);
        const mediaStr = media ? " y media" : "";
        text = `¿Cuántos minutos son ${horas} horas${mediaStr}?`;
      } else {
        const mins = rngPick(rng, [120, 180, 240, 300, 360]);
        answer = mins / 60;
        text = `¿Cuántas horas son ${mins} minutos?`;
      }
      break;
    }
    default: {
      // HARD: tiempo transcurrido complejo
      const h1 = rngInt(rng, 8, 11);
      const h2 = rngInt(rng, h1 + 1, Math.min(h1 + 4, 12));
      const m1 = rngPick(rng, [0, 15, 30, 45]);
      const m2 = rngPick(rng, [0, 15, 30, 45]);

      // Calcular minutos transcurridos
      const totalMin1 = h1 * 60 + m1;
      const totalMin2 = h2 * 60 + m2;
      answer = totalMin2 - totalMin1;

      const fmt1 = `${h1}:${m1.toString().padStart(2, "0")}`;
      const fmt2 = `${h2}:${m2.toString().padStart(2, "0")}`;
      text = `¿Cuántos minutos pasan desde las ${fmt1} hasta las ${fmt2}?`;
      break;
    }
  }

  const errors = [
    answer + 1,
    answer - 1,
    answer + 30,
    answer - 30,
  ];

  const options = generateDistractors(answer, 3, rng, errors);

  return {
    text,
    answer,
    type: "multiple-choice",
    options: rngShuffle(rng, [...options, answer]),
  };
}

// ──────────────────────────────────────────────
// Skill-11-03: Euros y céntimos
// ──────────────────────────────────────────────

function generadorDineroEuros(ctx: GeneratorContext): GeneratorResult {
  const rng = createSeededRng(ctx.seed + ctx.sessionProblemIndex * 101 + 1);

  let text: string;
  let answer: number;

  switch (ctx.tier) {
    case 1: {
      // EASY: euros enteros, monedas de 1€ y 2€
      const tipo = rngPick(rng, [
        { moneda: 1, nombre: "1 €" },
        { moneda: 2, nombre: "2 €" },
      ]);
      const cantidad = rngInt(rng, 2, 8);
      answer = tipo.moneda * cantidad;
      text = `Ana tiene ${cantidad} monedas de ${tipo.nombre}. ¿Cuánto dinero tiene en euros?`;
      break;
    }
    case 2: {
      // MEDIUM: euros + 50 céntimos
      const euros = rngInt(rng, 1, 5);
      const monedas50 = rngInt(rng, 1, 4);
      const totalCentimos = euros * 100 + monedas50 * 50;
      answer = totalCentimos;
      text = `Ana tiene ${euros} moneda${euros > 1 ? "s" : ""} de 1 € y ${monedas50} moneda${monedas50 > 1 ? "s" : ""} de 50 céntimos. ¿Cuántos céntimos tiene en total?`;
      break;
    }
    default: {
      // HARD: calcular cambio
      const precioEuros = rngInt(rng, 1, 8);
      const precioCentimos = rngPick(rng, [25, 50, 75]);
      const precioTotal = precioEuros * 100 + precioCentimos;
      const pagaCon = (precioEuros + 1) * 100;
      answer = pagaCon - precioTotal;
      text = `Un juguete cuesta ${precioEuros},${precioCentimos.toString().padStart(2, "0")} €. Ana paga con ${precioEuros + 1} €. ¿Cuántos céntimos recibe de cambio?`;
      break;
    }
  }

  const errors = [
    answer + 1,
    answer - 1,
    answer + 10,
    answer - 10,
  ];

  const options = generateDistractors(answer, 3, rng, errors);

  // Coin visual: show the relevant coins
  const coins: Array<{ value: number; count: number }> = [];
  if (ctx.tier === 1) {
    // 1€ or 2€ coins
    const monedaValor = text.includes("1 €") ? 100 : 200;
    const cantidad = text.match(/(\d+) moneda/);
    if (cantidad) {
      coins.push({ value: monedaValor, count: parseInt(cantidad[1], 10) });
    }
  } else if (ctx.tier === 2) {
    coins.push({ value: 100, count: 0 });
    coins.push({ value: 50, count: 0 });
    // Extract from text
    const eurMatch = text.match(/(\d+) moneda.*1 €/);
    const c50Match = text.match(/(\d+) moneda.*50 c/);
    if (eurMatch) coins[0] = { value: 100, count: parseInt(eurMatch[1], 10) };
    if (c50Match) coins[1] = { value: 50, count: parseInt(c50Match[1], 10) };
  }

  return {
    text,
    answer,
    type: "multiple-choice",
    options: rngShuffle(rng, [...options, answer]),
    visualData: coins.length > 0
      ? { type: "coins" as const, data: { coins, totalCentimos: answer } }
      : undefined,
  };
}

// ──────────────────────────────────────────────
// Skill-11-04: Problemas con dinero
// ──────────────────────────────────────────────

const TIENDAS = [
  "librería",
  "juguetería",
  "papelería",
  "mercadillo",
  "tienda de golosinas",
];

const PRODUCTOS: Record<string, [number, number][]> = {
  // [precioEuros, precioCentimos]
  "librería": [
    [3, 50],
    [4, 25],
    [5, 0],
    [2, 75],
    [6, 50],
  ],
  "juguetería": [
    [8, 0],
    [12, 50],
    [7, 25],
    [15, 0],
    [9, 75],
  ],
  "papelería": [
    [1, 50],
    [2, 25],
    [3, 0],
    [4, 50],
    [5, 75],
  ],
  "mercadillo": [
    [2, 0],
    [3, 50],
    [1, 25],
    [4, 0],
    [6, 0],
  ],
  "tienda de golosinas": [
    [0, 50],
    [1, 0],
    [1, 50],
    [2, 0],
    [0, 75],
  ],
};

function generadorDineroProblemas(ctx: GeneratorContext): GeneratorResult {
  const rng = createSeededRng(ctx.seed + ctx.sessionProblemIndex * 103 + 1);
  const tiendaIdx = ctx.sessionProblemIndex % TIENDAS.length;
  const tienda = TIENDAS[tiendaIdx];
  const productos = PRODUCTOS[tienda];

  const [precioE, precioC] = rngPick(rng, productos);
  const precioTotalCentimos = precioE * 100 + precioC;

  let text: string;
  let answer: number;

  switch (ctx.tier) {
    case 1: {
      // EASY: comprar 1 artículo con dinero justo
      const paga = rngPick(rng, [5, 10]);
      answer = paga * 100 - precioTotalCentimos;
      text = `En la ${tienda} hay un producto que cuesta ${precioE},${precioC.toString().padStart(2, "0")} €. Ana paga con ${paga} €. ¿Cuántos céntimos recibe de cambio?`;
      break;
    }
    case 2: {
      // MEDIUM: comprar 2 artículos iguales
      const cantidad = rngInt(rng, 2, 4);
      const total = precioTotalCentimos * cantidad;
      answer = total;
      text = `Ana compra ${cantidad} producto${cantidad > 1 ? "s" : ""} de ${precioE},${precioC.toString().padStart(2, "0")} € cada uno en la ${tienda}. ¿Cuántos céntimos gasta en total?`;
      break;
    }
    default: {
      // HARD: cuántos artículos puede comprar con X dinero
      const presupuestoE = rngInt(rng, 5, 20);
      const presupuestoCentimos = presupuestoE * 100;
      answer = Math.floor(presupuestoCentimos / precioTotalCentimos);
      text = `Ana tiene ${presupuestoE} € y quiere comprar productos de ${precioE},${precioC.toString().padStart(2, "0")} € en la ${tienda}. ¿Cuántos productos puede comprar como máximo?`;
      break;
    }
  }

  const errors = [
    answer + 1,
    answer - 1,
    answer + 5,
    answer - 5,
  ];

  const options = generateDistractors(answer, 3, rng, errors);

  // Build a ShopScene for visual problems (tier 1-2)
  let sceneData: { scene: ShopScene; story: string; question: string; narration: string; answer: number; options: number[] } | undefined;
  if (ctx.tier <= 2) {
    const itemName = `producto de ${tienda}`;
    const itemIcon = ["📖", "🧸", "✏️", "🎪", "🍭"][tiendaIdx % 5];
    const scene: ShopScene = {
      type: "shop",
      items: [{ name: itemName, price: precioE + precioC / 100, icon: itemIcon }],
      payment: [],
    };
    const precioStr = `${precioE},${precioC.toString().padStart(2, "0")} €`;
    const questionText = ctx.tier === 1
      ? `¿Cuántos céntimos recibe de cambio?`
      : `¿Cuántos céntimos gasta en total?`;
    sceneData = {
      scene,
      story: text,
      question: questionText,
      narration: `${text} ${questionText}`,
      answer,
      options: rngShuffle(rng, [...options, answer]),
    };
  }

  return {
    text,
    answer,
    type: "multiple-choice",
    options: rngShuffle(rng, [...options, answer]),
    sceneData: sceneData as any,
  };
}

// ──────────────────────────────────────────────
// Registry Export
// ──────────────────────────────────────────────

export const timeMoneyGenerators: Partial<
  Record<SubSkillId, ProblemGenerator>
> = {
  [SUB_SKILL_IDS.TIEMPO_RELOJ]: generadorTiempoReloj,
  [SUB_SKILL_IDS.TIEMPO_HORAS_MIN]: generadorTiempoHorasMin,
  [SUB_SKILL_IDS.DINERO_EUROS]: generadorDineroEuros,
  [SUB_SKILL_IDS.DINERO_PROBLEMAS]: generadorDineroProblemas,
};
