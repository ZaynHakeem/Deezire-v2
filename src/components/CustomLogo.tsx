export function CustomLogo({
  size = 32,
  animate = false,
}: {
  size?: number;
  animate?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden="true"
      className={`custom-logo ${animate ? "logo-moving" : ""}`}
    >
      <path
        d="M8 8h11.5C28 8 33 12.7 33 20S28 32 19.5 32H8V8Z"
        stroke="currentColor"
        strokeWidth="5"
      />
      <path
        d="M16 15v10M23 12v16M30 16v8"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
export default CustomLogo;
