"use client";

import { SessionProvider } from "next-auth/react";
import { NotificationProvider } from "@/context/NotificationContext";
import { ThemeProvider } from "@/context/ThemeContext";
import GlobalShortcuts from "@/components/GlobalShortcuts";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <NotificationProvider>
          <GlobalShortcuts />
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              className: "dark:!bg-gray-900 dark:!text-gray-100 !border !border-gray-200 dark:!border-gray-700",
              style: {
                background: "#1f2937",
                color: "#f9fafb",
                fontSize: "14px",
                borderRadius: "8px",
              },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#f9fafb",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#f9fafb",
              },
            },
          }}
          />
        </NotificationProvider>
      </ThemeProvider>
    </SessionProvider>
  );
}
