import type { InputHTMLAttributes, ReactNode } from "react";

type FieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string | null;
  prefix?: string;
};

export function Field({ id, label, hint, error, prefix, className = "", ...props }: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [errorId, hintId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
      </label>
      <div
        className={`flex h-12 items-center rounded-xl border bg-surface transition-colors duration-150 focus-within:border-ring focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring has-disabled:bg-surface-2 ${
          error ? "border-danger" : "border-line-strong"
        }`}
      >
        {prefix ? (
          <span aria-hidden="true" className="pl-3.5 text-muted">
            {prefix}
          </span>
        ) : null}
        <input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`h-full w-full min-w-0 rounded-xl bg-transparent text-base text-ink outline-none placeholder:text-muted focus-visible:outline-none disabled:cursor-not-allowed disabled:text-muted ${
            prefix ? "pl-1 pr-3.5" : "px-3.5"
          }`}
          {...props}
        />
      </div>
      {error ? (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      ) : null}
      {hint ? (
        <div id={hintId} className="text-sm text-muted">
          {hint}
        </div>
      ) : null}
    </div>
  );
}
