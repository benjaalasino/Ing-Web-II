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

interface SavingsGoal {
  title: string;
  current: number;
  target: number;
  deadline: string;
  icon: string;
  color: string;
}

const goals: SavingsGoal[] = [
  { title: "Vacaciones en Brasil", current: 180000, target: 350000, deadline: "Dic 2026", icon: "✈️", color: C.blue },
  { title: "Notebook nueva", current: 420000, target: 450000, deadline: "May 2026", icon: "💻", color: C.accent },
  { title: "Fondo de emergencia", current: 95000, target: 300000, deadline: "Dic 2026", icon: "🛡️", color: C.purple },
  { title: "Auto propio", current: 1200000, target: 5000000, deadline: "Jun 2028", icon: "🚗", color: C.orange },
];

const GoalCard: React.FC<{
  goal: SavingsGoal;
  delay: number;
  frame: number;
  fps: number;
  barProgress: number;
  highlighted?: boolean;
}> = ({ goal, delay, frame, fps, barProgress, highlighted }) => {
  const pct = goal.current / goal.target;
  const barW = pct * barProgress * 100;
  const s = spring({ frame: frame - delay, fps, config: { damping: 14, stiffness: 100 }, durationInFrames: 30 });
  const op = interpolate(frame, [delay, delay + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const formatARS = (n: number) => {
    if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`;
    return `$${n}`;
  };

  return (
    <div style={{
      background: highlighted ? `linear-gradient(135deg, ${goal.color}10, ${goal.color}05)` : C.surface,
      border: `1.5px solid ${highlighted ? goal.color + "55" : C.line}`,
      borderRadius: 20,
      padding: "22px 24px",
      opacity: op,
      transform: `scale(${interpolate(s, [0, 1], [0.9, 1])}) translateY(${interpolate(s, [0, 1], [20, 0])}px)`,
      boxShadow: highlighted ? `0 8px 32px ${goal.color}20` : "0 4px 16px rgba(20,35,21,0.06)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: `${goal.color}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 22,
          }}>
            {goal.icon}
          </div>
          <div>
            <p style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 800, color: C.ink }}>{goal.title}</p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: C.muted, fontWeight: 600 }}>Meta: {goal.deadline}</p>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <p style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 900, color: goal.color }}>
            {Math.round(pct * 100)}%
          </p>
        </div>
      </div>

      <div style={{ height: 10, background: C.line, borderRadius: 99, overflow: "hidden", marginBottom: 8 }}>
        <div style={{
          height: "100%",
          width: `${barW}%`,
          background: `linear-gradient(90deg, ${goal.color}, ${goal.color}bb)`,
          borderRadius: 99,
        }} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: goal.color }}>{formatARS(goal.current)} ahorrado</span>
        <span style={{ fontSize: 12, color: C.muted, fontWeight: 600 }}>objetivo: {formatARS(goal.target)}</span>
      </div>
    </div>
  );
};

export const Savings: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOp = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: "clamp" });
  const headerY = interpolate(frame, [0, 25], [-20, 0], { extrapolateRight: "clamp" });
  const barProgress = interpolate(frame, [25, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const totalSaved = goals.reduce((a, g) => a + g.current, 0);

  const counterVal = interpolate(frame, [30, 90], [0, totalSaved], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const formatARS = (n: number) => `$${Math.round(n).toLocaleString("es-AR")}`;

  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: "'Manrope',sans-serif", overflow: "hidden" }}>
      <GridBg />

      <div style={{
        position: "absolute",
        top: -80,
        right: -80,
        width: 400,
        height: 400,
        borderRadius: "50%",
        background: `radial-gradient(circle, rgba(5,150,105,0.12) 0%, transparent 70%)`,
      }} />

      <div style={{ position: "absolute", inset: 0, padding: "36px 80px", display: "flex", flexDirection: "column" }}>
        <div style={{
          opacity: headerOp,
          transform: `translateY(${headerY}px)`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 28,
        }}>
          <div>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 900, color: C.accent, textTransform: "uppercase", letterSpacing: "0.22em", marginBottom: 4 }}>METAS FINANCIERAS</p>
            <h2 style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontSize: 38, fontWeight: 900, color: C.ink }}>Mis Ahorros</h2>
            <p style={{ margin: "6px 0 0", fontSize: 14, color: C.muted }}>4 metas activas · progreso en tiempo real</p>
          </div>

          <div style={{
            background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`,
            color: "#fff",
            borderRadius: 20,
            padding: "20px 28px",
            textAlign: "center",
            boxShadow: `0 12px 36px rgba(22,101,52,0.25)`,
          }}>
            <p style={{ margin: 0, fontSize: 11, fontWeight: 700, opacity: 0.85, textTransform: "uppercase", letterSpacing: "0.14em" }}>Total ahorrado</p>
            <p style={{ margin: "8px 0 0", fontFamily: "'Sora',sans-serif", fontSize: 30, fontWeight: 900, letterSpacing: "-0.02em" }}>
              {formatARS(counterVal)}
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
          {goals.map((g, i) => (
            <GoalCard
              key={g.title}
              goal={g}
              delay={15 + i * 14}
              frame={frame}
              fps={fps}
              barProgress={barProgress}
              highlighted={i === 1}
            />
          ))}
        </div>

        <div style={{
          marginTop: 20,
          display: "flex",
          gap: 12,
          opacity: interpolate(frame, [75, 95], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}>
          <div style={{
            background: C.primary,
            color: "#fff",
            borderRadius: 12,
            padding: "12px 28px",
            fontWeight: 800,
            fontSize: 13,
          }}>
            + Nueva meta
          </div>
          <div style={{
            background: C.accentSoft,
            color: C.primary,
            border: `1.5px solid ${C.line}`,
            borderRadius: 12,
            padding: "12px 24px",
            fontWeight: 700,
            fontSize: 13,
          }}>
            Registrar movimiento
          </div>
        </div>
      </div>

      <div style={{
        position: "absolute",
        top: 20,
        right: 24,
        background: C.accent,
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
        Ahorros
      </div>
    </AbsoluteFill>
  );
};
