import { Composition } from "remotion";
import { CuentasClarasAd } from "./CuentasClarasAd";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="CuentasClarasAd"
        component={CuentasClarasAd}
        durationInFrames={900}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{}}
      />
      <Composition
        id="CuentasClarasAdShort"
        component={CuentasClarasAd}
        durationInFrames={540}
        fps={30}
        width={1280}
        height={720}
        defaultProps={{}}
      />
    </>
  );
};
