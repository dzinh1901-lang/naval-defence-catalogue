interface NavalLogoProps {
  size?: number;
  className?: string;
}

export function NavalLogo({ size = 24, className = '' }: NavalLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-label="Naval DTP"
    >
      {/* Hexagonal frame */}
      <polygon
        points="12,2 21,7 21,17 12,22 3,17 3,7"
        fill="none"
        stroke="#3b82f6"
        strokeWidth="1.5"
      />
      {/* Inner crosshair / twin symbol */}
      <line x1="12" y1="6" x2="12" y2="18" stroke="#06b6d4" strokeWidth="1" />
      <line x1="6" y1="12" x2="18" y2="12" stroke="#06b6d4" strokeWidth="1" />
      <circle cx="12" cy="12" r="2" fill="#3b82f6" />
    </svg>
  );
}
