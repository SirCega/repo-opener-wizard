
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, PlusCircle, Filter, Users as UsersIcon, User, Shield, Mail, Lock } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

// Mock data for users
const usersData = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@licorhub.com",
    role: "admin",
    status: "activo",
    createdAt: "2024-01-10",
    lastLogin: "2024-04-20"
  },
  {
    id: 2,
    name: "Cliente Demo",
    email: "cliente@licorhub.com",
    role: "cliente",
    status: "activo",
    createdAt: "2024-01-15",
    lastLogin: "2024-04-18"
  },
  {
    id: 3,
    name: "Oficinista Demo",
    email: "oficinista@licorhub.com",
    role: "oficinista",
    status: "activo",
    createdAt: "2024-01-20",
    lastLogin: "2024-04-19"
  },
  {
    id: 4,
    name: "Bodeguero Demo",
    email: "bodeguero@licorhub.com",
    role: "bodeguero",
    status: "activo",
    createdAt: "2024-02-05",
    lastLogin: "2024-04-15"
  },
  {
    id: 5,
    name: "Domiciliario Demo",
    email: "domiciliario@licorhub.com",
    role: "domiciliario",
    status: "activo",
    createdAt: "2024-02-10",
    lastLogin: "2024-04-17"
  },
  {
    id: 6,
    name: "Juan Pérez",
    email: "juan@example.com",
    role: "cliente",
    status: "activo",
    createdAt: "2024-02-15",
    lastLogin: "2024-04-10"
  },
  {
    id: 7,
    name: "María López",
    email: "maria@example.com",
    role: "cliente",
    status: "inactivo",
    createdAt: "2024-02-20",
    lastLogin: "2024-03-15"
  },
  {
    id: 8,
    name: "Carlos Rodríguez",
    email: "carlos@example.com",
    role: "cliente",
    status: "activo",
    createdAt: "2024-03-01",
    lastLogin: "2024-04-05"
  },
  {
    id: 9,
    name: "Ana Martínez",
    email: "ana@example.com",
    role: "cliente",
    status: "activo",
    createdAt: "2024-03-10",
    lastLogin: "2024-04-12"
  },
  {
    id: 10,
    name: "Luis Torres",
    email: "luis@example.com",
    role: "domiciliario",
    status: "inactivo",
    createdAt: "2024-03-15",
    lastLogin: "2024-03-20"
  }
];

const Users: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isNewUserDialogOpen, setIsNewUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<typeof usersData[0] | null>(null);
  const { toast } = useToast();
  
  // New user form state
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: '',
    password: '',
    confirmPassword: ''
  });
  
  const filteredUsers = usersData.filter(user => 
    (searchQuery === '' || 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.email.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (roleFilter === 'all' || user.role === roleFilter) &&
    (statusFilter === 'all' || user.status === statusFilter)
  );

  // Count users by role
  const adminCount = usersData.filter(user => user.role === 'admin').length;
  const clienteCount = usersData.filter(user => user.role === 'cliente').length;
  const oficinistaCount = usersData.filter(user => user.role === 'oficinista').length;
  const bodegueroCount = usersData.filter(user => user.role === 'bodeguero').length;
  const domiciliarioCount = usersData.filter(user => user.role === 'domiciliario').length;
  
  const handleNewUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewUser({
      ...newUser,
      [e.target.name]: e.target.value
    });
  };

  const handleRoleChange = (value: string) => {
    setNewUser({
      ...newUser,
      role: value
    });
  };

  const handleCreateUser = () => {
    // Validation
    if (!newUser.name || !newUser.email || !newUser.role || !newUser.password) {
      toast({
        title: "Error",
        description: "Por favor complete todos los campos requeridos",
        variant: "destructive"
      });
      return;
    }

    if (newUser.password !== newUser.confirmPassword) {
      toast({
        title: "Error",
        description: "Las contraseñas no coinciden",
        variant: "destructive"
      });
      return;
    }

    // Here you would normally add the user to your database
    toast({
      title: "Usuario creado",
      description: `${newUser.name} ha sido agregado como ${newUser.role}`
    });

    // Reset form and close dialog
    setNewUser({
      name: '',
      email: '',
      role: '',
      password: '',
      confirmPassword: ''
    });
    setIsNewUserDialogOpen(false);
  };

  const editUser = (user: typeof usersData[0]) => {
    setCurrentUser(user);
    setIsEditUserDialogOpen(true);
  };

  const handleUpdateUser = () => {
    if (currentUser) {
      // Here you would normally update the user in your database
      toast({
        title: "Usuario actualizado",
        description: `${currentUser.name} ha sido actualizado correctamente`
      });
      setIsEditUserDialogOpen(false);
    }
  };

  const handleToggleUserStatus = (user: typeof usersData[0]) => {
    const newStatus = user.status === 'activo' ? 'inactivo' : 'activo';
    toast({
      title: "Estado actualizado",
      description: `${user.name} ha sido ${newStatus === 'activo' ? 'activado' : 'desactivado'}`
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'activo':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Activo</Badge>;
      case 'inactivo':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Inactivo</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">Administrador</Badge>;
      case 'cliente':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Cliente</Badge>;
      case 'oficinista':
        return <Badge variant="outline" className="bg-cyan-100 text-cyan-800 border-cyan-200">Oficinista</Badge>;
      case 'bodeguero':
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">Bodeguero</Badge>;
      case 'domiciliario':
        return <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200">Domiciliario</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Usuarios</h1>
        <p className="text-muted-foreground">
          Gestión de cuentas de usuario y permisos de acceso.
        </p>
      </div>

      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        <Card className="md:w-1/3">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Resumen de Usuarios</CardTitle>
            <CardDescription>Total de usuarios: {usersData.length}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Administradores</span>
                <span className="font-medium">{adminCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Clientes</span>
                <span className="font-medium">{clienteCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Oficinistas</span>
                <span className="font-medium">{oficinistaCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Bodegueros</span>
                <span className="font-medium">{bodegueroCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Domiciliarios</span>
                <span className="font-medium">{domiciliarioCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:w-2/3 bg-gradient-to-r from-primary/5 to-primary/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Actividad Reciente</CardTitle>
            <CardDescription>Últimos inicios de sesión</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {usersData
                .filter(user => user.status === 'activo')
                .sort((a, b) => new Date(b.lastLogin).getTime() - new Date(a.lastLogin).getTime())
                .slice(0, 3)
                .map((user) => (
                  <div key={user.id} className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                    <div className="text-sm text-right">
                      <p className="font-medium">Último acceso:</p>
                      <p className="text-muted-foreground">{new Date(user.lastLogin).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Gestión de Usuarios</CardTitle>
              <CardDescription>
                Administra cuentas de usuarios y sus permisos
              </CardDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Dialog open={isNewUserDialogOpen} onOpenChange={setIsNewUserDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Nuevo Usuario
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Crear Nuevo Usuario</DialogTitle>
                    <DialogDescription>
                      Complete los datos para crear una nueva cuenta de usuario
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Nombre Completo *</Label>
                      <Input 
                        id="name" 
                        name="name"
                        value={newUser.name}
                        onChange={handleNewUserChange}
                        placeholder="Ej: Juan Pérez"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="email">Correo Electrónico *</Label>
                      <Input 
                        id="email" 
                        name="email"
                        type="email"
                        value={newUser.email}
                        onChange={handleNewUserChange}
                        placeholder="Ej: juan@example.com"
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="role">Rol *</Label>
                      <Select value={newUser.role} onValueChange={handleRoleChange}>
                        <SelectTrigger id="role">
                          <SelectValue placeholder="Seleccionar rol" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrador</SelectItem>
                          <SelectItem value="cliente">Cliente</SelectItem>
                          <SelectItem value="oficinista">Oficinista</SelectItem>
                          <SelectItem value="bodeguero">Bodeguero</SelectItem>
                          <SelectItem value="domiciliario">Domiciliario</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="password">Contraseña *</Label>
                      <Input 
                        id="password" 
                        name="password"
                        type="password"
                        value={newUser.password}
                        onChange={handleNewUserChange}
                      />
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="confirmPassword">Confirmar Contraseña *</Label>
                      <Input 
                        id="confirmPassword" 
                        name="confirmPassword"
                        type="password"
                        value={newUser.confirmPassword}
                        onChange={handleNewUserChange}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsNewUserDialogOpen(false)}>Cancelar</Button>
                    <Button onClick={handleCreateUser}>Crear Usuario</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-4">
            <div className="flex flex-col space-y-2 md:flex-row md:space-y-0 md:space-x-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar usuario..."
                  className="pl-8 md:w-[300px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="md:w-[180px]">
                  <div className="flex items-center">
                    <Shield className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Rol" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="cliente">Cliente</SelectItem>
                  <SelectItem value="oficinista">Oficinista</SelectItem>
                  <SelectItem value="bodeguero">Bodeguero</SelectItem>
                  <SelectItem value="domiciliario">Domiciliario</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="md:w-[180px]">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Estado" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="inactivo">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
            
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Registro</TableHead>
                  <TableHead>Últ. Acceso</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {user.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <span>{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(user.lastLogin).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex justify-center space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => editUser(user)}
                          >
                            Editar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className={user.status === 'activo' ? 
                              "bg-red-50 hover:bg-red-100 border-red-200 text-red-700" : 
                              "bg-green-50 hover:bg-green-100 border-green-200 text-green-700"}
                            onClick={() => handleToggleUserStatus(user)}
                          >
                            {user.status === 'activo' ? 'Desactivar' : 'Activar'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                      No se encontraron usuarios que coincidan con la búsqueda.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="mt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">2</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      {/* Edit User Dialog */}
      <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
        <DialogContent>
          {currentUser && (
            <>
              <DialogHeader>
                <DialogTitle>Editar Usuario</DialogTitle>
                <DialogDescription>
                  Actualice la información del usuario
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-name">Nombre</Label>
                  <Input 
                    id="edit-name" 
                    value={currentUser.name}
                    onChange={(e) => setCurrentUser({...currentUser, name: e.target.value})}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-email">Correo Electrónico</Label>
                  <Input 
                    id="edit-email" 
                    type="email"
                    value={currentUser.email}
                    onChange={(e) => setCurrentUser({...currentUser, email: e.target.value})}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-role">Rol</Label>
                  <Select 
                    value={currentUser.role} 
                    onValueChange={(value) => setCurrentUser({...currentUser, role: value})}
                  >
                    <SelectTrigger id="edit-role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Administrador</SelectItem>
                      <SelectItem value="cliente">Cliente</SelectItem>
                      <SelectItem value="oficinista">Oficinista</SelectItem>
                      <SelectItem value="bodeguero">Bodeguero</SelectItem>
                      <SelectItem value="domiciliario">Domiciliario</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Estado</Label>
                  <Select 
                    value={currentUser.status} 
                    onValueChange={(value) => setCurrentUser({...currentUser, status: value})}
                  >
                    <SelectTrigger id="edit-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="activo">Activo</SelectItem>
                      <SelectItem value="inactivo">Inactivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex items-center space-x-2">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-sm font-medium">Cambio de Contraseña</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 mb-2">
                    Deje estos campos en blanco si no desea cambiar la contraseña
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="new-password">Nueva Contraseña</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="confirm-password">Confirmar Contraseña</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditUserDialogOpen(false)}>Cancelar</Button>
                <Button onClick={handleUpdateUser}>Guardar Cambios</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;
