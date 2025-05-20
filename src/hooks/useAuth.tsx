
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { User, AuthContextType } from '@/types/auth-types';
import * as authService from '@/services/auth.service';
import * as userService from '@/services/user.service';
import * as accessControlService from '@/services/access-control.service';

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Setup auth state listener
  useEffect(() => {
    // Primero establecemos el listener de cambio de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setSupabaseUser(currentSession?.user ?? null);
        
        // Si hay un usuario autenticado, obtener su información de perfil
        if (currentSession?.user) {
          // Usar setTimeout para evitar bloqueo
          setTimeout(async () => {
            const userData = await userService.getUserById(currentSession.user.id);
            if (userData) {
              setUser(userData);
            }
          }, 0);
        } else {
          setUser(null);
        }
      }
    );

    // Luego verificamos si hay una sesión existente
    authService.getCurrentSession().then(({ session: currentSession, user: userData }) => {
      setSession(currentSession);
      setSupabaseUser(currentSession?.user ?? null);
      setUser(userData);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Función para iniciar sesión
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Iniciar sesión en Supabase Auth
      const { user: authUser } = await authService.signInWithEmail(email, password);

      // Obtener datos del usuario
      const userData = await userService.getUserById(authUser.id);
      
      if (!userData) {
        throw new Error("Error al obtener datos del usuario");
      }

      // Actualizar último login
      await userService.updateLastLogin(userData.id);

      toast({
        title: "Bienvenido",
        description: `Hola, ${userData.name}`,
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

  // Función para cerrar sesión
  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.signOut();
      setUser(null);
      setSupabaseUser(null);
      setSession(null);
      
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

  // Función para registrar un nuevo cliente
  const registerClient = async (userData: { email: string, password: string, name: string, address: string }) => {
    setIsLoading(true);
    try {
      await authService.registerClient(userData);
      
      toast({
        title: "Registro exitoso",
        description: `Bienvenido, ${userData.name}`,
      });

      // El usuario ya estará autenticado por el signUp
      navigate("/dashboard");
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

  // Función para obtener todos los usuarios (solo admin)
  const getAllUsers = async (): Promise<User[]> => {
    return await userService.getAllUsers(user?.role);
  };

  // Función para verificar si el usuario tiene acceso según su rol
  const hasAccess = (allowedRoles: string[]) => {
    return accessControlService.hasAccess(user, allowedRoles);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      supabaseUser,
      session,
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

// Corregimos el error TS1205 usando export type
export type { User } from '@/types/auth-types';
