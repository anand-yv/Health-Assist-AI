import { useEffect, useState } from "react";

type Theme = "light" | "dark";
const systemTheme = (): Theme => (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    const t = document.documentElement.dataset.theme;
    return t === "light" || t === "dark" ? t : systemTheme();
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try { localStorage.setItem("theme", theme); } catch { /* storage unavailable */ }
  }, [theme]);

  return (
    <div className="theme" role="group" aria-label="Colour theme">
      {(["light", "dark"] as Theme[]).map((t) => (
        <button key={t} aria-pressed={theme === t} className={theme === t ? "on" : ""} onClick={() => setTheme(t)}>
          {t}
        </button>
      ))}
    </div>
  );
}
