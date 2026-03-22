"use client";

import { SessionProvider } from "next-auth/react";
import { NotificationProvider } from "@/context/NotificationContext";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NotificationProvider>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
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
    </SessionProvider>
  );
}
