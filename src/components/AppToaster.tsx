"use client";

import { Toaster } from "sonner";
import { useTheme } from "next-themes";

export function AppToaster() {
  const { resolvedTheme } = useTheme();

  return (
    <Toaster
      richColors
      position="top-center"
      theme={resolvedTheme === "light" ? "light" : "dark"}
      closeButton
    />
  );
}
