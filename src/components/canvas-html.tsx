import { Html } from "@react-three/drei";
import { HtmlProps } from "@react-three/drei/web/Html";
import { GlobalProviders } from "./global-providers";

export function CanvasHtml(props: HtmlProps) {
  return (
    <Html {...props}>
      <GlobalProviders>{props.children}</GlobalProviders>
    </Html>
  );
}
