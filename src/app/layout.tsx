import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resume Job Match Dashboard",
  description: "Analyze a resume, score Bengaluru jobs, and store results in Supabase.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
