import { ClerkProvider } from "@clerk/nextjs/app-beta";
import React from "react";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <title>Gymrat</title>
        </head>
        <body className="font-mono">{children}</body>
      </html>
    </ClerkProvider>
  );
}
