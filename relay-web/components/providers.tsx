"use client";

import { SessionProvider } from "next-auth/react";
import { NotificationProvider } from "@/context/NotificationContext";
import GlobalShortcuts from "@/components/GlobalShortcuts";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NotificationProvider>
        <GlobalShortcuts />
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            className: "!border !border-outline-variant/40 !bg-surface-container-lowest !text-on-surface",
            style: {
              fontSize: "14px",
              borderRadius: "8px",
            },
            success: {
              iconTheme: {
                primary: "#2d4a3e",
                secondary: "#ffffff",
              },
            },
            error: {
              iconTheme: {
                primary: "#ba1a1a",
                secondary: "#ffffff",
              },
            },
          }}
        />
      </NotificationProvider>
    </SessionProvider>
  );
}
