import type {Metadata} from 'next';
import { Lora, Source_Sans_3 } from 'next/font/google';
import './globals.css';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebarContent } from '@/components/app-sidebar-content';
import { Toaster } from "@/components/ui/toaster";

export const metadata: Metadata = {
  title: 'Pingly Web',
  description: 'Your scheduling assistant',
};

const sourceSans3 = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-source-sans-3',
});

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
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
        <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400..700;1,400..700&family=Source+Sans+3:ital,wght@0,200..900;1,200..900&display=swap" rel="stylesheet" />
      </head>
      <body className={`${sourceSans3.variable} ${lora.variable} font-body antialiased`}>
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
