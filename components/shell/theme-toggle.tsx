"use client";

import { useSyncExternalStore } from "react";
import { THEME_STORAGE_KEY } from "@/lib/constants";
import { MonitorIcon, MoonIcon, SunIcon } from "./icons";

type ThemeChoice = "system" | "light" | "dark";

const listeners = new Set<() => void>();

function readTheme(): ThemeChoice {
  const value = document.documentElement.dataset.theme;
  return value === "light" || value === "dark" ? value : "system";
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function applyTheme(choice: ThemeChoice) {
  const root = document.documentElement;
  if (choice === "system") delete root.dataset.theme;
  else root.dataset.theme = choice;
  try {
    if (choice === "system") localStorage.removeItem(THEME_STORAGE_KEY);
    else localStorage.setItem(THEME_STORAGE_KEY, choice);
  } catch {
    // Storage can be unavailable (private mode); the choice still applies.
  }
  listeners.forEach((listener) => listener());
}

const order: ThemeChoice[] = ["system", "light", "dark"];
const labels: Record<ThemeChoice, string> = {
  system: "System theme",
  light: "Light theme",
  dark: "Dark theme",
};

export function ThemeToggle({ showLabel = false }: { showLabel?: boolean }) {
  const theme = useSyncExternalStore(subscribe, readTheme, () => "system" as const);
  const next = order[(order.indexOf(theme) + 1) % order.length];
  const IconFor = theme === "light" ? SunIcon : theme === "dark" ? MoonIcon : MonitorIcon;

  return (
    <button
      type="button"
      onClick={() => applyTheme(next)}
      aria-label={`${labels[theme]}. Switch to ${labels[next].toLowerCase()}.`}
      title={labels[theme]}
      className="inline-flex h-11 min-w-11 items-center justify-center gap-3 rounded-full px-3 text-muted transition-colors duration-150 hover:bg-surface-2 hover:text-ink"
    >
      <IconFor className="size-5" />
      {showLabel ? <span className="hidden text-sm lg:inline">{labels[theme]}</span> : null}
    </button>
  );
}
