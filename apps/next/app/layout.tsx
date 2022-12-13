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
          <body className="bg-[rgb(5,1,13)] px-4">
            <div className="py-4 sm:py-8 mx-auto max-w-lg text-white">
              {children}
            </div>
          </body>
        </html>
      </ClientProvider>
    </ClerkProvider>
  );
}
