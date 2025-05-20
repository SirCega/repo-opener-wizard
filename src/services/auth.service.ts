
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/auth-types';
import { getUserById } from './user.service';

/**
 * Sign in with email and password
 */
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }

  return data;
};

/**
 * Sign out current user
 */
export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    throw error;
  }
};

/**
 * Register a new client user
 */
export const registerClient = async (userData: { 
  email: string, 
  password: string, 
  name: string, 
  address: string 
}) => {
  // Check if email already exists
  const { data: existingUser } = await supabase
    .from('users')
    .select('id')
    .eq('email', userData.email)
    .single();

  if (existingUser) {
    throw new Error("Este correo electrónico ya está registrado.");
  }

  // Register user in Auth
  const { data, error } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
  });

  if (error) {
    throw error;
  }

  if (!data.user) {
    throw new Error("Error al crear el usuario");
  }

  // Create user profile
  const { error: profileError } = await supabase
    .from('users')
    .insert([{
      id: data.user.id,
      email: userData.email,
      password: userData.password,
      name: userData.name,
      role: 'cliente',
      address: userData.address
    }]);

  if (profileError) {
    throw new Error(`Error al crear el perfil: ${profileError.message}`);
  }

  return data;
};

/**
 * Get current session and user data
 */
export const getCurrentSession = async () => {
  const { data } = await supabase.auth.getSession();
  
  if (!data.session) {
    return { session: null, user: null };
  }
  
  const userData = await getUserById(data.session.user.id);
  
  return {
    session: data.session,
    user: userData
  };
};
