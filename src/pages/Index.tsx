
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

const Index: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  
  // Verificar si las variables de entorno de Supabase están configuradas
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  React.useEffect(() => {
    if (!supabaseUrl || !supabaseAnonKey) {
      toast({
        title: "Error de configuración",
        description: "La conexión con Supabase no está configurada correctamente. Por favor, asegúrate de conectar tu proyecto Lovable con Supabase.",
        variant: "destructive",
        duration: 10000,
      });
    }
  }, [toast, supabaseUrl, supabaseAnonKey]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  // Si el usuario está conectado, redirigir al dashboard, de lo contrario al login
  if (user) {
    return <Navigate to="/dashboard" replace />;
  } else {
    return <Navigate to="/login" replace />;
  }
};

export default Index;
