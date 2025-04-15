"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Scheme = "light" | "dark";

type ThemeContextValue = {
  scheme: Scheme;
  setScheme: (value: Scheme) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Read scheme from localStorage
  const valueFromLocalStorage =
    typeof window !== "undefined" ? localStorage.getItem("scheme") : null;
  const schemeFromLocalStorage: Scheme | null =
    valueFromLocalStorage === "light" || valueFromLocalStorage === "dark"
      ? valueFromLocalStorage
      : null;

  // Read scheme from OS
  const mediaQuery =
    typeof window !== "undefined"
      ? matchMedia("(prefers-color-scheme: dark)")
      : null;
  const schemeFromOS: Scheme = mediaQuery?.matches ? "dark" : "light";

  const initialScheme = schemeFromLocalStorage ?? schemeFromOS;

  const [scheme, setScheme] = useState(initialScheme);

  // Keep localStorage in sync with the current scheme
  useEffect(() => {
    localStorage.setItem("scheme", scheme);

    if (scheme === "light") {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  }, [scheme]);

  // Update scheme when OS scheme changes
  useEffect(() => {
    function handleMediaQueryChange(e: MediaQueryListEvent) {
      setScheme(e.matches ? "dark" : "light");
    }

    mediaQuery?.addEventListener("change", handleMediaQueryChange);

    return () =>
      mediaQuery?.removeEventListener("change", handleMediaQueryChange);
  }, [mediaQuery]);

  return (
    <ThemeContext.Provider value={{ scheme, setScheme }}>
      {/* This is needed to prevent a flash of unstyled content on the client */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              const scheme = localStorage.getItem("scheme") || (window.matchMedia("(prefers-color-scheme: dark)").matches && "dark");
              scheme.toString().replaceAll("\\"", "") === "dark" && document.documentElement.classList.add("dark");
            })();
          `,
        }}
      />

      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
}
