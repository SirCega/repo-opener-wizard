
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Deliveries from "./pages/Deliveries";
import Reports from "./pages/Reports";
import Invoices from "./pages/Invoices";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import AppLayout from "./components/Layout/AppLayout";
import Auth from "./pages/Auth";

const queryClient = new QueryClient();

// Protected route component with role-based access
const ProtectedRoute = ({ 
  children, 
  allowedRoles = [] 
}: { 
  children: React.ReactNode, 
  allowedRoles?: string[] 
}) => {
  const { user, isLoading, hasAccess } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Check if user's role allows access
  if (allowedRoles.length > 0 && !hasAccess(allowedRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/login" element={<Navigate to="/auth" replace />} />
            
            <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="productos" element={
                <ProtectedRoute allowedRoles={['admin', 'oficinista']}>
                  <Products />
                </ProtectedRoute>
              } />
              <Route path="inventario" element={
                <ProtectedRoute allowedRoles={['admin', 'oficinista']}>
                  <Inventory />
                </ProtectedRoute>
              } />
              <Route path="pedidos" element={
                <ProtectedRoute allowedRoles={['admin', 'oficinista', 'bodeguero', 'cliente']}>
                  <Orders />
                </ProtectedRoute>
              } />
              <Route path="entregas" element={
                <ProtectedRoute allowedRoles={['admin', 'oficinista', 'bodeguero', 'domiciliario']}>
                  <Deliveries />
                </ProtectedRoute>
              } />
              <Route path="reportes" element={
                <ProtectedRoute allowedRoles={['admin', 'oficinista']}>
                  <Reports />
                </ProtectedRoute>
              } />
              <Route path="facturas" element={
                <ProtectedRoute allowedRoles={['admin', 'oficinista', 'cliente']}>
                  <Invoices />
                </ProtectedRoute>
              } />
              <Route path="usuarios" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Users />
                </ProtectedRoute>
              } />
              <Route path="configuracion" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Settings />
                </ProtectedRoute>
              } />
            </Route>
            
            {/* Catch-all route for 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
          <Sonner />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
