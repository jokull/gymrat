import type { Metadata, Viewport } from "next";

import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Gymrat",
  description: "The simple workout tracker",
  metadataBase: new URL(`https://${process.env.HOST}/`),
};

// eslint-disable-next-line @typescript-eslint/require-await
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[rgb(5,1,13)] px-4">
        <div className="mx-auto h-full max-w-lg py-4 text-white sm:py-8">
          {children}
        </div>
      </body>
    </html>
  );
}
