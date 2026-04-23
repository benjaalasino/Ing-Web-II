import {
  AbsoluteFill,
  interpolate,
  useCurrentFrame,
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

const expenses = [
  { icon: "🛒", store: "Carrefour Express", category: "Alimentos", date: "Hoy 09:14", amount: 4350, color: C.primary },
  { icon: "⛽", store: "Shell - Av. Libertador", category: "Transporte", date: "Hoy 07:52", amount: 18500, color: C.blue },
  { icon: "🎬", store: "Netflix Argentina", category: "Ocio", date: "Ayer 00:01", amount: 2800, color: C.orange },
  { icon: "☕", store: "Starbucks Palermo", category: "Alimentos", date: "Ayer 15:30", amount: 1650, color: C.primary },
  { icon: "💊", store: "Farmacity", category: "Salud", date: "20 Abr", amount: 3450, color: C.purple },
  { icon: "🐕", store: "Purina - DogChow", category: "Mascotas", date: "19 Abr", amount: 5200, color: C.accent },
  { icon: "📱", store: "Personal", category: "Telefonía", date: "18 Abr", amount: 8900, color: C.red },
  { icon: "🏪", store: "Rappi Market", category: "Alimentos", date: "17 Abr", amount: 6700, color: C.primary },
];

const AreaChart: React.FC<{ progress: number }> = ({ progress }) => {
  const W = 480;
  const H = 120;
  const pts = [
    [0, 70], [60, 55], [120, 80], [180, 45], [240, 65], [300, 35], [360, 50], [420, 30], [480, 45],
  ];

  const visiblePts = pts.map(([x, y]) => {
    const ratio = x / W;
    if (ratio > progress) return null;
    return [x, y] as [number, number];
  }).filter(Boolean) as [number, number][];

  if (visiblePts.length < 2) return null;

  const lineD = visiblePts.map((p, i) => `${i === 0 ? "M" : "L"}${p[0]},${p[1]}`).join(" ");
  const areaD = lineD + ` L${visiblePts[visiblePts.length - 1][0]},${H} L0,${H} Z`;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.primary} stopOpacity="0.25" />
          <stop offset="100%" stopColor={C.primary} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaD} fill="url(#areaGrad)" />
      <path d={lineD} fill="none" stroke={C.primary} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {visiblePts.length > 0 && (
        <circle cx={visiblePts[visiblePts.length - 1][0]} cy={visiblePts[visiblePts.length - 1][1]} r="5" fill={C.primary} stroke="#fff" strokeWidth="2" />
      )}
    </svg>
  );
};

export const Expenses: React.FC = () => {
  const frame = useCurrentFrame();

  const headerOp = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: "clamp" });
  const headerY = interpolate(frame, [0, 25], [-20, 0], { extrapolateRight: "clamp" });
  const chartProgress = interpolate(frame, [20, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: "'Manrope',sans-serif", overflow: "hidden" }}>
      <GridBg />

      <div style={{ position: "absolute", inset: 0, padding: "32px 60px", display: "flex", flexDirection: "column" }}>
        <div style={{
          opacity: headerOp,
          transform: `translateY(${headerY}px)`,
          marginBottom: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
        }}>
          <div>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 900, color: C.accent, textTransform: "uppercase", letterSpacing: "0.22em", marginBottom: 4 }}>HISTORIAL COMPLETO</p>
            <h2 style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontSize: 36, fontWeight: 900, color: C.ink }}>Mis Gastos</h2>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { label: "Este mes", value: "$241.300", color: C.primary },
              { label: "Mes anterior", value: "$198.750", color: C.muted },
            ].map((s) => (
              <div key={s.label} style={{
                background: C.surface,
                border: `1.5px solid ${C.line}`,
                borderRadius: 14,
                padding: "12px 20px",
                textAlign: "right",
                boxShadow: "0 4px 16px rgba(20,35,21,0.06)",
              }}>
                <p style={{ margin: 0, fontSize: 10, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em" }}>{s.label}</p>
                <p style={{ margin: "4px 0 0", fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 900, color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          background: C.surface,
          border: `1.5px solid ${C.line}`,
          borderRadius: 18,
          padding: "20px 24px",
          marginBottom: 18,
          boxShadow: "0 8px 24px rgba(20,35,21,0.06)",
          opacity: interpolate(frame, [15, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontSize: 14, fontWeight: 800, color: C.ink }}>Evolución diaria · Abril 2026</h3>
            <span style={{ fontSize: 12, color: C.accent, fontWeight: 700 }}>$8.170 hoy</span>
          </div>
          <AreaChart progress={chartProgress} />
        </div>

        <div style={{
          background: C.surface,
          border: `1.5px solid ${C.line}`,
          borderRadius: 18,
          overflow: "hidden",
          boxShadow: "0 8px 24px rgba(20,35,21,0.06)",
          flex: 1,
          opacity: interpolate(frame, [25, 45], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}>
          <div style={{ padding: "14px 20px", borderBottom: `1px solid ${C.line}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontSize: 14, fontWeight: 800, color: C.ink }}>Movimientos recientes</h3>
            <div style={{ display: "flex", gap: 8 }}>
              {["Todos", "Alimentos", "Transporte", "Ocio"].map((f, fi) => (
                <div key={f} style={{
                  background: fi === 0 ? C.primary : C.accentSoft,
                  color: fi === 0 ? "#fff" : C.primary,
                  borderRadius: 8,
                  padding: "4px 12px",
                  fontSize: 11,
                  fontWeight: 800,
                  cursor: "default",
                }}>
                  {f}
                </div>
              ))}
            </div>
          </div>

          <div>
            {expenses.map((e, i) => (
              <div key={i} style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "12px 20px",
                borderBottom: i < expenses.length - 1 ? `1px solid ${C.line}` : "none",
                opacity: interpolate(frame, [35 + i * 7, 55 + i * 7], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                transform: `translateX(${interpolate(frame, [35 + i * 7, 55 + i * 7], [-20, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
              }}>
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: `${e.color}15`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 18,
                  flexShrink: 0,
                }}>
                  {e.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: C.ink }}>{e.store}</p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: C.muted }}>
                    <span style={{ color: e.color, fontWeight: 700 }}>{e.category}</span> · {e.date}
                  </p>
                </div>
                <p style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 900, color: C.ink }}>
                  ${e.amount.toLocaleString("es-AR")}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{
        position: "absolute",
        top: 20,
        right: 24,
        background: C.red,
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
        Gastos
      </div>
    </AbsoluteFill>
  );
};
