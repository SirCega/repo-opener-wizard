
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
  Settings,
  Wine 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const AppSidebar: React.FC = () => {
  const { logout, user, hasAccess } = useAuth();

  // Definimos elementos comunes a todos los usuarios
  const commonMenuItems = [
    { title: 'Dashboard', path: '/dashboard', icon: Home, roles: ['admin', 'oficinista', 'bodeguero', 'domiciliario', 'cliente'] },
  ];

  // Menú para administradores y oficinistas
  const adminOfficinistaMenuItems = [
    { title: 'Productos', path: '/productos', icon: Package, roles: ['admin', 'oficinista'] },
    { title: 'Inventario', path: '/inventario', icon: Archive, roles: ['admin', 'oficinista'] },
  ];

  // Pedidos y entregas (acceso variable según rol)
  const operationsMenuItems = [
    { title: 'Pedidos', path: '/pedidos', icon: ShoppingCart, roles: ['admin', 'oficinista', 'bodeguero', 'cliente'] },
    { title: 'Entregas', path: '/entregas', icon: Truck, roles: ['admin', 'oficinista', 'bodeguero', 'domiciliario'] },
  ];

  // Reportes y facturas
  const reportingMenuItems = [
    { title: 'Reportes', path: '/reportes', icon: BarChart3, roles: ['admin', 'oficinista'] },
    { title: 'Facturas', path: '/facturas', icon: FileText, roles: ['admin', 'oficinista', 'cliente'] },
  ];

  // Solo admins pueden ver usuarios
  const adminOnlyItems = [
    { title: 'Usuarios', path: '/usuarios', icon: Users, roles: ['admin'] },
    { title: 'Configuración', path: '/configuracion', icon: Settings, roles: ['admin'] },
  ];

  // Filtrar las opciones de menú según el rol del usuario
  const filteredCommonMenu = commonMenuItems.filter(item => user && item.roles.includes(user.role));
  const filteredAdminOfficinista = adminOfficinistaMenuItems.filter(item => user && item.roles.includes(user.role));
  const filteredOperations = operationsMenuItems.filter(item => user && item.roles.includes(user.role));
  const filteredReporting = reportingMenuItems.filter(item => user && item.roles.includes(user.role));
  const filteredAdminOnly = adminOnlyItems.filter(item => user && item.roles.includes(user.role));

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
            <Wine className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sidebar-foreground text-xl font-bold">LiquiStock</h1>
            <p className="text-sidebar-foreground/70 text-xs">Sistema de Gestión</p>
          </div>
        </div>
        <SidebarTrigger className="absolute right-2 top-4 text-sidebar-foreground/70 hover:text-sidebar-foreground" />
      </SidebarHeader>
      <SidebarContent>
        {/* Menú común para todos */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredCommonMenu.map((item) => (
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

        {/* Productos e inventarios: solo admin y oficinista */}
        {filteredAdminOfficinista.length > 0 && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredAdminOfficinista.map((item) => (
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

        {/* Pedidos y entregas: acceso variable según rol */}
        {filteredOperations.length > 0 && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredOperations.map((item) => (
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

        {/* Reportes y facturas */}
        {filteredReporting.length > 0 && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredReporting.map((item) => (
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

        {/* Menú solo para admin */}
        {filteredAdminOnly.length > 0 && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredAdminOnly.map((item) => (
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

        {/* Información del usuario logueado */}
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="px-3 py-2 mt-2">
              <div className="p-3 bg-sidebar-accent rounded-md">
                <p className="text-sm font-medium text-sidebar-foreground">Usuario: {user?.name}</p>
                <p className="text-xs text-sidebar-foreground/70">Rol: {user?.role}</p>
                {user?.address && (
                  <p className="text-xs text-sidebar-foreground/70 mt-1 truncate" title={user.address}>
                    Dirección: {user.address}
                  </p>
                )}
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
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
