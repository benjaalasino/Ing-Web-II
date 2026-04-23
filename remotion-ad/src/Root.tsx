import { Composition } from "remotion";
import { CuentasClarasAd } from "./CuentasClarasAd";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 9:16 vertical — Instagram Reels / TikTok / YouTube Shorts */}
      <Composition
        id="CuentasClarasAd"
        component={CuentasClarasAd}
        durationInFrames={900}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
      {/* 9:16 compact */}
      <Composition
        id="CuentasClarasAdShort"
        component={CuentasClarasAd}
        durationInFrames={540}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{}}
      />
    </>
  );
};
