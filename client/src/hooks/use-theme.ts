import { useEffect, useState } from "react";
import { useTheme } from "@/components/ui/theme-provider";

export function useThemeMode() {
  const { theme, setTheme } = useTheme();
  const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("light");
  
  useEffect(() => {
    // Determine actual theme based on system preference if needed
    const currentTheme = theme === "system" 
      ? window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      : theme;
    
    setResolvedTheme(currentTheme as "dark" | "light");
    
    // Add listener for system preference changes if in system mode
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      
      const handleChange = (e: MediaQueryListEvent) => {
        setResolvedTheme(e.matches ? "dark" : "light");
      };
      
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
  }, [theme]);
  
  // Toggle between light and dark (ignoring system)
  const toggleTheme = () => {
    setTheme(resolvedTheme === "light" ? "dark" : "light");
  };
  
  return {
    theme, 
    resolvedTheme, 
    setTheme, 
    toggleTheme
  };
}
