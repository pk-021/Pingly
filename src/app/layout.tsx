
import type {Metadata} from 'next';
import { Inter, Belleza } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const belleza = Belleza({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-belleza',
});


export const metadata: Metadata = {
  title: 'Pingly Web',
  description: 'Your scheduling assistant',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={`${inter.variable} ${belleza.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
