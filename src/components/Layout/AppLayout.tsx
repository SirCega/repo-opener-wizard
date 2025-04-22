
import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from './AppSidebar';
import TopBar from './TopBar';
import { useAuth } from '@/hooks/useAuth';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <TopBar />
          <main className="flex-1 p-4 md:p-6 overflow-y-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
