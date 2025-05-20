
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wine } from 'lucide-react';
import Logo from '@/components/Layout/Logo';
import { useToast } from '@/hooks/use-toast';

const Auth: React.FC = () => {
  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register state
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerAddress, setRegisterAddress] = useState('');
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLoginWithEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Primero necesitamos verificar las credenciales y obtener el ID de usuario
      const { data: users, error: findError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (findError || !users) {
        throw new Error('Usuario no encontrado');
      }

      if (users.password !== password) { // En producción, esto debería usar bcrypt para comparar hash
        throw new Error('Contraseña incorrecta');
      }

      // Iniciar sesión en Supabase Auth (para compatibilidad con auth.uid())
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      
      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Bienvenido",
        description: `Hola, ${users.name}`,
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error de autenticación",
        description: error.message || "Error al iniciar sesión",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Registrar al usuario en Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: registerEmail,
        password: registerPassword,
      });
      
      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error('Error al crear el usuario');
      }

      // Crear el perfil de usuario en nuestra tabla custom
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert([{
          id: authData.user.id,
          email: registerEmail,
          password: registerPassword, // En producción, esto debería ser un hash
          name: registerName,
          role: 'cliente',
          address: registerAddress,
        }])
        .select()
        .single();
      
      if (userError) {
        // Si hay error, eliminar el usuario auth que acabamos de crear
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw new Error('Error al crear el perfil de usuario: ' + userError.message);
      }

      toast({
        title: "Registro exitoso",
        description: `Bienvenido, ${registerName}`,
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Error de registro",
        description: error.message || "Hubo un problema al registrar el usuario",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="lg" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">LiquiStock</h1>
          <p className="text-muted-foreground mt-2">Sistema de Gestión de Inventarios</p>
        </div>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
            <TabsTrigger value="register">Registrarse</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Iniciar Sesión</CardTitle>
                <CardDescription>
                  Ingresa tus credenciales para acceder al sistema
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleLoginWithEmail}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="ejemplo@liquistock.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col">
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Cargando...' : 'Iniciar Sesión'}
                  </Button>
                  <div className="mt-4 text-center text-sm text-muted-foreground">
                    <p>Usuarios de demostración:</p>
                    <p className="mt-1">
                      admin@licorhub.com / admin123<br/>
                      oficinista@licorhub.com / oficinista123<br/>
                      bodeguero@licorhub.com / bodeguero123<br/>
                      domiciliario@licorhub.com / domiciliario123<br/>
                      cliente@licorhub.com / cliente123
                    </p>
                  </div>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
          
          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Registrarse</CardTitle>
                <CardDescription>
                  Crea una cuenta nueva como cliente
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSignUp}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name">Nombre Completo</Label>
                    <Input
                      id="register-name"
                      type="text"
                      placeholder="Juan Pérez"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Correo Electrónico</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="ejemplo@correo.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Contraseña</Label>
                    <Input
                      id="register-password"
                      type="password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-address">Dirección</Label>
                    <Input
                      id="register-address"
                      type="text"
                      placeholder="Calle Principal #123"
                      value={registerAddress}
                      onChange={(e) => setRegisterAddress(e.target.value)}
                      required
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? 'Cargando...' : 'Registrarse'}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
