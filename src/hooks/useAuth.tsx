import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { addCustomer } from '@/services/order.service';

// Usuarios demo para login rápido
const DEMO_USERS = [
  { email: "admin@licorhub.com", password: "admin123", name: "Administrador", role: "admin" },
  { email: "cliente@licorhub.com", password: "cliente123", name: "Cliente", role: "cliente", address: "Calle 123 #45-67, Bogotá" },
  { email: "oficinista@licorhub.com", password: "oficinista123", name: "Oficinista", role: "oficinista" },
  { email: "bodeguero@licorhub.com", password: "bodeguero123", name: "Bodeguero", role: "bodeguero" },
  { email: "domiciliario@licorhub.com", password: "domiciliario123", name: "Domiciliario", role: "domiciliario" },
];

// Clave para usuarios registrados en localStorage
const REGISTERED_USERS_KEY = "registered_users";

export interface User {
  email: string;
  name: string;
  role: string;
  address?: string;
  id?: number; // ID para los clientes
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  hasAccess: (allowedRoles: string[]) => boolean;
  registerClient: (userData: { email: string, password: string, name: string, address: string }) => Promise<void>;
  getAllUsers: () => any[]; // Nueva función para obtener todos los usuarios
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

  // Cargar usuarios registrados desde localStorage
  const getRegisteredUsers = () => {
    const storedUsers = localStorage.getItem(REGISTERED_USERS_KEY);
    return storedUsers ? JSON.parse(storedUsers) : [];
  };

  // Guardar usuarios registrados en localStorage
  const saveRegisteredUsers = (users: any[]) => {
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
  };
  
  // Nueva función para obtener todos los usuarios (demo + registrados)
  const getAllUsers = () => {
    const registeredUsers = getRegisteredUsers();
    return [...DEMO_USERS, ...registeredUsers];
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    // Combinar usuarios demo con usuarios registrados
    const allUsers = getAllUsers();
    console.log("Todos los usuarios disponibles:", allUsers);

    // Buscar el usuario
    const matched = allUsers.find(
      (u) => u.email === email && u.password === password
    );
    
    if (matched) {
      console.log("Usuario encontrado:", matched);
      const userPayload: User = {
        email: matched.email,
        name: matched.name,
        role: matched.role,
        address: matched.address,
        id: matched.id
      };
      
      // Asegurarse de guardar el ID si existe
      if (matched.id) {
        userPayload.id = matched.id;
      }
      
      console.log("Usuario guardado en sesión:", userPayload);
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

    try {
      console.log("Registrando nuevo cliente:", userData);
      
      // Verificar si el usuario ya existe
      const allUsers = getAllUsers();
      const existingUser = allUsers.find(u => u.email === userData.email);
      
      if (existingUser) {
        toast({
          title: "Error de registro",
          description: "Este correo electrónico ya está registrado.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Crear cliente en el servicio de pedidos
      const newCustomer = addCustomer({
        name: userData.name,
        email: userData.email,
        address: userData.address
      });

      console.log("Nuevo cliente creado:", newCustomer);

      // Crear nuevo usuario
      const newUser = {
        email: userData.email,
        password: userData.password,
        name: userData.name,
        role: "cliente",
        address: userData.address,
        id: newCustomer.id // Guardar el ID del cliente para usarlo en pedidos
      };

      // Guardar en localStorage para persistencia
      const registeredUsers = getRegisteredUsers();
      registeredUsers.push(newUser);
      saveRegisteredUsers(registeredUsers);

      // Iniciar sesión con el nuevo usuario
      const userPayload: User = {
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        address: newUser.address,
        id: newUser.id
      };

      console.log("Nuevo usuario guardado en sesión:", userPayload);
      setUser(userPayload);
      localStorage.setItem("user", JSON.stringify(userPayload));
      
      toast({
        title: "Registro exitoso",
        description: `Bienvenido, ${newUser.name}`,
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error("Error durante el registro:", error);
      toast({
        title: "Error de registro",
        description: "Hubo un problema al registrar el usuario.",
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
    
    // El oficinista puede acceder a todo menos a la gestión de usuarios
    if (user.role === 'oficinista' && !allowedRoles.includes('admin')) return true;
    
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
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoading, 
      hasAccess, 
      registerClient,
      getAllUsers 
    }}>
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
