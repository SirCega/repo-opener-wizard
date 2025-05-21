
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
      (event, currentSession) => {
        console.log("Auth state changed:", event, currentSession?.user?.id);
        setSession(currentSession);
        setSupabaseUser(currentSession?.user ?? null);
        
        // Si hay un usuario autenticado, obtener su información de perfil
        if (currentSession?.user) {
          // Usar setTimeout para evitar bloqueo
          setTimeout(async () => {
            try {
              const userData = await userService.getUserById(currentSession.user.id);
              if (userData) {
                setUser(userData);
                console.log("User data loaded:", userData);
              } else {
                console.log("No se pudo obtener datos de usuario desde la BD");
              }
            } catch (error) {
              console.error("Error fetching user data in auth change:", error);
            }
          }, 0);
        } else {
          setUser(null);
        }
      }
    );

    // Luego verificamos si hay una sesión existente
    const checkExistingSession = async () => {
      try {
        const { session: currentSession, user: userData } = await authService.getCurrentSession();
        console.log("Existing session check:", currentSession ? "Session active" : "No active session", userData);
        setSession(currentSession);
        setSupabaseUser(currentSession?.user ?? null);
        setUser(userData);
      } catch (error) {
        console.error("Error checking existing session:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingSession();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Función para iniciar sesión
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log("Iniciando sesión con:", email);
      // Iniciar sesión en Supabase Auth
      const { user: authUser } = await authService.signInWithEmail(email, password);
      
      console.log("Autenticación exitosa, usuario:", authUser?.id);

      // Obtener datos del usuario
      const userData = await userService.getUserById(authUser.id);
      
      if (!userData) {
        console.warn("No se pudo obtener datos del usuario desde la base de datos, usaremos los metadatos");
        // Si no hay datos en la tabla users, crear un objeto de usuario desde los metadatos de auth
        const basicUser: User = {
          id: authUser.id,
          email: authUser.email || '',
          name: authUser.user_metadata?.name || '',
          role: authUser.user_metadata?.role || 'cliente',
          address: authUser.user_metadata?.address || ''
        };
        setUser(basicUser);
      } else {
        setUser(userData);
      }

      // Actualizar último login
      await userService.updateLastLogin(authUser.id);

      toast({
        title: "Bienvenido",
        description: `Inicio de sesión exitoso`,
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      console.error("Login error:", error);
      let errorMessage = "Error de autenticación";
      
      if (error.message && error.message.includes("Invalid login credentials")) {
        errorMessage = "Credenciales inválidas. Verifica tu correo y contraseña.";
      } else if (error.message && error.message.includes("Email not confirmed")) {
        errorMessage = "Correo electrónico no confirmado. Revisa tu bandeja de entrada.";
      } else {
        errorMessage = `Error: ${error.message || "Desconocido"}`;
      }
      
      toast({
        title: "Error de autenticación",
        description: errorMessage,
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
      console.log("Registrando nuevo cliente:", userData.email);
      await authService.registerClient(userData);
      
      toast({
        title: "Registro exitoso",
        description: `Bienvenido, ${userData.name}`,
      });

      // Iniciamos sesión después del registro
      await login(userData.email, userData.password);
    } catch (error: any) {
      console.error("Registration error:", error);
      
      let errorMessage = "Error de registro";
      if (error.message && error.message.includes("User already registered")) {
        errorMessage = "Este correo electrónico ya está registrado.";
      } else {
        errorMessage = `Error: ${error.message || "Desconocido"}`;
      }
      
      toast({
        title: "Error de registro",
        description: errorMessage,
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
