import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

const C = {
  bg: "#f5f8fc", primary: "#166534", accent: "#059669", accentSoft: "#d9fbe8",
  ink: "#142315", muted: "#4a5f4d", line: "#d7e6da", surface: "#ffffff",
  blue: "#3b82f6", orange: "#f59e0b", red: "#ef4444", purple: "#8b5cf6",
};

const GridBg: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(to right, rgba(22,101,52,0.05) 1px, transparent 1px),linear-gradient(to bottom, rgba(22,101,52,0.05) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
);

const AreaChart: React.FC<{ progress: number }> = ({ progress }) => {
  const W = 860, H = 180;
  const pts: [number, number][] = [[0, 110], [100, 90], [200, 130], [300, 70], [400, 100], [500, 55], [600, 80], [720, 50], [860, 70]];
  const vis = pts.filter(([x]) => x / W <= progress);
  if (vis.length < 2) return null;
  const lineD = vis.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  const areaD = lineD + ` L${vis[vis.length - 1][0]},${H} L0,${H} Z`;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible", width: "100%" }}>
      <defs>
        <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.primary} stopOpacity="0.28" />
          <stop offset="100%" stopColor={C.primary} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#ag)" />
      <path d={lineD} fill="none" stroke={C.primary} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
      {vis.length > 0 && <circle cx={vis[vis.length - 1][0]} cy={vis[vis.length - 1][1]} r="7" fill={C.primary} stroke="#fff" strokeWidth="3" />}
    </svg>
  );
};

const expenses = [
  { icon: "🛒", store: "Carrefour Express", cat: "Alimentos", date: "Hoy 09:14", amount: 4350, color: C.primary },
  { icon: "⛽", store: "Shell - Av. Libertador", cat: "Transporte", date: "Hoy 07:52", amount: 18500, color: C.blue },
  { icon: "🎬", store: "Netflix Argentina", cat: "Ocio", date: "Ayer", amount: 2800, color: C.orange },
  { icon: "💊", store: "Farmacity", cat: "Salud", date: "20 Abr", amount: 3450, color: C.purple },
  { icon: "📱", store: "Personal", cat: "Telefonía", date: "18 Abr", amount: 8900, color: C.red },
];

export const Expenses: React.FC = () => {
  const frame = useCurrentFrame();
  const headerOp = interpolate(frame, [0, 22], [0, 1], { extrapolateRight: "clamp" });
  const chartProgress = interpolate(frame, [18, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const chartOp = interpolate(frame, [14, 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: "'Manrope',sans-serif", overflow: "hidden" }}>
      <GridBg />
      <div style={{ position: "absolute", inset: 0, padding: "168px 56px 220px", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ opacity: headerOp, transform: `translateY(${interpolate(frame, [0, 22], [-20, 0], { extrapolateRight: "clamp" })}px)`, marginBottom: 24 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 900, color: C.accent, textTransform: "uppercase", letterSpacing: "0.22em", marginBottom: 6 }}>HISTORIAL</p>
          <h2 style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontSize: 50, fontWeight: 900, color: C.ink }}>Mis Gastos</h2>
        </div>

        {/* Totals row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24, opacity: headerOp }}>
          {[{ label: "Este mes", value: "$241.300", color: C.primary }, { label: "Mes anterior", value: "$198.750", color: C.muted }].map(s => (
            <div key={s.label} style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 20, padding: "18px 22px", boxShadow: "0 4px 16px rgba(20,35,21,0.06)" }}>
              <p style={{ margin: 0, fontSize: 12, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em" }}>{s.label}</p>
              <p style={{ margin: "6px 0 0", fontFamily: "'Sora',sans-serif", fontSize: 28, fontWeight: 900, color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Area chart */}
        <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 24, padding: "22px 28px", marginBottom: 24, boxShadow: "0 6px 20px rgba(20,35,21,0.06)", opacity: chartOp }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 800, color: C.ink }}>Evolución · Abril 2026</h3>
            <span style={{ fontSize: 14, color: C.accent, fontWeight: 800 }}>$8.170 hoy</span>
          </div>
          <AreaChart progress={chartProgress} />
        </div>

        {/* Recent expenses */}
        <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 24, overflow: "hidden", flex: 1, boxShadow: "0 6px 20px rgba(20,35,21,0.06)", opacity: interpolate(frame, [28, 48], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          <div style={{ padding: "18px 24px", borderBottom: `1px solid ${C.line}` }}>
            <h3 style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 800, color: C.ink }}>Movimientos recientes</h3>
          </div>
          {expenses.map((e, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, padding: "18px 24px", borderBottom: i < expenses.length - 1 ? `1px solid ${C.line}` : "none", opacity: interpolate(frame, [38 + i * 8, 56 + i * 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), transform: `translateX(${interpolate(frame, [38 + i * 8, 56 + i * 8], [-24, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)` }}>
              <div style={{ width: 52, height: 52, borderRadius: 16, background: `${e.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{e.icon}</div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: 0, fontSize: 18, fontWeight: 800, color: C.ink }}>{e.store}</p>
                <p style={{ margin: "3px 0 0", fontSize: 14, color: C.muted }}><span style={{ color: e.color, fontWeight: 700 }}>{e.cat}</span> · {e.date}</p>
              </div>
              <p style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 900, color: C.ink }}>${e.amount.toLocaleString("es-AR")}</p>
            </div>
          ))}
        </div>
      </div>

      <div style={{ position: "absolute", top: 22, right: 28, background: C.red, color: "#fff", borderRadius: 12, padding: "8px 18px", fontSize: 13, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", opacity: interpolate(frame, [10, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        Gastos
      </div>
    </AbsoluteFill>
  );
};
