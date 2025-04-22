
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Package } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';

// Esquema de validación
const authSchema = z.object({
  email: z.string().email({
    message: "Por favor ingresa un correo electrónico válido",
  }),
  password: z.string().min(6, {
    message: "La contraseña debe tener al menos 6 caracteres",
  }),
});

type AuthValues = z.infer<typeof authSchema>;

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  // Inicializar formulario con react-hook-form y zod
  const form = useForm<AuthValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleSubmit = async (values: AuthValues) => {
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Como estamos usando localStorage, no podemos registrar nuevos usuarios
        toast({
          title: "Función no disponible",
          description: "El registro de nuevos usuarios no está disponible en el modo demo.",
          variant: "destructive",
        });
      } else {
        // Usar el hook de autenticación local
        await login(values.email, values.password);
      }
    } catch (error: any) {
      console.error("Error de autenticación:", error);
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error de autenticación",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary flex items-center justify-center">
              <Package className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">LicorHub</h1>
          <p className="text-muted-foreground mt-2">Sistema de Gestión de Inventarios</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{isSignUp ? 'Crear cuenta' : 'Iniciar Sesión'}</CardTitle>
            <CardDescription>
              {isSignUp 
                ? 'Ingresa tus datos para crear una cuenta nueva' 
                : 'Ingresa tus credenciales para acceder al sistema'}
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Electrónico</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="ejemplo@licorhub.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Usuarios de demostración */}
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  <p>Usuarios de demostración:</p>
                  <p className="mt-1">
                    admin@licorhub.com / admin123<br/>
                    cliente@licorhub.com / cliente123<br/>
                    bodeguero@licorhub.com / bodeguero123
                  </p>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Procesando...' : (isSignUp ? 'Registrarse' : 'Iniciar Sesión')}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={() => setIsSignUp(!isSignUp)}
                >
                  {isSignUp 
                    ? '¿Ya tienes una cuenta? Inicia sesión' 
                    : '¿No tienes una cuenta? Regístrate'}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
