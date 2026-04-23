import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const C = {
  bg: "#f5f8fc", primary: "#166534", accent: "#059669", accentSoft: "#d9fbe8",
  ink: "#142315", muted: "#4a5f4d", line: "#d7e6da", surface: "#ffffff",
  orange: "#f59e0b", red: "#dc2626", blue: "#3b82f6", purple: "#8b5cf6",
};

const GridBg: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(to right, rgba(22,101,52,0.05) 1px, transparent 1px),linear-gradient(to bottom, rgba(22,101,52,0.05) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
);

interface Budget { category: string; spent: number; limit: number; color: string; icon: string; }

const budgets: Budget[] = [
  { category: "Alimentos", spent: 42000, limit: 55000, color: C.primary, icon: "🛒" },
  { category: "Transporte", spent: 18500, limit: 20000, color: C.blue, icon: "🚌" },
  { category: "Ocio", spent: 28000, limit: 25000, color: C.orange, icon: "🎬" },
  { category: "Salud", spent: 12000, limit: 30000, color: C.purple, icon: "💊" },
  { category: "Indumentaria", spent: 8500, limit: 15000, color: C.accent, icon: "👕" },
];

const BudgetRow: React.FC<{ b: Budget; delay: number; frame: number; fps: number; barProg: number }> = ({ b, delay, frame, fps, barProg }) => {
  const pct = b.spent / b.limit;
  const over = pct > 0.85;
  const barColor = pct > 1 ? C.red : over ? C.orange : b.color;
  const op = interpolate(frame, [delay, delay + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const slideX = interpolate(frame, [delay, delay + 22], [-36, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ background: C.surface, border: `1.5px solid ${over ? `${C.orange}55` : C.line}`, borderRadius: 22, padding: "22px 26px", opacity: op, transform: `translateX(${slideX}px)`, boxShadow: over ? `0 4px 20px ${C.orange}22` : "0 4px 16px rgba(20,35,21,0.05)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ fontSize: 26 }}>{b.icon}</span>
          <div>
            <p style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 800, color: C.ink }}>{b.category}</p>
            {over && <span style={{ fontSize: 11, fontWeight: 900, color: C.orange, textTransform: "uppercase", letterSpacing: "0.12em" }}>⚠ Alerta</span>}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 900, color: barColor }}>${(b.spent / 1000).toFixed(0)}K</p>
          <p style={{ margin: "2px 0 0", fontSize: 13, color: C.muted }}>de ${(b.limit / 1000).toFixed(0)}K</p>
        </div>
      </div>
      <div style={{ height: 12, background: C.line, borderRadius: 99, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${Math.min(pct, 1) * barProg * 100}%`, background: barColor, borderRadius: 99 }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        <span style={{ fontSize: 13, color: C.muted, fontWeight: 600 }}>{Math.round(pct * 100)}% utilizado</span>
        <span style={{ fontSize: 13, color: pct >= 1 ? C.red : C.accent, fontWeight: 800 }}>
          {pct >= 1 ? "Límite superado" : `$${((b.limit - b.spent) / 1000).toFixed(0)}K disponible`}
        </span>
      </div>
    </div>
  );
};

export const Budgets: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const headerOp = interpolate(frame, [0, 22], [0, 1], { extrapolateRight: "clamp" });
  const headerY = interpolate(frame, [0, 22], [-20, 0], { extrapolateRight: "clamp" });
  const barProg = interpolate(frame, [28, 90], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const totalSpent = budgets.reduce((a, b) => a + b.spent, 0);
  const totalLimit = budgets.reduce((a, b) => a + b.limit, 0);
  const totalPct = totalSpent / totalLimit;

  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: "'Manrope',sans-serif", overflow: "hidden" }}>
      <GridBg />
      <div style={{ position: "absolute", inset: 0, padding: "168px 56px 220px", display: "flex", flexDirection: "column", gap: 0 }}>
        {/* Header */}
        <div style={{ opacity: headerOp, transform: `translateY(${headerY}px)`, marginBottom: 24 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 900, color: C.accent, textTransform: "uppercase", letterSpacing: "0.22em", marginBottom: 6 }}>CONTROL FINANCIERO</p>
          <h2 style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontSize: 50, fontWeight: 900, color: C.ink }}>Presupuestos</h2>
        </div>

        {/* Total card */}
        <div style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, borderRadius: 24, padding: "22px 28px", marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: `0 12px 36px rgba(22,101,52,0.22)`, opacity: headerOp }}>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.8)", textTransform: "uppercase", letterSpacing: "0.14em" }}>Total del mes</p>
            <p style={{ margin: "6px 0 4px", fontFamily: "'Sora',sans-serif", fontSize: 36, fontWeight: 900, color: "#fff" }}>{Math.round(totalPct * 100)}%</p>
            <div style={{ height: 8, background: "rgba(255,255,255,0.25)", borderRadius: 99, width: 200, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${totalPct * barProg * 100}%`, background: "#fff", borderRadius: 99 }} />
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ margin: 0, fontSize: 28, fontWeight: 900, color: "#fff", fontFamily: "'Sora',sans-serif" }}>${(totalSpent / 1000).toFixed(0)}K</p>
            <p style={{ margin: "4px 0 0", fontSize: 14, color: "rgba(255,255,255,0.75)" }}>de ${(totalLimit / 1000).toFixed(0)}K</p>
          </div>
        </div>

        {/* Budget rows */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {budgets.map((b, i) => (
            <BudgetRow key={b.category} b={b} delay={18 + i * 12} frame={frame} fps={fps} barProg={barProg} />
          ))}
        </div>

        {/* Add button */}
        <div style={{ marginTop: 24, opacity: interpolate(frame, [80, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          <div style={{ background: C.primary, color: "#fff", borderRadius: 18, padding: "18px", textAlign: "center", fontWeight: 900, fontSize: 18 }}>
            + Nuevo presupuesto
          </div>
        </div>
      </div>

      <div style={{ position: "absolute", top: 22, right: 28, background: C.primary, color: "#fff", borderRadius: 12, padding: "8px 18px", fontSize: 13, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", opacity: interpolate(frame, [10, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        Presupuestos
      </div>
    </AbsoluteFill>
  );
};
