
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

// Usuarios demo para login rápido basados en la página de usuarios
const DEMO_USERS = [
  { email: "admin@licorhub.com", password: "admin123", name: "Administrador", role: "admin" },
  { email: "cliente@licorhub.com", password: "cliente123", name: "Cliente Demo", role: "cliente" },
  { email: "oficinista@licorhub.com", password: "oficinista123", name: "Oficinista Demo", role: "oficinista" },
  { email: "bodeguero@licorhub.com", password: "bodeguero123", name: "Bodeguero", role: "bodeguero" },
  { email: "domiciliario@licorhub.com", password: "domiciliario123", name: "Domiciliario Demo", role: "domiciliario" },
];

interface User {
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  hasAccess: (allowedRoles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    // Buscar el usuario demo permitido
    const matched = DEMO_USERS.find(
      (u) => u.email === email && u.password === password
    );
    if (matched) {
      const userPayload: User = {
        email: matched.email,
        name: matched.name,
        role: matched.role,
      };
      setUser(userPayload);
      localStorage.setItem("user", JSON.stringify(userPayload));
      toast({
        title: "Bienvenido",
        description: `Hola, ${matched.name}`,
      });
      navigate("/dashboard");
    } else {
      toast({
        title: "Error de autenticación",
        description: "Usuario o contraseña incorrectos.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente.",
    });
    navigate("/auth");
  };

  // Función para verificar si el usuario tiene acceso según su rol
  const hasAccess = (allowedRoles: string[]) => {
    if (!user) return false;
    
    // El administrador tiene acceso a todo
    if (user.role === 'admin') return true;
    
    // Oficinista tiene acceso a todo menos usuarios
    if (user.role === 'oficinista' && !allowedRoles.includes('usuarios-management')) return true;
    
    // Para otros roles, verificar si está en la lista de permitidos
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, hasAccess }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
