import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "dark" | "light";
interface ThemeState {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggle: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: "dark",
      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== "undefined") {
          document.documentElement.classList.toggle("dark", theme === "dark");
          document.documentElement.classList.toggle("light", theme === "light");
        }
      },
      toggle: () => get().setTheme(get().theme === "dark" ? "light" : "dark"),
    }),
    { name: "swai-theme" },
  ),
);
