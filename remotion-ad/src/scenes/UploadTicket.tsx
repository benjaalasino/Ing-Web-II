import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const C = {
  bg: "#f5f8fc", primary: "#166534", accent: "#059669", accentSoft: "#d9fbe8",
  ink: "#142315", muted: "#4a5f4d", line: "#d7e6da", surface: "#ffffff", surfaceSoft: "#eef7f0",
};

const GridBg: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(to right, rgba(22,101,52,0.05) 1px, transparent 1px),linear-gradient(to bottom, rgba(22,101,52,0.05) 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
);

const FakeTicket: React.FC<{ delay: number; frame: number; fps: number }> = ({ delay, frame, fps }) => {
  const s = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 80 }, durationInFrames: 35 });
  const op = interpolate(frame, [delay, delay + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <div style={{ background: "#fff", border: `1.5px solid ${C.line}`, borderRadius: 20, padding: "24px", boxShadow: "0 8px 28px rgba(20,35,21,0.09)", opacity: op, transform: `scale(${interpolate(s, [0, 1], [0.85, 1])}) rotate(${interpolate(s, [0, 1], [-2, 0])}deg)`, maxWidth: 400 }}>
      <div style={{ borderBottom: `1px dashed ${C.line}`, paddingBottom: 14, marginBottom: 14 }}>
        <p style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 900, color: C.ink }}>Supermercado Día</p>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: C.muted }}>12/04/2026 · 14:32 hs</p>
      </div>
      {[["Lácteos", "$1.840"], ["Verduras frescas", "$2.150"], ["Pan integral", "$980"], ["Bebidas", "$3.200"]].map(([item, price]) => (
        <div key={item} style={{ display: "flex", justifyContent: "space-between", padding: "5px 0" }}>
          <span style={{ fontSize: 15, color: C.muted }}>{item}</span>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.ink }}>{price}</span>
        </div>
      ))}
      <div style={{ borderTop: `1px dashed ${C.line}`, marginTop: 12, paddingTop: 12, display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 16, fontWeight: 800, color: C.ink }}>TOTAL</span>
        <span style={{ fontSize: 20, fontWeight: 900, color: C.primary }}>$8.170</span>
      </div>
    </div>
  );
};

const recentTickets = [
  { store: "Farmacity", amount: "$3.450", cat: "Salud", date: "Hoy", icon: "💊" },
  { store: "Shell YPF", amount: "$18.500", cat: "Transporte", date: "Ayer", icon: "⛽" },
  { store: "Netflix", amount: "$2.800", cat: "Ocio", date: "20 Abr", icon: "🎬" },
];

export const UploadTicket: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOp = interpolate(frame, [0, 22], [0, 1], { extrapolateRight: "clamp" });
  const headerY = interpolate(frame, [0, 22], [-20, 0], { extrapolateRight: "clamp" });
  const dropS = spring({ frame, fps, config: { damping: 14, stiffness: 90 }, durationInFrames: 38 });
  const uploadProgress = interpolate(frame, [48, 88], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const uploadDone = frame > 84;
  const recentOp = interpolate(frame, [55, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: "'Manrope',sans-serif", overflow: "hidden" }}>
      <GridBg />
      <div style={{ position: "absolute", inset: 0, padding: "60px 56px", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ opacity: headerOp, transform: `translateY(${headerY}px)`, marginBottom: 28 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 900, color: C.accent, textTransform: "uppercase", letterSpacing: "0.22em", marginBottom: 6 }}>REGISTRO DE GASTOS</p>
          <h2 style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontSize: 50, fontWeight: 900, color: C.ink }}>Subir Ticket</h2>
          <p style={{ margin: "8px 0 0", fontSize: 17, color: C.muted }}>Imagen o PDF · categorización automática</p>
        </div>

        {/* Dropzone */}
        <div style={{ background: uploadDone ? C.accentSoft : C.surface, border: `2.5px dashed ${uploadDone ? C.accent : C.line}`, borderRadius: 28, padding: "40px 32px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", boxShadow: uploadDone ? `0 8px 32px ${C.accent}22` : "0 6px 22px rgba(20,35,21,0.06)", opacity: interpolate(frame, [8, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), transform: `scale(${interpolate(dropS, [0, 1], [0.92, 1])})`, marginBottom: 22 }}>
          {uploadDone ? (
            <>
              <div style={{ fontSize: 64, lineHeight: 1, marginBottom: 14 }}>✅</div>
              <p style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontSize: 26, fontWeight: 900, color: C.accent }}>¡Ticket procesado!</p>
              <p style={{ margin: "8px 0 0", fontSize: 17, color: C.muted }}>Categorizado como <strong style={{ color: C.primary }}>Alimentos</strong></p>
            </>
          ) : (
            <>
              <div style={{ fontSize: 60, lineHeight: 1, marginBottom: 16 }}>📄</div>
              <p style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontSize: 24, fontWeight: 800, color: C.ink }}>Arrastrá tu ticket aquí</p>
              <p style={{ margin: "8px 0 16px", fontSize: 16, color: C.muted }}>JPG, PNG o PDF · máx. 10 MB</p>
              <div style={{ background: C.primary, color: "#fff", borderRadius: 16, padding: "14px 32px", fontWeight: 900, fontSize: 16 }}>Seleccionar archivo</div>
            </>
          )}
        </div>

        {/* Upload progress */}
        {frame > 44 && !uploadDone && (
          <div style={{ background: C.surface, border: `1.5px solid ${C.line}`, borderRadius: 18, padding: "20px 24px", marginBottom: 22, opacity: interpolate(frame, [44, 58], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: C.ink }}>ticket_supermercado.jpg</span>
              <span style={{ fontSize: 16, color: C.accent, fontWeight: 900 }}>{Math.round(uploadProgress)}%</span>
            </div>
            <div style={{ height: 8, background: C.line, borderRadius: 99, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${uploadProgress}%`, background: C.accent, borderRadius: 99 }} />
            </div>
            <p style={{ margin: "8px 0 0", fontSize: 13, color: C.muted }}>Subiendo y procesando...</p>
          </div>
        )}

        {/* Extracted info */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 26, opacity: interpolate(frame, [60, 78], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
          {[{ label: "Categoría detectada", value: "🛒 Alimentos", color: C.primary }, { label: "Monto extraído", value: "$8.170", color: C.ink }].map(item => (
            <div key={item.label} style={{ background: C.surface, border: `1.5px solid ${C.line}`, borderRadius: 18, padding: "16px 20px", boxShadow: "0 4px 12px rgba(20,35,21,0.05)" }}>
              <p style={{ margin: 0, fontSize: 12, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em" }}>{item.label}</p>
              <p style={{ margin: "8px 0 0", fontFamily: "'Sora',sans-serif", fontSize: 22, fontWeight: 900, color: item.color }}>{item.value}</p>
            </div>
          ))}
        </div>

        {/* Recent tickets */}
        <div style={{ opacity: recentOp }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontSize: 20, fontWeight: 800, color: C.ink }}>Tickets recientes</h3>
            <span style={{ fontSize: 15, color: C.accent, fontWeight: 700 }}>Ver todos →</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {recentTickets.map((t, i) => (
              <div key={t.store} style={{ background: C.surface, border: `1.5px solid ${C.line}`, borderRadius: 18, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, boxShadow: "0 4px 14px rgba(20,35,21,0.05)", opacity: interpolate(frame, [58 + i * 8, 76 + i * 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), transform: `translateX(${interpolate(frame, [58 + i * 8, 76 + i * 8], [28, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)` }}>
                <div style={{ fontSize: 26, width: 52, height: 52, background: C.accentSoft, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>{t.icon}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 17, fontWeight: 800, color: C.ink }}>{t.store}</p>
                  <p style={{ margin: "3px 0 0", fontSize: 13, color: C.muted }}>{t.cat} · {t.date}</p>
                </div>
                <p style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 900, color: C.ink }}>{t.amount}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Fake ticket */}
        <div style={{ marginTop: 24 }}>
          <FakeTicket delay={62} frame={frame} fps={fps} />
        </div>
      </div>

      <div style={{ position: "absolute", top: 22, right: 28, background: C.primary, color: "#fff", borderRadius: 12, padding: "8px 18px", fontSize: 13, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", opacity: interpolate(frame, [10, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
        Tickets
      </div>
    </AbsoluteFill>
  );
};
