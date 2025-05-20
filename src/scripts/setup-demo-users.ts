
import { supabase } from "@/integrations/supabase/client";

// Esta función se utilizará para configurar los usuarios demo la primera vez
export const setupDemoUsers = async () => {
  try {
    console.log("Verificando usuarios demo...");
    
    // Verificar si ya existen usuarios
    const { data: existingUsers, error } = await supabase
      .from('users')
      .select('email')
      .eq('email', 'admin@licorhub.com')
      .single();
    
    if (existingUsers) {
      console.log("Los usuarios demo ya están configurados.");
      return;
    }
    
    // Usuarios demo para insertar
    const demoUsers = [
      { 
        email: "admin@licorhub.com", 
        password: "admin123", 
        name: "Administrador", 
        role: "admin" 
      },
      { 
        email: "cliente@licorhub.com", 
        password: "cliente123", 
        name: "Cliente", 
        role: "cliente", 
        address: "Calle 123 #45-67, Bogotá" 
      },
      { 
        email: "oficinista@licorhub.com", 
        password: "oficinista123", 
        name: "Oficinista", 
        role: "oficinista" 
      },
      { 
        email: "bodeguero@licorhub.com", 
        password: "bodeguero123", 
        name: "Bodeguero", 
        role: "bodeguero" 
      },
      { 
        email: "domiciliario@licorhub.com", 
        password: "domiciliario123", 
        name: "Domiciliario", 
        role: "domiciliario" 
      },
    ];
    
    console.log("Creando usuarios demo...");
    
    // Procesar cada usuario
    for (const user of demoUsers) {
      // Registrar en auth
      const { data, error } = await supabase.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true
      });
      
      if (error) {
        console.error(`Error creando usuario ${user.email}:`, error);
        continue;
      }
      
      if (!data.user) {
        console.error(`No se pudo crear el usuario ${user.email}`);
        continue;
      }
      
      // Insertar en la tabla users
      const { error: insertError } = await supabase
        .from('users')
        .insert([{
          id: data.user.id,
          email: user.email,
          password: user.password, // En producción, esto debería ser un hash
          name: user.name,
          role: user.role,
          address: user.address || null
        }]);
      
      if (insertError) {
        console.error(`Error insertando perfil para ${user.email}:`, insertError);
      } else {
        console.log(`Usuario ${user.email} creado correctamente.`);
      }
    }
    
    console.log("Configuración de usuarios demo completada.");
    
  } catch (error) {
    console.error("Error en setupDemoUsers:", error);
  }
};

// Ejecutar el script cuando se importe (solo en desarrollo)
if (process.env.NODE_ENV !== 'production') {
  setTimeout(() => {
    setupDemoUsers();
  }, 2000); // Dar tiempo a Supabase para inicializar
}
