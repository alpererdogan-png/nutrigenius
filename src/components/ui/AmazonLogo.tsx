/**
 * Amazon wordmark with the "smile" arrow — inline SVG so we never hotlink
 * Amazon assets. Used across results and blog affiliate cards.
 */
export function AmazonLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 60 18"
      aria-label="Amazon"
      className={className}
      fill="currentColor"
    >
      <text x="0" y="14" fontSize="14" fontFamily="Arial, sans-serif" fontWeight="bold" fill="#FF9900">
        amazon
      </text>
      <path
        d="M3 16 Q17 21 37 16"
        stroke="#FF9900"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M35 14 L38 17 L35 17"
        stroke="#FF9900"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
