
import { createClient } from '@supabase/supabase-js';

// Valores por defecto para desarrollo local
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Verificar que las variables de entorno estén definidas
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Las variables de entorno de Supabase no están configuradas correctamente. Por favor, asegúrate de que las variables VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY estén definidas.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
