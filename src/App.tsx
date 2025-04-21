
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import NotFound from "./pages/NotFound";
import AppLayout from "./components/Layout/AppLayout";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// App routes component (used inside AuthProvider)
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="inventario" element={<Inventory />} />
        {/* Add other routes as needed */}
        <Route path="productos" element={<div className="p-6">Página de Productos (En desarrollo)</div>} />
        <Route path="pedidos" element={<div className="p-6">Página de Pedidos (En desarrollo)</div>} />
        <Route path="entregas" element={<div className="p-6">Página de Entregas (En desarrollo)</div>} />
        <Route path="reportes" element={<div className="p-6">Página de Reportes (En desarrollo)</div>} />
        <Route path="facturas" element={<div className="p-6">Página de Facturas (En desarrollo)</div>} />
        <Route path="usuarios" element={<div className="p-6">Página de Usuarios (En desarrollo)</div>} />
        <Route path="configuracion" element={<div className="p-6">Página de Configuración (En desarrollo)</div>} />
      </Route>
      
      {/* Catch-all route for 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
