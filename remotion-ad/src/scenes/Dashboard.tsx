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
  blue: "#3b82f6",
  orange: "#f59e0b",
  purple: "#8b5cf6",
  red: "#ef4444",
};

const GridBg: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(to right, rgba(22,101,52,0.05) 1px, transparent 1px),linear-gradient(to bottom, rgba(22,101,52,0.05) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
);

const StatCard: React.FC<{ label: string; value: string; color: string; icon: string; delay: number; frame: number; fps: number }> = ({ label, value, color, icon, delay, frame, fps }) => {
  const s = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 110 }, durationInFrames: 28 });
  const op = interpolate(frame, [delay, delay + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.line}`, borderRadius: 24, padding: "24px 28px", boxShadow: "0 6px 20px rgba(20,35,21,0.07)", opacity: op, transform: `translateY(${interpolate(s, [0, 1], [20, 0])}px) scale(${interpolate(s, [0, 1], [0.92, 1])})` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <p style={{ margin: 0, fontFamily: "'Manrope',sans-serif", fontSize: 14, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.14em" }}>{label}</p>
        <span style={{ fontSize: 26 }}>{icon}</span>
      </div>
      <p style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontSize: 38, fontWeight: 900, color, lineHeight: 1 }}>{value}</p>
      <div style={{ marginTop: 12, width: 36, height: 4, background: color, borderRadius: 2 }} />
    </div>
  );
};

const PieChart: React.FC<{ progress: number }> = ({ progress }) => {
  const r = 120, cx = 140, cy = 140;
  const slices = [
    { pct: 0.35, color: C.primary, label: "Alimentos", val: "35%" },
    { pct: 0.22, color: C.blue, label: "Transporte", val: "22%" },
    { pct: 0.18, color: C.orange, label: "Ocio", val: "18%" },
    { pct: 0.15, color: C.purple, label: "Salud", val: "15%" },
    { pct: 0.10, color: C.red, label: "Otros", val: "10%" },
  ];
  let cum = 0;
  const paths = slices.map((sl, i) => {
    const shown = Math.min(sl.pct, Math.max(0, progress - cum));
    cum += sl.pct;
    if (shown <= 0) return null;
    const a1 = (cum - sl.pct) * Math.PI * 2 - Math.PI / 2;
    const a2 = (cum - sl.pct + shown) * Math.PI * 2 - Math.PI / 2;
    const large = shown > 0.5 ? 1 : 0;
    return (
      <path key={i} d={`M${cx},${cy} L${cx + r * Math.cos(a1)},${cy + r * Math.sin(a1)} A${r},${r} 0 ${large},1 ${cx + r * Math.cos(a2)},${cy + r * Math.sin(a2)} Z`} fill={sl.color} stroke="#fff" strokeWidth="3" />
    );
  });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
      <svg width={280} height={280} viewBox="0 0 280 280">
        {paths}
        <circle cx={cx} cy={cy} r={50} fill={C.surface} />
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="13" fontWeight="800" fontFamily="Manrope" fill={C.muted}>GASTOS</text>
        <text x={cx} y={cy + 14} textAnchor="middle" fontSize="13" fontWeight="800" fontFamily="Manrope" fill={C.muted}>MES</text>
      </svg>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {slices.map((sl) => (
          <div key={sl.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 14, height: 14, borderRadius: 4, background: sl.color, flexShrink: 0 }} />
            <span style={{ fontSize: 16, color: C.muted, fontWeight: 600 }}>{sl.label}</span>
            <span style={{ fontSize: 16, color: C.ink, fontWeight: 900, marginLeft: "auto" }}>{sl.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOp = interpolate(frame, [0, 22], [0, 1], { extrapolateRight: "clamp" });
  const headerY = interpolate(frame, [0, 22], [-24, 0], { extrapolateRight: "clamp" });
  const chartProgress = interpolate(frame, [50, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const chartOp = interpolate(frame, [42, 62], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: "'Manrope',sans-serif", overflow: "hidden" }}>
      <GridBg />

      <div style={{ position: "absolute", inset: 0, padding: "60px 56px", display: "flex", flexDirection: "column", gap: 0 }}>
        {/* Top bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 36,
          opacity: headerOp, transform: `translateY(${headerY}px)`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontSize: 16, fontWeight: 900 }}>CC</span>
            </div>
            <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 800, color: C.primary }}>Cuentas Claras</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 46, height: 46, borderRadius: "50%", background: C.accentSoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 900, color: C.primary }}>MG</div>
          </div>
        </div>

        {/* Welcome */}
        <div style={{ opacity: headerOp, transform: `translateY(${headerY}px)`, marginBottom: 28 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 900, color: C.accent, textTransform: "uppercase", letterSpacing: "0.22em", marginBottom: 6 }}>PANEL DE CONTROL</p>
          <h2 style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontSize: 46, fontWeight: 900, color: C.ink }}>Bienvenida, María 👋</h2>
        </div>

        {/* Stat cards 2x2 */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginBottom: 32 }}>
          <StatCard label="Total mes" value="$241K" color={C.primary} icon="💸" delay={14} frame={frame} fps={fps} />
          <StatCard label="Top categoría" value="🛒 Alim." color={C.blue} icon="📊" delay={22} frame={frame} fps={fps} />
          <StatCard label="Gastos" value="47" color={C.orange} icon="🧾" delay={30} frame={frame} fps={fps} />
          <StatCard label="Presupuesto" value="74%" color={C.accent} icon="🎯" delay={38} frame={frame} fps={fps} />
        </div>

        {/* Pie chart card */}
        <div style={{
          background: C.surface, border: `1px solid ${C.line}`, borderRadius: 28, padding: "28px 32px",
          boxShadow: "0 8px 28px rgba(20,35,21,0.07)", opacity: chartOp,
          transform: `translateY(${interpolate(frame, [42, 62], [24, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
        }}>
          <h3 style={{ margin: "0 0 20px", fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 800, color: C.ink }}>Gastos por categoría</h3>
          <PieChart progress={chartProgress} />
        </div>
      </div>

      {/* Scene label */}
      <div style={{ position: "absolute", top: 22, right: 28, background: C.primary, color: "#fff", borderRadius: 12, padding: "8px 18px", fontSize: 13, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", opacity: interpolate(frame, [10, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        Dashboard
      </div>
    </AbsoluteFill>
  );
};
