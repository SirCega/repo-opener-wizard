
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/auth-types';

/**
 * Get user profile data from Supabase
 */
export const getUserById = async (userId: string): Promise<User | null> => {
  try {
    // First try to get user from the users table
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error("Error fetching user data:", error);
      
      // Fallback to auth metadata
      const { data: authUser, error: authError } = await supabase.auth.getUser(userId);
      
      if (authError || !authUser) {
        console.error("Error fetching auth user data:", authError);
        return null;
      }
      
      // Use metadata if available
      const userData: User = {
        id: authUser.user.id,
        email: authUser.user.email || '',
        name: authUser.user.user_metadata?.name || '',
        role: authUser.user.user_metadata?.role || 'cliente',
        address: authUser.user.user_metadata?.address || ''
      };
      
      return userData;
    }
    
    if (!data) {
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role,
      address: data.address
    };
  } catch (error) {
    console.error("Error in getUserById:", error);
    return null;
  }
};

/**
 * Update user's last login timestamp
 */
export const updateLastLogin = async (userId: string): Promise<void> => {
  try {
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userId);
  } catch (error) {
    console.error("Error updating last login:", error);
  }
};

/**
 * Get all users (admin only)
 */
export const getAllUsers = async (currentUserRole?: string): Promise<User[]> => {
  if (currentUserRole !== 'admin') {
    console.log("Access denied: User is not an admin");
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

/**
 * Get all customers (role = 'cliente')
 */
export const getCustomers = async (): Promise<User[]> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'cliente');

    if (error) {
      console.error("Error fetching customers:", error);
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
    console.error("Error in getCustomers:", error);
    return [];
  }
};
