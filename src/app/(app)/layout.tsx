
import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebarContent } from '@/components/app-sidebar-content';


export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-background">
        <Sidebar>
          <AppSidebarContent />
        </Sidebar>
        <SidebarInset>
          <div className="p-4 sm:p-6 lg:p-8 h-full">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
