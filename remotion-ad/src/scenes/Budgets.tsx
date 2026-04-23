import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const C = {
  bg: "#f5f8fc",
  primary: "#166534",
  accent: "#059669",
  accentSoft: "#d9fbe8",
  ink: "#142315",
  muted: "#4a5f4d",
  line: "#d7e6da",
  surface: "#ffffff",
  surfaceSoft: "#eef7f0",
  blue: "#3b82f6",
  orange: "#f59e0b",
  red: "#ef4444",
  purple: "#8b5cf6",
  warn: "#dc2626",
};

const GridBg: React.FC = () => (
  <div style={{
    position: "absolute",
    inset: 0,
    backgroundImage: `
      linear-gradient(to right, rgba(22,101,52,0.05) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(22,101,52,0.05) 1px, transparent 1px)
    `,
    backgroundSize: "48px 48px",
  }} />
);

interface Budget {
  category: string;
  spent: number;
  limit: number;
  color: string;
  icon: string;
}

const BudgetRow: React.FC<{
  budget: Budget;
  delay: number;
  frame: number;
  fps: number;
  barProgress: number;
}> = ({ budget, delay, frame, fps, barProgress }) => {
  const pct = budget.spent / budget.limit;
  const isOver = pct > 0.85;
  const barColor = pct > 1 ? C.warn : pct > 0.85 ? C.orange : budget.color;
  const op = interpolate(frame, [delay, delay + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const slideX = interpolate(frame, [delay, delay + 25], [-40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const barW = Math.min(pct, 1) * barProgress * 100;

  return (
    <div style={{
      background: C.surface,
      border: `1.5px solid ${isOver ? `${C.orange}55` : C.line}`,
      borderRadius: 14,
      padding: "16px 20px",
      opacity: op,
      transform: `translateX(${slideX}px)`,
      boxShadow: isOver ? `0 4px 16px ${C.orange}25` : "0 4px 16px rgba(20,35,21,0.05)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>{budget.icon}</span>
          <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 14, fontWeight: 800, color: C.ink }}>{budget.category}</span>
          {isOver && (
            <span style={{
              background: `${C.orange}22`,
              color: C.orange,
              borderRadius: 6,
              padding: "2px 8px",
              fontSize: 10,
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}>Alerta</span>
          )}
        </div>
        <div style={{ textAlign: "right" }}>
          <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 900, color: barColor }}>
            ${budget.spent.toLocaleString("es-AR")}
          </span>
          <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}> / ${budget.limit.toLocaleString("es-AR")}</span>
        </div>
      </div>
      <div style={{ height: 8, background: C.line, borderRadius: 99, overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${barW}%`,
          background: barColor,
          borderRadius: 99,
          transition: "width 0.5s",
        }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
        <span style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>
          {Math.round(pct * 100)}% utilizado
        </span>
        <span style={{ fontSize: 10, color: isOver ? C.orange : C.accent, fontWeight: 700 }}>
          {pct >= 1 ? "Límite superado" : `$${(budget.limit - budget.spent).toLocaleString("es-AR")} disponible`}
        </span>
      </div>
    </div>
  );
};

const budgets: Budget[] = [
  { category: "Alimentos", spent: 42000, limit: 55000, color: C.primary, icon: "🛒" },
  { category: "Transporte", spent: 18500, limit: 20000, color: C.blue, icon: "🚌" },
  { category: "Ocio & entretenimiento", spent: 28000, limit: 25000, color: C.orange, icon: "🎬" },
  { category: "Salud", spent: 12000, limit: 30000, color: C.purple, icon: "💊" },
  { category: "Indumentaria", spent: 8500, limit: 15000, color: C.accent, icon: "👕" },
];

export const Budgets: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerS = spring({ frame, fps, config: { damping: 14, stiffness: 100 }, durationInFrames: 35 });
  const headerOp = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const barProgress = interpolate(frame, [30, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const totalSpent = budgets.reduce((a, b) => a + b.spent, 0);
  const totalLimit = budgets.reduce((a, b) => a + b.limit, 0);
  const totalPct = totalSpent / totalLimit;

  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: "'Manrope',sans-serif", overflow: "hidden" }}>
      <GridBg />

      <div style={{
        position: "absolute",
        inset: 0,
        padding: "40px 80px",
        display: "flex",
        flexDirection: "column",
        gap: 0,
      }}>
        <div style={{
          opacity: headerOp,
          transform: `translateY(${interpolate(headerS, [0, 1], [-20, 0])}px)`,
          marginBottom: 28,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}>
          <div>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 900, color: C.accent, textTransform: "uppercase", letterSpacing: "0.22em", marginBottom: 4 }}>CONTROL FINANCIERO</p>
            <h2 style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontSize: 38, fontWeight: 900, color: C.ink }}>Mis Presupuestos</h2>
            <p style={{ margin: "6px 0 0", fontSize: 14, color: C.muted }}>Abril 2026 · Límites por categoría</p>
          </div>

          <div style={{
            background: C.surface,
            border: `1.5px solid ${C.line}`,
            borderRadius: 18,
            padding: "16px 24px",
            textAlign: "center",
            boxShadow: "0 8px 24px rgba(20,35,21,0.07)",
          }}>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.14em" }}>Total utilizado</p>
            <p style={{ margin: "6px 0 4px", fontFamily: "'Sora',sans-serif", fontSize: 28, fontWeight: 900, color: totalPct > 0.9 ? C.orange : C.primary }}>
              {Math.round(totalPct * 100)}%
            </p>
            <div style={{ height: 6, background: C.line, borderRadius: 99, overflow: "hidden", width: 120 }}>
              <div style={{ height: "100%", width: `${totalPct * barProgress * 100}%`, background: totalPct > 0.9 ? C.orange : C.primary, borderRadius: 99 }} />
            </div>
            <p style={{ margin: "6px 0 0", fontSize: 11, color: C.muted }}>
              ${totalSpent.toLocaleString("es-AR")} / ${totalLimit.toLocaleString("es-AR")}
            </p>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {budgets.map((b, i) => (
            <BudgetRow
              key={b.category}
              budget={b}
              delay={20 + i * 12}
              frame={frame}
              fps={fps}
              barProgress={barProgress}
            />
          ))}
        </div>

        <div style={{
          marginTop: 20,
          display: "flex",
          gap: 12,
          opacity: interpolate(frame, [80, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}>
          <div style={{
            background: C.primary,
            color: "#fff",
            borderRadius: 12,
            padding: "12px 24px",
            fontWeight: 800,
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            + Nuevo presupuesto
          </div>
          <div style={{
            background: C.surface,
            border: `1.5px solid ${C.line}`,
            color: C.muted,
            borderRadius: 12,
            padding: "12px 24px",
            fontWeight: 700,
            fontSize: 13,
          }}>
            Abril 2026 ▾
          </div>
        </div>
      </div>

      <div style={{
        position: "absolute",
        top: 20,
        right: 24,
        background: C.primary,
        color: "#fff",
        borderRadius: 10,
        padding: "6px 14px",
        fontFamily: "'Manrope',sans-serif",
        fontSize: 11,
        fontWeight: 800,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        opacity: interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}>
        Presupuestos
      </div>
    </AbsoluteFill>
  );
};
