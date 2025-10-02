import type { Metadata } from "next";
import "@styles/globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Charlie App",
  description: "Starter app (Next.js + Tailwind v4 + HeroUI)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
