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

const FakeTicket: React.FC<{ delay: number; frame: number; fps: number }> = ({ delay, frame, fps }) => {
  const s = spring({ frame: frame - delay, fps, config: { damping: 12, stiffness: 80 }, durationInFrames: 35 });
  const op = interpolate(frame, [delay, delay + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <div style={{
      background: "#fff",
      border: `1.5px solid ${C.line}`,
      borderRadius: 16,
      padding: "20px",
      boxShadow: "0 8px 24px rgba(20,35,21,0.08)",
      opacity: op,
      transform: `scale(${interpolate(s, [0, 1], [0.85, 1])}) rotate(${interpolate(s, [0, 1], [-3, 0])}deg)`,
      maxWidth: 280,
    }}>
      <div style={{ borderBottom: `1px dashed ${C.line}`, paddingBottom: 12, marginBottom: 12 }}>
        <p style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontSize: 13, fontWeight: 900, color: C.ink }}>Supermercado Día</p>
        <p style={{ margin: "2px 0 0", fontSize: 10, color: C.muted }}>12/04/2026 · 14:32 hs</p>
      </div>
      {[
        { item: "Lácteos", price: "$1.840" },
        { item: "Verduras frescas", price: "$2.150" },
        { item: "Pan integral", price: "$980" },
        { item: "Bebidas", price: "$3.200" },
      ].map((row) => (
        <div key={row.item} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
          <span style={{ fontSize: 11, color: C.muted }}>{row.item}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.ink }}>{row.price}</span>
        </div>
      ))}
      <div style={{ borderTop: `1px dashed ${C.line}`, marginTop: 10, paddingTop: 10, display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, fontWeight: 800, color: C.ink }}>TOTAL</span>
        <span style={{ fontSize: 14, fontWeight: 900, color: C.primary }}>$8.170</span>
      </div>
    </div>
  );
};

export const UploadTicket: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const headerOp = interpolate(frame, [0, 25], [0, 1], { extrapolateRight: "clamp" });
  const headerY = interpolate(frame, [0, 25], [-20, 0], { extrapolateRight: "clamp" });

  const dropzoneS = spring({ frame, fps, config: { damping: 14, stiffness: 90 }, durationInFrames: 40 });
  const dropzoneOp = interpolate(frame, [10, 35], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const uploadProgress = interpolate(frame, [50, 90], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const uploadDone = frame > 85;

  const recentOp = interpolate(frame, [55, 75], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const recentTickets = [
    { store: "Farmacity", amount: "$3.450", cat: "Salud", date: "Hoy", icon: "💊" },
    { store: "Shell YPF", amount: "$18.500", cat: "Transporte", date: "Ayer", icon: "⛽" },
    { store: "Netflix", amount: "$2.800", cat: "Ocio", date: "20 Abr", icon: "🎬" },
    { store: "La Segunda", amount: "$12.000", cat: "Seguros", date: "18 Abr", icon: "🛡️" },
  ];

  return (
    <AbsoluteFill style={{ background: C.bg, fontFamily: "'Manrope',sans-serif", overflow: "hidden" }}>
      <GridBg />

      <div style={{ position: "absolute", inset: 0, padding: "36px 80px", display: "flex", flexDirection: "column" }}>
        <div style={{
          opacity: headerOp,
          transform: `translateY(${headerY}px)`,
          marginBottom: 24,
        }}>
          <p style={{ margin: 0, fontSize: 11, fontWeight: 900, color: C.accent, textTransform: "uppercase", letterSpacing: "0.22em", marginBottom: 4 }}>REGISTRO DE GASTOS</p>
          <h2 style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontSize: 38, fontWeight: 900, color: C.ink }}>Subir Ticket</h2>
          <p style={{ margin: "6px 0 0", fontSize: 14, color: C.muted }}>Imagen o PDF · categorización automática</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, flex: 1 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{
              opacity: dropzoneOp,
              transform: `scale(${interpolate(dropzoneS, [0, 1], [0.92, 1])})`,
              background: uploadDone ? `${C.accentSoft}` : C.surface,
              border: `2px dashed ${uploadDone ? C.accent : C.line}`,
              borderRadius: 20,
              padding: "36px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              textAlign: "center",
              boxShadow: uploadDone ? `0 8px 32px ${C.accent}20` : "0 8px 24px rgba(20,35,21,0.06)",
              transition: "all 0.3s",
            }}>
              {uploadDone ? (
                <>
                  <div style={{ fontSize: 52, lineHeight: 1 }}>✅</div>
                  <p style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontSize: 18, fontWeight: 900, color: C.accent }}>¡Ticket procesado!</p>
                  <p style={{ margin: 0, fontSize: 13, color: C.muted }}>Categorizado como <strong style={{ color: C.primary }}>Alimentos</strong></p>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 48, lineHeight: 1 }}>📄</div>
                  <p style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontSize: 17, fontWeight: 800, color: C.ink }}>Arrastrá tu ticket aquí</p>
                  <p style={{ margin: 0, fontSize: 13, color: C.muted }}>JPG, PNG o PDF · máx. 10 MB</p>
                  <div style={{
                    background: C.primary,
                    color: "#fff",
                    borderRadius: 12,
                    padding: "10px 24px",
                    fontWeight: 800,
                    fontSize: 13,
                    marginTop: 4,
                  }}>
                    Seleccionar archivo
                  </div>
                </>
              )}
            </div>

            {frame > 45 && !uploadDone && (
              <div style={{
                background: C.surface,
                border: `1.5px solid ${C.line}`,
                borderRadius: 14,
                padding: "16px 20px",
                opacity: interpolate(frame, [45, 60], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: C.ink }}>ticket_supermercado.jpg</span>
                  <span style={{ fontSize: 12, color: C.accent, fontWeight: 800 }}>{Math.round(uploadProgress)}%</span>
                </div>
                <div style={{ height: 6, background: C.line, borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${uploadProgress}%`, background: C.accent, borderRadius: 99 }} />
                </div>
                <p style={{ margin: "8px 0 0", fontSize: 11, color: C.muted }}>Subiendo y procesando...</p>
              </div>
            )}

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
              opacity: interpolate(frame, [60, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            }}>
              {[
                { label: "Categoría detectada", value: "🛒 Alimentos", color: C.primary },
                { label: "Monto extraído", value: "$8.170", color: C.ink },
              ].map((item) => (
                <div key={item.label} style={{
                  background: C.surface,
                  border: `1.5px solid ${C.line}`,
                  borderRadius: 12,
                  padding: "12px 16px",
                  boxShadow: "0 4px 12px rgba(20,35,21,0.05)",
                }}>
                  <p style={{ margin: 0, fontSize: 10, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em" }}>{item.label}</p>
                  <p style={{ margin: "6px 0 0", fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 900, color: item.color }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, opacity: recentOp }}>
              <h3 style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontSize: 16, fontWeight: 800, color: C.ink }}>Tickets recientes</h3>
              <span style={{ fontSize: 12, color: C.accent, fontWeight: 700 }}>Ver todos →</span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, opacity: recentOp }}>
              {recentTickets.map((t, i) => (
                <div key={t.store} style={{
                  background: C.surface,
                  border: `1.5px solid ${C.line}`,
                  borderRadius: 14,
                  padding: "14px 18px",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  boxShadow: "0 4px 14px rgba(20,35,21,0.06)",
                  opacity: interpolate(frame, [55 + i * 8, 75 + i * 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                  transform: `translateX(${interpolate(frame, [55 + i * 8, 75 + i * 8], [30, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}px)`,
                }}>
                  <div style={{ fontSize: 24, width: 42, height: 42, background: C.accentSoft, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {t.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: C.ink }}>{t.store}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: C.muted }}>{t.cat} · {t.date}</p>
                  </div>
                  <p style={{ margin: 0, fontFamily: "'Sora',sans-serif", fontSize: 15, fontWeight: 900, color: C.ink }}>{t.amount}</p>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 18, opacity: recentOp }}>
              <FakeTicket delay={60} frame={frame} fps={fps} />
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
        opacity: interpolate(frame, [10, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
      }}>
        Tickets
      </div>
    </AbsoluteFill>
  );
};
