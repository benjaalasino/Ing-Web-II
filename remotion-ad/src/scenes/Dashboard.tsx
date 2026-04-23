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

const StatCard: React.FC<{
  label: string;
  value: string;
  color?: string;
  delay: number;
  frame: number;
  fps: number;
}> = ({ label, value, color = C.primary, delay, frame, fps }) => {
  const s = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 100 }, durationInFrames: 30 });
  const op = interpolate(frame, [delay, delay + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{
      background: C.surface,
      border: `1px solid ${C.line}`,
      borderRadius: 16,
      padding: "20px 24px",
      boxShadow: "0 8px 24px rgba(20,35,21,0.07)",
      opacity: op,
      transform: `scale(${interpolate(s, [0, 1], [0.88, 1])}) translateY(${interpolate(s, [0, 1], [16, 0])}px)`,
    }}>
      <p style={{ fontFamily: "'Manrope',sans-serif", fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.18em", margin: 0, marginBottom: 8 }}>{label}</p>
      <p style={{ fontFamily: "'Sora',sans-serif", fontSize: 26, fontWeight: 900, color, margin: 0, lineHeight: 1 }}>{value}</p>
      <div style={{ marginTop: 8, width: 32, height: 3, background: color, borderRadius: 2 }} />
    </div>
  );
};

const PieChart: React.FC<{ progress: number }> = ({ progress }) => {
  const r = 90;
  const cx = 115;
  const cy = 115;
  const slices = [
    { pct: 0.35, color: C.primary, label: "Alimentos" },
    { pct: 0.22, color: C.blue, label: "Transporte" },
    { pct: 0.18, color: C.orange, label: "Ocio" },
    { pct: 0.15, color: C.purple, label: "Salud" },
    { pct: 0.10, color: C.red, label: "Otros" },
  ];

  let cumulative = 0;
  const paths: JSX.Element[] = [];

  for (let i = 0; i < slices.length; i++) {
    const slice = slices[i];
    const shown = Math.min(slice.pct, Math.max(0, progress - cumulative));
    if (shown <= 0) { cumulative += slice.pct; continue; }

    const startAngle = cumulative * Math.PI * 2 - Math.PI / 2;
    const endAngle = (cumulative + shown) * Math.PI * 2 - Math.PI / 2;

    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const large = shown > 0.5 ? 1 : 0;

    paths.push(
      <path
        key={i}
        d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`}
        fill={slice.color}
        stroke="#fff"
        strokeWidth="2"
      />
    );
    cumulative += slice.pct;
  }

  return (
    <svg width={230} height={230} viewBox="0 0 230 230">
      {paths}
      <circle cx={cx} cy={cy} r={38} fill={C.surface} />
      <text x={cx} y={cy - 6} textAnchor="middle" fontSize="11" fontWeight="800" fontFamily="Manrope" fill={C.muted}>GASTOS</text>
      <text x={cx} y={cy + 14} textAnchor="middle" fontSize="11" fontWeight="800" fontFamily="Manrope" fill={C.muted}>MES</text>
    </svg>
  );
};

const BarChart: React.FC<{ progress: number }> = ({ progress }) => {
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"];
  const values = [65, 82, 71, 94, 78, 110];
  const max = 120;

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 140, padding: "0 8px" }}>
      {months.map((m, i) => {
        const barH = (values[i] / max) * 130 * Math.min(1, Math.max(0, progress * 6 - i));
        return (
          <div key={m} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, gap: 6 }}>
            <div style={{
              width: "100%",
              height: barH,
              background: i === 5 ? C.primary : `${C.primary}55`,
              borderRadius: "6px 6px 0 0",
              transition: "height 0.3s",
            }} />
            <span style={{ fontFamily: "Manrope", fontSize: 10, fontWeight: 700, color: C.muted }}>{m}</span>
          </div>
        );
      })}
    </div>
  );
};

export const Dashboard: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const panelS = spring({ frame, fps, config: { damping: 16, stiffness: 90 }, durationInFrames: 40 });
  const panelOp = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: "clamp" });
  const titleOp = interpolate(frame, [10, 35], [0, 1], { extrapolateRight: "clamp" });

  const chartProgress = interpolate(frame, [40, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const navItems = ["Dashboard", "Gastos", "Presupuestos", "Ahorros", "Tickets"];

  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: "'Manrope',sans-serif", overflow: "hidden" }}>
      <GridBg />

      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: 220,
        height: "100%",
        background: C.surface,
        borderRight: `1px solid ${C.line}`,
        boxShadow: "4px 0 20px rgba(20,35,21,0.05)",
        display: "flex",
        flexDirection: "column",
        padding: "28px 0",
        opacity: panelOp,
        transform: `translateX(${interpolate(panelS, [0, 1], [-220, 0])}px)`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 20px", marginBottom: 32 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: C.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 16, fontWeight: 900 }}>CC</span>
          </div>
          <span style={{ fontFamily: "'Sora',sans-serif", fontSize: 14, fontWeight: 800, color: C.primary }}>Cuentas Claras</span>
        </div>
        {navItems.map((item, i) => (
          <div key={item} style={{
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: i === 0 ? C.accentSoft : "transparent",
            borderLeft: i === 0 ? `3px solid ${C.primary}` : "3px solid transparent",
            color: i === 0 ? C.primary : C.muted,
            fontWeight: i === 0 ? 800 : 600,
            fontSize: 13,
          }}>
            {["◈", "◉", "▣", "◎", "⊕"][i]} {item}
          </div>
        ))}
        <div style={{ marginTop: "auto", padding: "16px 20px", borderTop: `1px solid ${C.line}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: C.accentSoft, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800, color: C.primary }}>MG</div>
            <div>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: C.ink }}>María García</p>
              <p style={{ margin: 0, fontSize: 10, color: C.muted }}>usuario@wisepocket.com</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{
        position: "absolute",
        left: 220,
        top: 0,
        right: 0,
        bottom: 0,
        padding: "28px 32px",
        overflow: "hidden",
      }}>
        <div style={{
          opacity: titleOp,
          marginBottom: 24,
        }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 900, color: C.accent, textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 4 }}>PANEL DE CONTROL</p>
          <h2 style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontSize: 28, fontWeight: 900, color: C.ink }}>Bienvenida, María 👋</h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
          <StatCard label="Total mes" value="$241.300" color={C.primary} delay={15} frame={frame} fps={fps} />
          <StatCard label="Top categoría" value="Alimentos" color={C.blue} delay={22} frame={frame} fps={fps} />
          <StatCard label="Cantidad gastos" value="47" color={C.orange} delay={29} frame={frame} fps={fps} />
          <StatCard label="Uso presupuesto" value="74%" color={C.accent} delay={36} frame={frame} fps={fps} />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div style={{
            background: C.surface,
            border: `1px solid ${C.line}`,
            borderRadius: 18,
            padding: "20px 24px",
            boxShadow: "0 8px 24px rgba(20,35,21,0.07)",
            opacity: interpolate(frame, [30, 55], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}>
            <h3 style={{ margin: "0 0 16px", fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 800, color: C.ink }}>Gastos por categoría</h3>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <PieChart progress={chartProgress} />
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "Alimentos", pct: "35%", color: C.primary },
                  { label: "Transporte", pct: "22%", color: C.blue },
                  { label: "Ocio", pct: "18%", color: C.orange },
                  { label: "Salud", pct: "15%", color: C.purple },
                  { label: "Otros", pct: "10%", color: C.red },
                ].map((item) => (
                  <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 3, background: item.color, flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{item.label}</span>
                    <span style={{ fontSize: 11, color: C.ink, fontWeight: 800, marginLeft: "auto" }}>{item.pct}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{
            background: C.surface,
            border: `1px solid ${C.line}`,
            borderRadius: 18,
            padding: "20px 24px",
            boxShadow: "0 8px 24px rgba(20,35,21,0.07)",
            opacity: interpolate(frame, [40, 65], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
          }}>
            <h3 style={{ margin: "0 0 8px", fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 800, color: C.ink }}>Evolución mensual</h3>
            <p style={{ margin: "0 0 16px", fontSize: 11, color: C.muted, fontWeight: 600 }}>Gastos en miles de pesos</p>
            <BarChart progress={chartProgress} />
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: C.primary }} />
              <span style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>Mes actual</span>
              <div style={{ width: 10, height: 10, borderRadius: 2, background: `${C.primary}55`, marginLeft: 8 }} />
              <span style={{ fontSize: 10, color: C.muted, fontWeight: 600 }}>Meses anteriores</span>
            </div>
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
        opacity: interpolate(frame, [50, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}>
        Dashboard
      </div>
    </AbsoluteFill>
  );
};
