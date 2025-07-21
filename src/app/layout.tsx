import type {Metadata} from 'next';
import { Inter, Belleza } from 'next/font/google';
import './globals.css';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebarContent } from '@/components/app-sidebar-content';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'Pingly Web',
  description: 'Your scheduling assistant',
};

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const belleza = Belleza({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-belleza',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Belleza&family=Inter:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${inter.variable} ${belleza.variable} font-body antialiased`}>
        <SidebarProvider>
          <div className="flex min-h-screen bg-background">
            <Sidebar>
              <AppSidebarContent />
            </Sidebar>
            <SidebarInset>
              <div className="p-4 sm:p-6 lg:p-8">
                {children}
              </div>
            </SidebarInset>
          </div>
        </SidebarProvider>
        <Toaster />
      </body>
    </html>
  );
}
