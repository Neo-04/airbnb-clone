import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "StayFinder — book unique places to stay",
  description: "An Airbnb-style marketplace demo built with Next.js and FastAPI.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Header />
          <main className="page">
            <div className="container">{children}</div>
          </main>
        </Providers>
      </body>
    </html>
  );
}
