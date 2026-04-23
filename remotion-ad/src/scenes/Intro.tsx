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
  surfaceSoft: "#eef7f0",
};

const GridBg: React.FC = () => (
  <div
    style={{
      position: "absolute",
      inset: 0,
      backgroundImage: `
        linear-gradient(to right, rgba(22,101,52,0.07) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(22,101,52,0.07) 1px, transparent 1px)
      `,
      backgroundSize: "52px 52px",
    }}
  />
);

const Logo: React.FC<{ size?: number }> = ({ size = 52 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <rect width="100" height="100" rx="22" fill={C.primary} />
    <path
      d="M22 50 C22 36 34 26 50 26 C62 26 72 33 76 43"
      stroke="#fff"
      strokeWidth="7"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M78 50 C78 64 66 74 50 74 C38 74 28 67 24 57"
      stroke={C.accentSoft}
      strokeWidth="7"
      strokeLinecap="round"
      fill="none"
    />
    <circle cx="50" cy="50" r="7" fill="#fff" />
    <circle cx="50" cy="50" r="3.5" fill={C.accent} />
  </svg>
);

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoScale = spring({ frame, fps, config: { damping: 14, stiffness: 120 }, durationInFrames: 35 });
  const taglineOpacity = interpolate(frame, [20, 45], [0, 1], { extrapolateRight: "clamp" });
  const taglineY = interpolate(frame, [20, 45], [24, 0], { extrapolateRight: "clamp" });
  const headlineOpacity = interpolate(frame, [35, 65], [0, 1], { extrapolateRight: "clamp" });
  const headlineY = interpolate(frame, [35, 65], [30, 0], { extrapolateRight: "clamp" });
  const subOpacity = interpolate(frame, [55, 80], [0, 1], { extrapolateRight: "clamp" });
  const subY = interpolate(frame, [55, 80], [20, 0], { extrapolateRight: "clamp" });
  const pillOpacity = interpolate(frame, [70, 90], [0, 1], { extrapolateRight: "clamp" });

  const glowOpacity = interpolate(frame, [0, 40], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: "'Sora', sans-serif", overflow: "hidden" }}>
      <GridBg />

      <div style={{
        position: "absolute",
        top: -120,
        left: -120,
        width: 600,
        height: 600,
        borderRadius: "50%",
        background: `radial-gradient(circle, rgba(5,150,105,0.18) 0%, transparent 70%)`,
        opacity: glowOpacity,
      }} />
      <div style={{
        position: "absolute",
        bottom: -150,
        right: -100,
        width: 700,
        height: 700,
        borderRadius: "50%",
        background: `radial-gradient(circle, rgba(22,101,52,0.12) 0%, transparent 70%)`,
        opacity: glowOpacity,
      }} />

      <AbsoluteFill style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
      }}>
        <div style={{ transform: `scale(${logoScale})`, marginBottom: 28 }}>
          <Logo size={96} />
        </div>

        <div style={{
          opacity: taglineOpacity,
          transform: `translateY(${taglineY}px)`,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: C.accentSoft,
          border: `1.5px solid ${C.line}`,
          borderRadius: 999,
          padding: "8px 20px",
          marginBottom: 22,
        }}>
          <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.22em", color: C.accent, textTransform: "uppercase" }}>
            ✦ Gestión sin fricción
          </span>
        </div>

        <h1 style={{
          opacity: headlineOpacity,
          transform: `translateY(${headlineY}px)`,
          fontFamily: "'Sora', sans-serif",
          fontWeight: 900,
          fontSize: 76,
          color: C.ink,
          textAlign: "center",
          lineHeight: 1.05,
          letterSpacing: "-0.025em",
          margin: 0,
          marginBottom: 22,
          maxWidth: 900,
        }}>
          Tu plata clara,<br />
          <span style={{ color: C.primary }}>tus decisiones</span> seguras.
        </h1>

        <p style={{
          opacity: subOpacity,
          transform: `translateY(${subY}px)`,
          fontFamily: "'Manrope', sans-serif",
          fontSize: 22,
          color: C.muted,
          textAlign: "center",
          maxWidth: 660,
          lineHeight: 1.55,
          margin: 0,
          marginBottom: 36,
        }}>
          Registrá tickets, organizá categorías, controlá presupuestos y recibí recomendaciones de tu asesor financiero.
        </p>

        <div style={{
          opacity: pillOpacity,
          display: "flex",
          gap: 16,
        }}>
          <div style={{
            background: C.primary,
            color: "#f0fdf4",
            borderRadius: 14,
            padding: "14px 32px",
            fontFamily: "'Manrope', sans-serif",
            fontWeight: 800,
            fontSize: 16,
            letterSpacing: "0.01em",
          }}>
            Crear cuenta gratis
          </div>
          <div style={{
            background: "transparent",
            color: C.ink,
            border: `1.5px solid ${C.line}`,
            borderRadius: 14,
            padding: "14px 32px",
            fontFamily: "'Manrope', sans-serif",
            fontWeight: 700,
            fontSize: 16,
          }}>
            Ver funciones
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
