
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/ui/use-toast';

const Index: React.FC = () => {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  // Si el usuario está conectado, redirigir al dashboard, de lo contrario a la autenticación
  if (user) {
    return <Navigate to="/dashboard" replace />;
  } else {
    return <Navigate to="/auth" replace />;
  }
};

export default Index;
