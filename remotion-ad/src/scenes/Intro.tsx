import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

const C = {
  bg: "#f8faf8",
  primary: "#166534",
  accent: "#059669",
  accentSoft: "#d9fbe8",
  ink: "#142315",
  muted: "#4a5f4d",
  line: "#d7e6da",
  surface: "#ffffff",
};

const GridBg: React.FC = () => (
  <div style={{
    position: "absolute", inset: 0,
    backgroundImage: `
      linear-gradient(to right, rgba(22,101,52,0.07) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(22,101,52,0.07) 1px, transparent 1px)
    `,
    backgroundSize: "64px 64px",
  }} />
);

const Logo: React.FC<{ size?: number }> = ({ size = 80 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <rect width="100" height="100" rx="24" fill={C.primary} />
    <path d="M22 50 C22 36 34 26 50 26 C62 26 72 33 76 43" stroke="#fff" strokeWidth="7" strokeLinecap="round" fill="none" />
    <path d="M78 50 C78 64 66 74 50 74 C38 74 28 67 24 57" stroke={C.accentSoft} strokeWidth="7" strokeLinecap="round" fill="none" />
    <circle cx="50" cy="50" r="7" fill="#fff" />
    <circle cx="50" cy="50" r="3.5" fill={C.accent} />
  </svg>
);

const PhoneMockup: React.FC<{ scale: number; opacity: number }> = ({ scale, opacity }) => (
  <div style={{
    width: 220,
    background: "#0f1910",
    borderRadius: 40,
    padding: 10,
    boxShadow: "0 32px 80px rgba(20,35,21,0.35)",
    transform: `scale(${scale})`,
    opacity,
  }}>
    <div style={{
      background: C.surface,
      borderRadius: 32,
      overflow: "hidden",
      padding: "36px 16px 16px",
      display: "flex",
      flexDirection: "column",
      gap: 12,
    }}>
      <p style={{ margin: 0, fontFamily: "'Manrope',sans-serif", fontSize: 9, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.18em" }}>Resumen · Abril</p>
      <div style={{ background: C.accentSoft, borderRadius: 16, padding: "16px" }}>
        <p style={{ margin: 0, fontSize: 9, color: C.muted, fontWeight: 700 }}>Gasto total</p>
        <p style={{ margin: "4px 0 0", fontFamily: "'Sora',sans-serif", fontSize: 26, fontWeight: 900, color: C.ink }}>$241.300</p>
        <div style={{ height: 6, background: C.line, borderRadius: 99, marginTop: 8 }}>
          <div style={{ height: "100%", width: "74%", background: C.primary, borderRadius: 99 }} />
        </div>
      </div>
      {[["Tickets", "47"], ["Presupuestos", "5"], ["Alertas", "3"]].map(([k, v]) => (
        <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "8px 12px", border: `1px solid ${C.line}`, borderRadius: 12 }}>
          <span style={{ fontSize: 11, color: C.muted, fontWeight: 600 }}>{k}</span>
          <span style={{ fontSize: 11, fontWeight: 900, color: C.ink }}>{v}</span>
        </div>
      ))}
    </div>
  </div>
);

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoS = spring({ frame, fps, config: { damping: 14, stiffness: 120 }, durationInFrames: 35 });
  const pillOp = interpolate(frame, [20, 42], [0, 1], { extrapolateRight: "clamp" });
  const pillY = interpolate(frame, [20, 42], [20, 0], { extrapolateRight: "clamp" });
  const h1Op = interpolate(frame, [32, 58], [0, 1], { extrapolateRight: "clamp" });
  const h1Y = interpolate(frame, [32, 58], [28, 0], { extrapolateRight: "clamp" });
  const subOp = interpolate(frame, [50, 72], [0, 1], { extrapolateRight: "clamp" });
  const phoneS = spring({ frame: frame - 60, fps, config: { damping: 13, stiffness: 80 }, durationInFrames: 40 });
  const phoneOp = interpolate(frame, [60, 80], [0, 1], { extrapolateRight: "clamp" });
  const btnOp = interpolate(frame, [80, 100], [0, 1], { extrapolateRight: "clamp" });
  const btnY = interpolate(frame, [80, 100], [16, 0], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: "'Sora',sans-serif", overflow: "hidden" }}>
      <GridBg />
      <div style={{ position: "absolute", top: -200, right: -200, width: 700, height: 700, borderRadius: "50%", background: "radial-gradient(circle, rgba(5,150,105,0.15) 0%, transparent 70%)" }} />
      <div style={{ position: "absolute", bottom: -300, left: -200, width: 800, height: 800, borderRadius: "50%", background: "radial-gradient(circle, rgba(22,101,52,0.10) 0%, transparent 70%)" }} />

      <AbsoluteFill style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 60px", gap: 0 }}>
        <div style={{ transform: `scale(${logoS})`, marginBottom: 28 }}>
          <Logo size={110} />
        </div>

        <div style={{ opacity: pillOp, transform: `translateY(${pillY}px)`, background: C.accentSoft, border: `1.5px solid ${C.line}`, borderRadius: 999, padding: "10px 28px", marginBottom: 24 }}>
          <span style={{ fontSize: 14, fontWeight: 900, letterSpacing: "0.2em", color: C.accent, textTransform: "uppercase" }}>✦ Gestión sin fricción</span>
        </div>

        <h1 style={{ opacity: h1Op, transform: `translateY(${h1Y}px)`, fontWeight: 900, fontSize: 86, color: C.primary, textAlign: "center", lineHeight: 1.0, letterSpacing: "-0.03em", margin: 0, marginBottom: 12 }}>
          Cuentas Claras
        </h1>

        <p style={{ opacity: h1Op, transform: `translateY(${h1Y}px)`, fontFamily: "'Sora',sans-serif", fontSize: 28, fontWeight: 700, color: C.ink, textAlign: "center", margin: "0 0 22px", letterSpacing: "-0.01em" }}>
          Tu dinero claro, tus decisiones seguras.
        </p>

        <p style={{ opacity: subOp, fontFamily: "'Manrope',sans-serif", fontSize: 22, color: C.muted, textAlign: "center", lineHeight: 1.5, margin: 0, marginBottom: 48, maxWidth: 760 }}>
          Registrá tickets, controlá presupuestos y recibí recomendaciones de tu asesor.
        </p>

        <PhoneMockup scale={interpolate(phoneS, [0, 1], [0.82, 1])} opacity={phoneOp} />

        <div style={{ opacity: btnOp, transform: `translateY(${btnY}px)`, display: "flex", flexDirection: "column", gap: 14, width: "100%", marginTop: 52 }}>
          <div style={{ background: C.primary, color: "#f0fdf4", borderRadius: 18, padding: "20px", textAlign: "center", fontFamily: "'Manrope',sans-serif", fontWeight: 900, fontSize: 20 }}>
            Crear cuenta gratis
          </div>
          <div style={{ background: "transparent", color: C.ink, border: `1.5px solid ${C.line}`, borderRadius: 18, padding: "20px", textAlign: "center", fontFamily: "'Manrope',sans-serif", fontWeight: 700, fontSize: 20 }}>
            Ver funciones
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
