
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Wine } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';

// Esquema de validación para login
const authSchema = z.object({
  email: z.string().email({
    message: "Por favor ingresa un correo electrónico válido",
  }),
  password: z.string().min(6, {
    message: "La contraseña debe tener al menos 6 caracteres",
  }),
});

// Esquema de validación para registro
const registerSchema = z.object({
  name: z.string().min(3, {
    message: "El nombre debe tener al menos 3 caracteres",
  }),
  email: z.string().email({
    message: "Por favor ingresa un correo electrónico válido",
  }),
  password: z.string().min(6, {
    message: "La contraseña debe tener al menos 6 caracteres",
  }),
  address: z.string().min(10, {
    message: "Por favor ingresa una dirección válida",
  }),
});

type AuthValues = z.infer<typeof authSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { toast } = useToast();
  const { login, registerClient } = useAuth();

  // Inicializar formulario para login con react-hook-form y zod
  const loginForm = useForm<AuthValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // Inicializar formulario para registro con react-hook-form y zod
  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      address: '',
    },
  });

  const handleLogin = async (values: AuthValues) => {
    setIsLoading(true);
    try {
      await login(values.email, values.password);
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

  const handleRegister = async (values: RegisterValues) => {
    setIsLoading(true);
    try {
      await registerClient({
        email: values.email, 
        password: values.password,
        name: values.name,
        address: values.address
      });
    } catch (error: any) {
      console.error("Error de registro:", error);
      toast({
        title: "Error",
        description: error.message || "Ha ocurrido un error durante el registro",
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
              <Wine className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground">LiquiStock</h1>
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
          
          {isSignUp ? (
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(handleRegister)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={registerForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre Completo</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Tu nombre completo"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo Electrónico</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="ejemplo@liquistock.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Mínimo 6 caracteres"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={registerForm.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dirección de Entrega</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Dirección completa para entregas"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                
                <CardFooter className="flex flex-col space-y-4">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Procesando...' : 'Registrarse'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setIsSignUp(false)}
                  >
                    ¿Ya tienes una cuenta? Inicia sesión
                  </Button>
                </CardFooter>
              </form>
            </Form>
          ) : (
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(handleLogin)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo Electrónico</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="ejemplo@liquistock.com"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={loginForm.control}
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
                      oficinista@licorhub.com / oficinista123<br/>
                      bodeguero@licorhub.com / bodeguero123<br/>
                      domiciliario@licorhub.com / domiciliario123<br/>
                      cliente@licorhub.com / cliente123
                    </p>
                  </div>
                </CardContent>
                
                <CardFooter className="flex flex-col space-y-4">
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Procesando...' : 'Iniciar Sesión'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setIsSignUp(true)}
                  >
                    ¿No tienes una cuenta? Regístrate
                  </Button>
                </CardFooter>
              </form>
            </Form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Auth;
