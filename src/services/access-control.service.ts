
import { User } from '@/types/auth-types';

/**
 * Check if a user has access based on their role
 */
export const hasAccess = (user: User | null, allowedRoles: string[]): boolean => {
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
