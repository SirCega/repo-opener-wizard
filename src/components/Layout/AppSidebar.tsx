
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarFooter
} from '@/components/ui/sidebar';
import { 
  Users, 
  Package, 
  ShoppingCart, 
  BarChart3, 
  Truck, 
  FileText, 
  Archive, 
  Home, 
  LogOut, 
  Settings 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const AppSidebar: React.FC = () => {
  const { logout, user } = useAuth();

  const menuItems = [
    { title: 'Dashboard', path: '/dashboard', icon: Home },
    { title: 'Productos', path: '/productos', icon: Package },
    { title: 'Inventario', path: '/inventario', icon: Archive },
    { title: 'Pedidos', path: '/pedidos', icon: ShoppingCart },
    { title: 'Entregas', path: '/entregas', icon: Truck },
    { title: 'Reportes', path: '/reportes', icon: BarChart3 },
    { title: 'Facturas', path: '/facturas', icon: FileText },
  ];

  // Only admins can see these
  const adminMenuItems = [
    { title: 'Usuarios', path: '/usuarios', icon: Users },
    { title: 'Configuración', path: '/configuracion', icon: Settings },
  ];

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-lg">LH</span>
          </div>
          <div>
            <h1 className="text-sidebar-foreground text-xl font-bold">LicorHub</h1>
            <p className="text-sidebar-foreground/70 text-xs">Sistema de Gestión</p>
          </div>
        </div>
        <SidebarTrigger className="absolute right-2 top-4 text-sidebar-foreground/70 hover:text-sidebar-foreground" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.path}
                      className={({ isActive }) => 
                        isActive ? "w-full flex items-center space-x-2 px-3 py-2 bg-sidebar-accent rounded-md" 
                        : "w-full flex items-center space-x-2 px-3 py-2 hover:bg-sidebar-accent/50 rounded-md"
                      }
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {user?.role === 'admin' && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminMenuItems.map((item) => (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.path}
                        className={({ isActive }) => 
                          isActive ? "w-full flex items-center space-x-2 px-3 py-2 bg-sidebar-accent rounded-md" 
                          : "w-full flex items-center space-x-2 px-3 py-2 hover:bg-sidebar-accent/50 rounded-md"
                        }
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="p-4">
        <Button 
          variant="ghost" 
          className="w-full flex items-center justify-start space-x-2 text-sidebar-foreground"
          onClick={logout}
        >
          <LogOut className="w-5 h-5" />
          <span>Cerrar Sesión</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
