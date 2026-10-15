const PALETTE = [
  "bg-sky-100 text-sky-700",
  "bg-violet-100 text-violet-700",
  "bg-emerald-100 text-emerald-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-teal-100 text-teal-700",
  "bg-indigo-100 text-indigo-700",
];

function hash(value: string) {
  let h = 0;
  for (let i = 0; i < value.length; i++) {
    h = (h * 31 + value.charCodeAt(i)) >>> 0;
  }
  return h;
}

interface Props {
  firstName?: string | null;
  lastName?: string | null;
  username: string;
  size?: "sm" | "md" | "lg";
}

export function UserAvatar({
  firstName,
  lastName,
  username,
  size = "md",
}: Props) {
  const initials =
    `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase() ||
    username.slice(0, 2).toUpperCase();

  const sizes = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-14 w-14 text-lg",
  };

  return (
    <span
      aria-hidden="true"
      className={[
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold",
        sizes[size],
        PALETTE[hash(username) % PALETTE.length],
      ].join(" ")}
    >
      {initials}
    </span>
  );
}