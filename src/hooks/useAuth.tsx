
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  hasAccess: (allowedRoles: string[]) => boolean;
  registerClient: (userData: { email: string, password: string, name: string, address: string }) => Promise<void>;
  getAllUsers: () => Promise<User[]>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Configuración inicial para la autenticación con Supabase
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
            try {
              const { data: userData, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', currentSession.user.id)
                .single();
                
              if (error) {
                console.error("Error fetching user data:", error);
                return;
              }
              
              if (userData) {
                setUser({
                  id: userData.id,
                  email: userData.email,
                  name: userData.name,
                  role: userData.role,
                  address: userData.address
                });
              }
            } catch (error) {
              console.error("Error in auth state change:", error);
            }
          }, 0);
        } else {
          setUser(null);
        }
      }
    );

    // Luego verificamos si hay una sesión existente
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setSupabaseUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        try {
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', currentSession.user.id)
            .single();
            
          if (error) {
            console.error("Error fetching user data:", error);
            setIsLoading(false);
            return;
          }
          
          if (userData) {
            setUser({
              id: userData.id,
              email: userData.email,
              name: userData.name,
              role: userData.role,
              address: userData.address
            });
          }
        } catch (error) {
          console.error("Error in initial session check:", error);
        }
      }
      
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: "Error de autenticación",
          description: error.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Obtener datos del usuario de la tabla users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (userError) {
        toast({
          title: "Error al obtener datos del usuario",
          description: userError.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Actualizar el último login
      await supabase
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userData.id);

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
      await supabase.auth.signOut();
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
      // Verificar si el usuario ya existe
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', userData.email)
        .single();

      if (existingUser) {
        toast({
          title: "Error de registro",
          description: "Este correo electrónico ya está registrado.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Registrar al usuario en Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
      });

      if (error) {
        toast({
          title: "Error de registro",
          description: error.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (!data.user) {
        toast({
          title: "Error de registro",
          description: "Error al crear el usuario",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Crear el perfil del usuario
      const { error: profileError } = await supabase
        .from('users')
        .insert([{
          id: data.user.id,
          email: userData.email,
          password: userData.password, // En producción, esto debería ser un hash
          name: userData.name,
          role: 'cliente',
          address: userData.address
        }]);

      if (profileError) {
        toast({
          title: "Error de registro",
          description: "Error al crear el perfil: " + profileError.message,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

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
    if (!user || user.role !== 'admin') {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*');

      if (error) {
        console.error("Error fetching users:", error);
        return [];
      }

      return data.map(user => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        address: user.address
      })) || [];
    } catch (error) {
      console.error("Error in getAllUsers:", error);
      return [];
    }
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
