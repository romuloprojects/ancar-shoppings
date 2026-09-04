import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type AppTheme = "dark" | "light";
const STORAGE_KEY = "ancar-theme";

function readTheme(): AppTheme {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

function applyTheme(theme: AppTheme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.classList.toggle("light", theme === "light");
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // O tema continua funcionando mesmo com armazenamento local bloqueado.
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<AppTheme>("light");

  useEffect(() => {
    setTheme(readTheme());
  }, []);

  const nextTheme = theme === "dark" ? "light" : "dark";
  const label = nextTheme === "light" ? "Ativar tema claro" : "Ativar tema escuro";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="theme-toggle h-9 w-9 shrink-0 rounded-xl border-border/55 bg-card/60 shadow-none hover:bg-accent/60"
      aria-label={label}
      title={label}
      onClick={() => {
        applyTheme(nextTheme);
        setTheme(nextTheme);
      }}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
