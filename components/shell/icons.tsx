import type { SVGProps } from "react";

export type IconProps = SVGProps<SVGSVGElement> & { filled?: boolean };

function Icon({ children, className = "size-6", ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {children}
    </svg>
  );
}

export function HomeIcon({ filled, ...props }: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M3.5 10.2 12 3.5l8.5 6.7V19a1.5 1.5 0 0 1-1.5 1.5h-4.25v-6h-5.5v6H5A1.5 1.5 0 0 1 3.5 19z"
        fill={filled ? "currentColor" : "none"}
      />
    </Icon>
  );
}

export function SearchIcon({ filled, ...props }: IconProps) {
  return (
    <Icon {...props} strokeWidth={filled ? 2.6 : 1.9}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m20 20-4.2-4.2" />
    </Icon>
  );
}

export function BookmarkIcon({ filled, ...props }: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M6.5 3.5h11A1.5 1.5 0 0 1 19 5v15.5l-7-4.5-7 4.5V5a1.5 1.5 0 0 1 1.5-1.5"
        fill={filled ? "currentColor" : "none"}
      />
    </Icon>
  );
}

export function SparkIcon({ filled, ...props }: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M12 3.5c.6 3.9 2.6 5.9 6.5 6.5-3.9.6-5.9 2.6-6.5 6.5-.6-3.9-2.6-5.9-6.5-6.5 3.9-.6 5.9-2.6 6.5-6.5"
        fill={filled ? "currentColor" : "none"}
      />
      <path d="M18.5 16.5v4M16.5 18.5h4" />
    </Icon>
  );
}

export function UserIcon({ filled, ...props }: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="8" r="4" fill={filled ? "currentColor" : "none"} />
      <path d="M4.5 20.5c.9-3.6 3.9-5.5 7.5-5.5s6.6 1.9 7.5 5.5" fill={filled ? "currentColor" : "none"} />
    </Icon>
  );
}

export function SunIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M4.6 4.6 6 6M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
    </Icon>
  );
}

export function MoonIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5" />
    </Icon>
  );
}

export function MonitorIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <rect x="3" y="4" width="18" height="12.5" rx="2" />
      <path d="M8.5 20.5h7M12 16.5v4" />
    </Icon>
  );
}

export function FeatherIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M20 4c-7 0-12 4-13.5 11.5L5 20" />
      <path d="M20 4c0 7-4 11.5-11 12" />
      <path d="M9 15.5 15 9.5" />
    </Icon>
  );
}

export function HeartIcon({ filled, ...props }: IconProps) {
  return (
    <Icon {...props}>
      <path
        d="M12 20s-7.5-4.6-8.9-9.6C2.2 7.1 4.4 4.5 7.4 4.5c1.9 0 3.6 1.1 4.6 2.8 1-1.7 2.7-2.8 4.6-2.8 3 0 5.2 2.6 4.3 5.9C19.5 15.4 12 20 12 20"
        fill={filled ? "currentColor" : "none"}
      />
    </Icon>
  );
}

export function ChatIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Icon {...props}>
      <path d="M20.5 11.5a8 8 0 0 1-11.9 7l-4.1 1.1 1.1-3.9a8 8 0 1 1 14.9-4.2" />
    </Icon>
  );
}
