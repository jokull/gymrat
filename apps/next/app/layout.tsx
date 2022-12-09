import { ClerkProvider } from "@clerk/nextjs/app-beta";
import React from "react";
import { ClientProvider } from "../components/ClientProvider";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <ClientProvider>
        <html lang="en">
          <head>
            <title>Gymrat</title>
          </head>
          <body className="font-mono bg-[rgb(5,1,13)]">{children}</body>
        </html>
      </ClientProvider>
    </ClerkProvider>
  );
}
