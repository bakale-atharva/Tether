/* eslint-disable @next/next/no-img-element -- avatar hosts are user-provided */

const sizes = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-20 text-2xl",
  profile: "size-24 text-3xl sm:size-28",
} as const;

export function Avatar({
  name,
  src,
  size = "md",
}: {
  name: string;
  src?: string | null;
  size?: keyof typeof sizes;
}) {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "?";

  if (src) {
    return (
      <img
        src={src}
        alt=""
        className={`${sizes[size]} shrink-0 rounded-full border border-line object-cover bg-surface-2`}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className={`${sizes[size]} inline-flex shrink-0 items-center justify-center rounded-full bg-accent-soft font-semibold text-accent-text`}
    >
      {initials}
    </span>
  );
}
