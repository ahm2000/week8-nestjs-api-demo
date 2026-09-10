import {
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
  useEffect,
} from 'react';

type Cn = (string | false | null | undefined)[];
export const cn = (...classes: Cn): string => classes.filter(Boolean).join(' ');

/* ---------- Button ---------- */

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

const buttonStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700 shadow-sm shadow-indigo-600/20',
  secondary:
    'bg-white text-zinc-700 ring-1 ring-inset ring-zinc-300 hover:bg-zinc-50 active:bg-zinc-100',
  ghost: 'bg-transparent text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
  danger: 'bg-rose-600 text-white hover:bg-rose-500 active:bg-rose-700 shadow-sm shadow-rose-600/20',
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
  size?: 'sm' | 'md';
}

export function Button({
  variant = 'primary',
  loading = false,
  size = 'md',
  className,
  children,
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500',
        size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-3.5 py-2 text-sm',
        buttonStyles[variant],
        className,
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Spinner className="size-3.5" />}
      {children}
    </button>
  );
}

/* ---------- Spinner ---------- */

export function Spinner({ className }: { className?: string }) {
  return (
    <svg className={cn('animate-spin', className)} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4z"
      />
    </svg>
  );
}

/* ---------- Card ---------- */

export function Card({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        'rounded-2xl bg-white ring-1 ring-zinc-200/80 shadow-sm shadow-zinc-900/[0.03]',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-zinc-100 px-5 py-4">
      <div>
        <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-zinc-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

/* ---------- Badge ---------- */

type BadgeTone = 'zinc' | 'indigo' | 'amber' | 'emerald' | 'rose' | 'sky';

const badgeTones: Record<BadgeTone, string> = {
  zinc: 'bg-zinc-100 text-zinc-600 ring-zinc-200',
  indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-200',
  amber: 'bg-amber-50 text-amber-700 ring-amber-200',
  emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  rose: 'bg-rose-50 text-rose-700 ring-rose-200',
  sky: 'bg-sky-50 text-sky-700 ring-sky-200',
};

export function Badge({
  tone = 'zinc',
  children,
  className,
}: {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium ring-1 ring-inset',
        badgeTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

export function statusTone(status: string): BadgeTone {
  if (status === 'done') return 'emerald';
  if (status === 'in_progress') return 'amber';
  return 'zinc';
}

/* ---------- Form fields ---------- */

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between text-xs font-medium text-zinc-600">
        {label}
        {hint && !error && <span className="font-normal text-zinc-400">{hint}</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs font-medium text-rose-600">{error}</span>}
    </label>
  );
}

const inputBase =
  'w-full rounded-lg border-0 bg-zinc-50 px-3 py-2 text-sm text-zinc-900 ring-1 ring-inset ring-zinc-200 placeholder:text-zinc-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition';

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputBase, props.className)} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(inputBase, 'min-h-[72px] resize-y', props.className)} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={cn(inputBase, 'appearance-none pr-8', props.className)}>
      {props.children}
    </select>
  );
}

/* ---------- Empty state ---------- */

export function EmptyState({ icon, title, hint }: { icon?: ReactNode; title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 px-6 py-12 text-center">
      {icon && <div className="mb-1 text-zinc-300">{icon}</div>}
      <p className="text-sm font-medium text-zinc-500">{title}</p>
      {hint && <p className="max-w-xs text-xs text-zinc-400">{hint}</p>}
    </div>
  );
}

/* ---------- Modal ---------- */

export function Modal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-zinc-900/40 p-4 backdrop-blur-sm sm:p-8">
      <div
        className="mt-4 w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-zinc-200 sm:mt-12"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-3.5">
          <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
            aria-label="Close"
          >
            <svg className="size-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
            </svg>
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-zinc-100 px-5 py-3.5">{footer}</div>
        )}
      </div>
    </div>
  );
}

/* ---------- Status dot ---------- */

export function StatusDot({ state }: { state: 'online' | 'offline' | 'checking' }) {
  const color =
    state === 'online' ? 'bg-emerald-500' : state === 'offline' ? 'bg-rose-500' : 'bg-amber-400';
  return (
    <span className="relative flex size-2">
      {state === 'online' && (
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
      )}
      <span className={cn('relative inline-flex size-2 rounded-full', color)} />
    </span>
  );
}

/* ---------- JSON block ---------- */

export function JsonBlock({ value, className }: { value: unknown; className?: string }) {
  return (
    <pre
      className={cn(
        'overflow-x-auto rounded-lg bg-zinc-950 p-3 font-mono text-[12px] leading-relaxed text-zinc-100',
        className,
      )}
    >
      {syntaxHighlight(value)}
    </pre>
  );
}

function syntaxHighlight(value: unknown): ReactNode {
  const json = JSON.stringify(value, null, 2);
  if (json === undefined) return <span className="text-zinc-500">(no body)</span>;
  const tokens = json.split(/("(?:\\.|[^"\\])*"(?:\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d+)?)/g);
  return tokens.map((tok, i) => {
    if (!tok) return null;
    let cls = 'text-zinc-100';
    if (/^"/.test(tok)) {
      cls = /:$/.test(tok) ? 'text-sky-300' : 'text-emerald-300';
    } else if (/true|false|null/.test(tok)) {
      cls = 'text-violet-300';
    } else if (/^-?\d/.test(tok)) {
      cls = 'text-amber-300';
    }
    return (
      <span key={i} className={cls}>
        {tok}
      </span>
    );
  });
}
