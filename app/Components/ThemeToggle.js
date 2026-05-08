"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";

const OPTIONS = [
  { value: "light",  label: "Light theme",  icon: Sun     },
  { value: "dark",   label: "Dark theme",   icon: Moon    },
  { value: "system", label: "System theme", icon: Monitor },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Pre-mount: render an inert placeholder of identical size to avoid layout
  // shift and hydration flash.
  if (!mounted) {
    return (
      <div
        aria-hidden
        className="inline-flex items-center h-9 w-[108px] rounded-full bg-surface-hover border border-line"
      />
    );
  }

  const activeIndex = Math.max(
    0,
    OPTIONS.findIndex((o) => o.value === (theme || "system"))
  );

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="relative inline-flex items-center p-1 rounded-full bg-surface-hover border border-line shadow-inner"
    >
      {/* Sliding indicator — one tile-width, slides to the active option */}
      <span
        aria-hidden
        className="absolute top-1 bottom-1 w-9 rounded-full bg-surface dark:bg-white/10 shadow-[0_2px_6px_rgba(15,23,42,0.08)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.5)] ring-1 ring-line/60 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
        style={{ transform: `translateX(${activeIndex * 36}px)` }}
      />

      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = theme === value || (!theme && value === "system");
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={`relative z-10 inline-flex items-center justify-center w-9 h-7 rounded-full transition-colors duration-200 ${
              active
                ? "text-brand"
                : "text-content-subtle hover:text-content"
            }`}
          >
            <Icon size={15} strokeWidth={active ? 2.4 : 2} />
          </button>
        );
      })}
    </div>
  );
}
