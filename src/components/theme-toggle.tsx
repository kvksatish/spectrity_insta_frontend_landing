"use client";

// @ts-expect-error - lucide icons don't have individual type exports
import Moon from "lucide-react/dist/esm/icons/moon";
// @ts-expect-error - lucide icons don't have individual type exports
import Sun from "lucide-react/dist/esm/icons/sun";
import { useTheme } from "./theme-provider";
import { Button } from "./ui/button";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleTheme}
      className="w-9 h-9 p-0"
      aria-label="Toggle theme"
    >
      {theme === "light" ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </Button>
  );
}
