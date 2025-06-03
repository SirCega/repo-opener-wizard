
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { User, AuthContextType } from '@/types/auth-types';
import * as customAuthService from '@/services/custom-auth.service';

const CustomAuthContext = createContext<AuthContextType | null>(null);

export const CustomAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check for existing session on mount
  useEffect(() => {
    console.log("CustomAuthProvider: Checking for existing session");
    const storedUser = localStorage.getItem('liquistock_user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        console.log("Found stored user:", userData);
        setUser(userData);
        setSession({ user: userData }); // Create a mock session
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem('liquistock_user');
      }
    }
  }, []);

  // Function to log in
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log("CustomAuth: Iniciando sesión con:", email);
      const { user: userData } = await customAuthService.signInWithCustomAuth(email, password);
      
      console.log("Login successful, user data:", userData);
      setUser(userData);
      setSession({ user: userData });
      
      // Store in localStorage for persistence
      localStorage.setItem('liquistock_user', JSON.stringify(userData));

      toast({
        title: "Bienvenido",
        description: `Inicio de sesión exitoso, ${userData.name}`,
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      toast({
        title: "Error de autenticación",
        description: error.message || "Error desconocido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to log out
  const logout = async () => {
    setIsLoading(true);
    try {
      setUser(null);
      setSession(null);
      localStorage.removeItem('liquistock_user');
      
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión correctamente.",
      });
      
      navigate("/auth");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast({
        title: "Error al cerrar sesión",
        description: error.message || "Error desconocido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to register a new client
  const registerClient = async (userData: { email: string, password: string, name: string, address: string }) => {
    setIsLoading(true);
    try {
      console.log("Registrando nuevo cliente:", userData.email);
      const { user: newUser } = await customAuthService.registerClientInUsersTable(userData);
      
      toast({
        title: "Registro exitoso",
        description: `Bienvenido, ${newUser.name}`,
      });

      // Automatically log in after registration
      await login(userData.email, userData.password);
    } catch (error: any) {
      console.error("Registration error:", error);
      toast({
        title: "Error de registro",
        description: error.message || "Error desconocido",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to get all users (only admin)
  const getAllUsers = async (): Promise<User[]> => {
    try {
      return await customAuthService.getAllUsersFromTable();
    } catch (error) {
      console.error("Error getting all users:", error);
      return [];
    }
  };

  // Function to check access based on roles
  const hasAccess = (allowedRoles: string[]) => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  return (
    <CustomAuthContext.Provider value={{ 
      user, 
      supabaseUser: null, // Not using Supabase Auth
      session,
      login, 
      logout, 
      isLoading, 
      hasAccess, 
      registerClient,
      getAllUsers 
    }}>
      {children}
    </CustomAuthContext.Provider>
  );
};

export const useCustomAuth = () => {
  const context = useContext(CustomAuthContext);
  if (!context) {
    throw new Error('useCustomAuth must be used within a CustomAuthProvider');
  }
  return context;
};
