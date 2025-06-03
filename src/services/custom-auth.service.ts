
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/auth-types';

/**
 * Custom authentication service that works with the users table
 * instead of Supabase Auth
 */

/**
 * Sign in with email and password using custom users table
 */
export const signInWithCustomAuth = async (email: string, password: string) => {
  try {
    console.log("Intentando login con:", email);
    
    // Get all users from the database to check existing users
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email);

    if (error) {
      console.error("Error al consultar usuarios:", error);
      throw new Error('Error al verificar credenciales');
    }

    console.log("Usuarios encontrados:", users);

    if (!users || users.length === 0) {
      throw new Error('Usuario no encontrado');
    }

    const user = users[0];
    
    // For demo purposes, we'll accept "password" as the password for all users
    // In production, use proper password hashing like bcrypt
    if (password !== 'password') {
      throw new Error('Contraseña incorrecta');
    }

    // Update last login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        address: user.address
      } as User
    };
  } catch (error: any) {
    console.error("Error en signInWithCustomAuth:", error);
    throw error;
  }
};

/**
 * Register a new client user in the users table
 */
export const registerClientInUsersTable = async (userData: { 
  email: string, 
  password: string, 
  name: string, 
  address: string 
}) => {
  try {
    // Check if user already exists
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('email')
      .eq('email', userData.email);

    if (checkError) {
      throw new Error('Error al verificar el usuario');
    }

    if (existingUsers && existingUsers.length > 0) {
      throw new Error('Este correo electrónico ya está registrado');
    }

    // Insert new user
    const { data, error } = await supabase
      .from('users')
      .insert([{
        email: userData.email,
        password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // "password" hashed
        name: userData.name,
        role: 'cliente',
        address: userData.address
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear el usuario: ${error.message}`);
    }

    return {
      user: {
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        address: data.address
      } as User
    };
  } catch (error: any) {
    throw error;
  }
};

/**
 * Get user by ID from users table
 */
export const getUserFromUsersTable = async (userId: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role,
      address: data.address
    } as User;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

/**
 * Get all users from the users table for admin access
 */
export const getAllUsersFromTable = async (): Promise<User[]> => {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching all users:", error);
      return [];
    }

    return users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      address: user.address
    })) as User[];
  } catch (error) {
    console.error("Error in getAllUsersFromTable:", error);
    return [];
  }
};
