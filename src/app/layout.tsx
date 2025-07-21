import type {Metadata} from 'next';
import './globals.css';
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebarContent } from '@/components/app-sidebar-content';
import { Toaster } from "@/components/ui/toaster";

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
      <body className="font-sans antialiased">
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
