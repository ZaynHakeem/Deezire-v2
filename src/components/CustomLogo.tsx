import { CSSProperties } from "react";

export function CustomLogo({
  size = 32,
  animate = false,
  tone = "dark",
}: {
  size?: number;
  animate?: boolean;
  tone?: "dark" | "light";
}) {
  return (
    <img
      src={tone === "light" ? "/brand/mark-light.png" : "/brand/mark-dark.png"}
      alt=""
      aria-hidden="true"
      style={{ "--logo-size": `${size}px` } as CSSProperties}
      className={`custom-logo ${animate ? "logo-moving" : ""}`}
    />
  );
}
export default CustomLogo;
