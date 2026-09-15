export function ExplicitBadge({ explicit }: { explicit?: boolean }) {
  return explicit ? (
    <span
      className="explicit-badge"
      aria-label="Explicit lyrics"
      title="Explicit lyrics"
    >
      E
    </span>
  ) : null;
}
export default ExplicitBadge;
