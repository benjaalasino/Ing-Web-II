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

const Logo: React.FC<{ size?: number }> = ({ size = 52 }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
    <rect width="100" height="100" rx="22" fill={C.primary} />
    <path d="M22 50 C22 36 34 26 50 26 C62 26 72 33 76 43" stroke="#fff" strokeWidth="7" strokeLinecap="round" fill="none" />
    <path d="M78 50 C78 64 66 74 50 74 C38 74 28 67 24 57" stroke={C.accentSoft} strokeWidth="7" strokeLinecap="round" fill="none" />
    <circle cx="50" cy="50" r="7" fill="#fff" />
    <circle cx="50" cy="50" r="3.5" fill={C.accent} />
  </svg>
);

const GridBg: React.FC = () => (
  <div style={{
    position: "absolute",
    inset: 0,
    backgroundImage: `
      linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px)
    `,
    backgroundSize: "52px 52px",
  }} />
);

const features = [
  { icon: "📊", label: "Dashboard inteligente" },
  { icon: "🎯", label: "Presupuestos por categoría" },
  { icon: "💰", label: "Metas de ahorro" },
  { icon: "📄", label: "Tickets digitalizados" },
  { icon: "🧑‍💼", label: "Asesor financiero personal" },
  { icon: "🔒", label: "Seguridad JWT + RBAC" },
];

export const CTA: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const bgS = spring({ frame, fps, config: { damping: 14, stiffness: 80 }, durationInFrames: 45 });
  const logoS = spring({ frame: frame - 10, fps, config: { damping: 14, stiffness: 120 }, durationInFrames: 35 });
  const headOp = interpolate(frame, [20, 45], [0, 1], { extrapolateRight: "clamp" });
  const headY = interpolate(frame, [20, 45], [24, 0], { extrapolateRight: "clamp" });
  const subOp = interpolate(frame, [35, 60], [0, 1], { extrapolateRight: "clamp" });
  const urlOp = interpolate(frame, [80, 100], [0, 1], { extrapolateRight: "clamp" });
  const urlS = spring({ frame: frame - 80, fps, config: { damping: 12, stiffness: 100 }, durationInFrames: 25 });

  return (
    <AbsoluteFill style={{
      background: `linear-gradient(135deg, ${C.primary} 0%, #0a3d1f 50%, #0d4a27 100%)`,
      fontFamily: "'Manrope',sans-serif",
      overflow: "hidden",
    }}>
      <GridBg />

      <div style={{
        position: "absolute",
        top: -200,
        left: -200,
        width: 600,
        height: 600,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(5,150,105,0.25) 0%, transparent 70%)",
        opacity: bgS,
      }} />
      <div style={{
        position: "absolute",
        bottom: -200,
        right: -200,
        width: 700,
        height: 700,
        borderRadius: "50%",
        background: "radial-gradient(circle, rgba(217,251,232,0.15) 0%, transparent 70%)",
        opacity: bgS,
      }} />

      <AbsoluteFill style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 0,
        padding: "60px",
      }}>
        <div style={{ transform: `scale(${logoS})`, marginBottom: 24 }}>
          <Logo size={88} />
        </div>

        <div style={{
          opacity: headOp,
          transform: `translateY(${headY}px)`,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(217,251,232,0.15)",
          border: "1px solid rgba(255,255,255,0.2)",
          borderRadius: 999,
          padding: "8px 20px",
          marginBottom: 20,
        }}>
          <span style={{ fontSize: 13, fontWeight: 900, letterSpacing: "0.22em", color: "rgba(255,255,255,0.9)", textTransform: "uppercase" }}>
            ✦ Finanzas claras para decisiones inteligentes
          </span>
        </div>

        <h1 style={{
          opacity: headOp,
          transform: `translateY(${headY}px)`,
          fontFamily: "'Sora',sans-serif",
          fontWeight: 900,
          fontSize: 68,
          color: "#ffffff",
          textAlign: "center",
          lineHeight: 1.05,
          letterSpacing: "-0.025em",
          margin: 0,
          marginBottom: 16,
          maxWidth: 860,
        }}>
          Cuentas Claras
        </h1>

        <p style={{
          opacity: subOp,
          fontFamily: "'Sora',sans-serif",
          fontSize: 28,
          color: "rgba(255,255,255,0.75)",
          textAlign: "center",
          margin: 0,
          marginBottom: 44,
          letterSpacing: "-0.01em",
        }}>
          Tu plata clara, tus decisiones seguras.
        </p>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
          marginBottom: 44,
          opacity: subOp,
        }}>
          {features.map((f, i) => (
            <div key={f.label} style={{
              background: "rgba(255,255,255,0.08)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 14,
              padding: "12px 18px",
              display: "flex",
              alignItems: "center",
              gap: 10,
              opacity: interpolate(frame, [40 + i * 8, 58 + i * 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              transform: `translateY(${interpolate(frame, [40 + i * 8, 58 + i * 8], [16, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
            }}>
              <span style={{ fontSize: 20 }}>{f.icon}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.9)" }}>{f.label}</span>
            </div>
          ))}
        </div>

        <div style={{
          opacity: urlOp,
          transform: `scale(${interpolate(urlS, [0, 1], [0.9, 1])})`,
          background: "rgba(255,255,255,0.12)",
          border: "2px solid rgba(255,255,255,0.3)",
          borderRadius: 20,
          padding: "20px 48px",
          textAlign: "center",
          backdropFilter: "blur(12px)",
        }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 800, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.2em", marginBottom: 8 }}>Accedé ahora</p>
          <p style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 900, color: "#ffffff", letterSpacing: "0.02em" }}>
            ing-web-ii-production.up.railway.app
          </p>
          <p style={{ margin: "10px 0 0", fontSize: 12, color: "rgba(255,255,255,0.6)" }}>
            Usuarios de prueba disponibles · Ingresá gratis hoy
          </p>
        </div>

        <div style={{
          marginTop: 28,
          display: "flex",
          gap: 14,
          opacity: interpolate(frame, [90, 110], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
        }}>
          <div style={{
            background: "#ffffff",
            color: C.primary,
            borderRadius: 14,
            padding: "14px 36px",
            fontFamily: "'Manrope',sans-serif",
            fontWeight: 900,
            fontSize: 16,
          }}>
            Crear cuenta gratis
          </div>
          <div style={{
            background: "transparent",
            color: "#fff",
            border: "1.5px solid rgba(255,255,255,0.4)",
            borderRadius: 14,
            padding: "14px 36px",
            fontFamily: "'Manrope',sans-serif",
            fontWeight: 700,
            fontSize: 16,
          }}>
            Ya tengo cuenta
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
