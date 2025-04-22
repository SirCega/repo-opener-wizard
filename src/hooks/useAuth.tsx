
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

// Usuarios demo para login rápido basados en la página de usuarios
const DEMO_USERS = [
  { email: "admin@licorhub.com", password: "admin123", name: "Administrador", role: "admin" },
  { email: "cliente@licorhub.com", password: "cliente123", name: "Cliente Demo", role: "cliente", address: "Calle 123 #45-67, Bogotá" },
  { email: "oficinista@licorhub.com", password: "oficinista123", name: "Oficinista Demo", role: "oficinista" },
  { email: "bodeguero@licorhub.com", password: "bodeguero123", name: "Bodeguero", role: "bodeguero" },
  { email: "domiciliario@licorhub.com", password: "domiciliario123", name: "Domiciliario Demo", role: "domiciliario" },
];

export interface User {
  email: string;
  name: string;
  role: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  hasAccess: (allowedRoles: string[]) => boolean;
  registerClient: (userData: { email: string, password: string, name: string, address: string }) => Promise<void>;
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
        address: matched.address
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

  const registerClient = async (userData: { email: string, password: string, name: string, address: string }) => {
    setIsLoading(true);

    // Verificar si el usuario ya existe
    const existingUser = DEMO_USERS.find(u => u.email === userData.email);
    if (existingUser) {
      toast({
        title: "Error de registro",
        description: "Este correo electrónico ya está registrado.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // Crear nuevo usuario
    const newUser = {
      email: userData.email,
      password: userData.password,
      name: userData.name,
      role: "cliente",
      address: userData.address
    };

    // Guardar en memoria local para esta sesión
    DEMO_USERS.push(newUser);

    // También agregar a localStorage para persistencia
    const storedUsers = localStorage.getItem("demo_users");
    const userList = storedUsers ? JSON.parse(storedUsers) : [];
    userList.push(newUser);
    localStorage.setItem("demo_users", JSON.stringify(userList));

    // Iniciar sesión con el nuevo usuario
    const userPayload: User = {
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      address: newUser.address
    };

    setUser(userPayload);
    localStorage.setItem("user", JSON.stringify(userPayload));
    
    toast({
      title: "Registro exitoso",
      description: `Bienvenido, ${newUser.name}`,
    });
    
    navigate("/dashboard");
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
    
    // El oficinista puede acceder a todo menos a la gestión de usuarios
    if (user.role === 'oficinista' && !allowedRoles.includes('usuarios')) return true;
    
    // El bodeguero solo puede acceder a pedidos y entregas
    if (user.role === 'bodeguero' && (allowedRoles.includes('pedidos') || allowedRoles.includes('entregas'))) return true;
    
    // El domiciliario solo puede acceder a entregas asignadas
    if (user.role === 'domiciliario' && allowedRoles.includes('entregas')) return true;
    
    // El cliente puede acceder a sus propias vistas
    if (user.role === 'cliente' && allowedRoles.includes('cliente')) return true;
    
    // Para roles específicos, verificar si está en la lista de permitidos
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, hasAccess, registerClient }}>
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
