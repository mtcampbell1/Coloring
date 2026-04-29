import { type ButtonHTMLAttributes, type HTMLAttributes, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cx } from "../../lib/cx";

// eslint-disable-next-line react-refresh/only-export-components
export { cx };

// ──────────────────────────────────────────────────────────────
// Button
// ──────────────────────────────────────────────────────────────
type ButtonVariant = "primary" | "secondary" | "ghost" | "soft" | "danger" | "outline";
interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: ReactNode;
}
export function Button({
  variant = "primary",
  size = "md",
  className,
  loading,
  icon,
  children,
  disabled,
  ...rest
}: BtnProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-lilac-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap";
  const sizes: Record<string, string> = {
    sm: "h-8 px-3 text-xs",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-5 text-sm",
  };
  const variants: Record<ButtonVariant, string> = {
    primary:
      "bg-ink text-white hover:bg-zinc-800 shadow-soft",
    secondary:
      "bg-peach-100 text-ink hover:bg-peach-200",
    soft: "bg-white text-ink ring-1 ring-zinc-200 hover:bg-zinc-50 shadow-soft",
    outline: "bg-transparent ring-1 ring-zinc-300 text-ink hover:bg-zinc-50",
    ghost: "bg-transparent text-ink hover:bg-zinc-100",
    danger:
      "bg-red-50 text-red-700 ring-1 ring-red-200 hover:bg-red-100",
  };
  return (
    <button
      className={cx(base, sizes[size], variants[variant], className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <span className="h-3 w-3 rounded-full border-2 border-current border-r-transparent animate-spin" />
      ) : icon ? (
        icon
      ) : null}
      {children}
    </button>
  );
}

// ──────────────────────────────────────────────────────────────
// Card
// ──────────────────────────────────────────────────────────────
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  pad?: boolean;
  tone?: "default" | "warm" | "cool" | "soft";
}
export function Card({ pad = true, tone = "default", className, ...rest }: CardProps) {
  const tones: Record<string, string> = {
    default: "bg-white",
    warm: "bg-peach-50",
    cool: "bg-sky-50",
    soft: "bg-zinc-50",
  };
  return (
    <div
      className={cx(
        "rounded-xl2 border border-zinc-200 shadow-soft",
        tones[tone],
        pad ? "p-5" : "",
        className,
      )}
      {...rest}
    />
  );
}

// ──────────────────────────────────────────────────────────────
// Input / Textarea / Select
// ──────────────────────────────────────────────────────────────
const fieldBase =
  "w-full rounded-xl bg-white border border-zinc-200 px-3.5 py-2.5 text-sm text-ink placeholder-zinc-400 focus:outline-none focus:border-lilac-400 focus:ring-2 focus:ring-lilac-200/70 transition";

interface FieldProps {
  label?: string;
  hint?: string;
  required?: boolean;
}
export function Field({
  label,
  hint,
  required,
  children,
}: FieldProps & { children: ReactNode }) {
  return (
    <label className="block">
      {label && (
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            {label}
            {required && <span className="text-red-500"> *</span>}
          </span>
        </div>
      )}
      {children}
      {hint && <div className="mt-1 text-xs text-zinc-500">{hint}</div>}
    </label>
  );
}

export function Input({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cx(fieldBase, className)} {...rest} />;
}

export function Textarea({ className, rows = 4, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={rows} className={cx(fieldBase, "leading-6", className)} {...rest} />;
}

export function Select({ className, children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cx(fieldBase, "pr-9 appearance-none bg-[url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'><path d='M5 8l5 5 5-5' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/></svg>\")] bg-[length:18px] bg-no-repeat bg-[right_10px_center]", className)} {...rest}>
      {children}
    </select>
  );
}

// ──────────────────────────────────────────────────────────────
// Badge / Pill / SegmentedControl / Toggle
// ──────────────────────────────────────────────────────────────
export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: ReactNode;
  tone?: "neutral" | "mint" | "peach" | "sky" | "lilac" | "red";
  className?: string;
}) {
  const tones: Record<string, string> = {
    neutral: "bg-zinc-100 text-zinc-700",
    mint: "bg-mint-100 text-mint-500",
    peach: "bg-peach-100 text-peach-500",
    sky: "bg-sky-100 text-sky-500",
    lilac: "bg-lilac-100 text-lilac-500",
    red: "bg-red-100 text-red-700",
  };
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  hint,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  hint?: string;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-3 rounded-xl2 bg-white p-3 ring-1 ring-zinc-200">
      <span className="block">
        <span className="block text-sm font-medium text-ink">{label}</span>
        {hint && <span className="block text-xs text-zinc-500">{hint}</span>}
      </span>
      <span className="relative mt-1 inline-flex h-6 w-11 shrink-0 items-center rounded-full bg-zinc-200 transition data-[on=true]:bg-mint-400" data-on={checked}>
        <input
          type="checkbox"
          className="absolute inset-0 opacity-0"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span
          className="inline-block h-5 w-5 transform rounded-full bg-white shadow transition translate-x-0.5 data-[on=true]:translate-x-5"
          data-on={checked}
        />
      </span>
    </label>
  );
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: Array<{ value: T; label: string }>;
}) {
  return (
    <div className="inline-flex gap-1 rounded-full bg-zinc-100 p-1">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cx(
            "rounded-full px-3 py-1.5 text-xs font-medium transition",
            value === opt.value
              ? "bg-white text-ink shadow-soft"
              : "text-zinc-600 hover:text-ink",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Section header / Empty state
// ──────────────────────────────────────────────────────────────
export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow && (
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-lilac-500">
            {eyebrow}
          </div>
        )}
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
          {title}
        </h1>
        {subtitle && <p className="mt-1.5 max-w-2xl text-sm text-zinc-600">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({
  title,
  hint,
  action,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <Card tone="soft" className="flex flex-col items-center justify-center gap-3 py-10 text-center">
      <div className="text-4xl">🎨</div>
      <div className="font-display text-lg font-medium text-ink">{title}</div>
      {hint && <div className="max-w-sm text-sm text-zinc-600">{hint}</div>}
      {action}
    </Card>
  );
}

// ──────────────────────────────────────────────────────────────
// DevNote — visible developer/integration note, used to mark where
// real backend wires would attach in a production build.
// ──────────────────────────────────────────────────────────────
export function DevNote({ children, title = "Backend integration note" }: { children: ReactNode; title?: string }) {
  return (
    <div className="rounded-xl2 border border-dashed border-lilac-300 bg-lilac-50/60 p-3 text-[12px] text-lilac-500">
      <div className="mb-1 flex items-center gap-1.5 font-semibold uppercase tracking-wider">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-lilac-400" />
        {title}
      </div>
      <div className="text-zinc-700">{children}</div>
    </div>
  );
}

export function ProgressBar({ value, max = 100, tone = "mint" }: { value: number; max?: number; tone?: "mint" | "peach" | "sky" | "lilac" }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const tones: Record<string, string> = {
    mint: "bg-mint-400",
    peach: "bg-peach-400",
    sky: "bg-sky-400",
    lilac: "bg-lilac-400",
  };
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100">
      <div className={cx("h-full rounded-full transition-all", tones[tone])} style={{ width: `${pct}%` }} />
    </div>
  );
}
