import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { ThemeProvider } from "@/components/theming/theme-provider";
import { Navbar } from "@/components/navbar/navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ISE Jobs Board",
};

export default async function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`
            ${geistSans.variable} 
            ${geistMono.variable} 
            antialiased font-mono [background-image:radial-gradient(circle_at_1px_1px,rgba(0,0,0,0.6)_1px,transparent_0)] [background-size:30px_30px] dark:[background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.3)_1px,transparent_0)]
            selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black mb-16
`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
          <Navbar />
          {children}
        </ThemeProvider>
      </body>
    </html >
  );
}
