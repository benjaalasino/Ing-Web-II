import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const C = {
  bg: "#f5f8fc", primary: "#166534", accent: "#059669", accentSoft: "#d9fbe8",
  ink: "#142315", muted: "#4a5f4d", line: "#d7e6da", surface: "#ffffff",
  blue: "#3b82f6", orange: "#f59e0b", purple: "#8b5cf6",
};

const GridBg: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(to right, rgba(22,101,52,0.05) 1px, transparent 1px),linear-gradient(to bottom, rgba(22,101,52,0.05) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
);

interface Goal { title: string; current: number; target: number; deadline: string; icon: string; color: string; }

const goals: Goal[] = [
  { title: "Vacaciones en Brasil", current: 180000, target: 350000, deadline: "Dic 2026", icon: "✈️", color: C.blue },
  { title: "Notebook nueva", current: 420000, target: 450000, deadline: "May 2026", icon: "💻", color: C.accent },
  { title: "Fondo de emergencia", current: 95000, target: 300000, deadline: "Dic 2026", icon: "🛡️", color: C.purple },
  { title: "Auto propio", current: 1200000, target: 5000000, deadline: "Jun 2028", icon: "🚗", color: C.orange },
];

const fmt = (n: number) => n >= 1e6 ? `$${(n / 1e6).toFixed(1)}M` : n >= 1000 ? `$${(n / 1000).toFixed(0)}K` : `$${n}`;

const GoalCard: React.FC<{ g: Goal; delay: number; frame: number; fps: number; barProg: number; highlight?: boolean }> = ({ g, delay, frame, fps, barProg, highlight }) => {
  const pct = g.current / g.target;
  const s = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 100 }, durationInFrames: 28 });
  const op = interpolate(frame, [delay, delay + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{ background: highlight ? `linear-gradient(135deg, ${g.color}12, ${g.color}06)` : C.surface, border: `1.5px solid ${highlight ? g.color + "55" : C.line}`, borderRadius: 24, padding: "24px 28px", opacity: op, transform: `scale(${interpolate(s, [0, 1], [0.9, 1])}) translateY(${interpolate(s, [0, 1], [18, 0])}px)`, boxShadow: highlight ? `0 8px 32px ${g.color}22` : "0 4px 16px rgba(20,35,21,0.06)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 54, height: 54, borderRadius: 16, background: `${g.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28 }}>{g.icon}</div>
          <div>
            <p style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontSize: 19, fontWeight: 800, color: C.ink }}>{g.title}</p>
            <p style={{ margin: "3px 0 0", fontSize: 13, color: C.muted, fontWeight: 600 }}>Meta: {g.deadline}</p>
          </div>
        </div>
        <p style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontSize: 28, fontWeight: 900, color: g.color }}>{Math.round(pct * 100)}%</p>
      </div>
      <div style={{ height: 12, background: C.line, borderRadius: 99, overflow: "hidden", marginBottom: 10 }}>
        <div style={{ height: "100%", width: `${pct * barProg * 100}%`, background: `linear-gradient(90deg, ${g.color}, ${g.color}bb)`, borderRadius: 99 }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: g.color }}>{fmt(g.current)} ahorrado</span>
        <span style={{ fontSize: 14, color: C.muted, fontWeight: 600 }}>obj: {fmt(g.target)}</span>
      </div>
    </div>
  );
};

export const Savings: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const headerOp = interpolate(frame, [0, 22], [0, 1], { extrapolateRight: "clamp" });
  const headerY = interpolate(frame, [0, 22], [-20, 0], { extrapolateRight: "clamp" });
  const barProg = interpolate(frame, [22, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const totalSaved = goals.reduce((a, g) => a + g.current, 0);
  const counter = interpolate(frame, [28, 88], [0, totalSaved], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: "'Manrope',sans-serif", overflow: "hidden" }}>
      <GridBg />
      <div style={{ position: "absolute", top: -180, right: -180, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(5,150,105,0.13) 0%, transparent 70%)" }} />

      <div style={{ position: "absolute", inset: 0, padding: "60px 56px", display: "flex", flexDirection: "column" }}>
        <div style={{ opacity: headerOp, transform: `translateY(${headerY}px)`, marginBottom: 24 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 900, color: C.accent, textTransform: "uppercase", letterSpacing: "0.22em", marginBottom: 6 }}>METAS FINANCIERAS</p>
          <h2 style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontSize: 50, fontWeight: 900, color: C.ink }}>Mis Ahorros</h2>
        </div>

        {/* Total banner */}
        <div style={{ background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`, borderRadius: 24, padding: "24px 30px", marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: `0 14px 40px rgba(22,101,52,0.25)`, opacity: headerOp }}>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.8)", textTransform: "uppercase", letterSpacing: "0.14em" }}>Total ahorrado</p>
            <p style={{ margin: "8px 0 0", fontFamily: "'Sora',sans-serif", fontSize: 38, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}>
              ${Math.round(counter).toLocaleString("es-AR")}
            </p>
          </div>
          <div style={{ textAlign: "center" }}>
            <p style={{ margin: 0, fontSize: 14, color: "rgba(255,255,255,0.75)" }}>4 metas activas</p>
            <p style={{ margin: "4px 0 0", fontSize: 28, fontWeight: 900, color: "#fff" }}>💰</p>
          </div>
        </div>

        {/* Goals */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {goals.map((g, i) => (
            <GoalCard key={g.title} g={g} delay={16 + i * 13} frame={frame} fps={fps} barProg={barProg} highlight={i === 1} />
          ))}
        </div>

        <div style={{ marginTop: 24, display: "flex", gap: 14, opacity: interpolate(frame, [78, 98], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          <div style={{ flex: 1, background: C.primary, color: "#fff", borderRadius: 18, padding: "18px", textAlign: "center", fontWeight: 900, fontSize: 18 }}>+ Nueva meta</div>
          <div style={{ flex: 1, background: C.accentSoft, border: `1.5px solid ${C.line}`, color: C.primary, borderRadius: 18, padding: "18px", textAlign: "center", fontWeight: 700, fontSize: 17 }}>Registrar movimiento</div>
        </div>
      </div>

      <div style={{ position: "absolute", top: 22, right: 28, background: C.accent, color: "#fff", borderRadius: 12, padding: "8px 18px", fontSize: 13, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", opacity: interpolate(frame, [10, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        Ahorros
      </div>
    </AbsoluteFill>
  );
};
