
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  address?: string;
}

export interface AuthContextType {
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
