
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash2, UserPlus } from "lucide-react";
import { useAuth, User } from "@/hooks/useAuth";

interface Role {
  id: string;
  name: string;
  badge: "default" | "outline" | "secondary" | "destructive";
}

const roles: Record<string, Role> = {
  admin: {
    id: "admin",
    name: "Administrador",
    badge: "default",
  },
  oficinista: {
    id: "oficinista",
    name: "Oficinista",
    badge: "secondary",
  },
  bodeguero: {
    id: "bodeguero",
    name: "Bodeguero",
    badge: "secondary",
  },
  domiciliario: {
    id: "domiciliario",
    name: "Domiciliario",
    badge: "secondary",
  },
  cliente: {
    id: "cliente",
    name: "Cliente",
    badge: "outline",
  },
};

export default function Users() {
  const { user, getAllUsers } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const fetchedUsers = await getAllUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [getAllUsers]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Gestión de Usuarios</h1>

      <div className="flex justify-between items-center mb-6">
        <p className="text-muted-foreground">Administre los usuarios del sistema.</p>
        <Button><UserPlus className="mr-2 h-4 w-4" /> Crear Usuario</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="todos">
            <TabsList>
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="admin">Administradores</TabsTrigger>
              <TabsTrigger value="oficinista">Oficinistas</TabsTrigger>
              <TabsTrigger value="bodeguero">Bodegueros</TabsTrigger>
              <TabsTrigger value="domiciliario">Domiciliarios</TabsTrigger>
              <TabsTrigger value="cliente">Clientes</TabsTrigger>
            </TabsList>

            {Object.keys(roles).map((roleKey) => (
              <TabsContent key={roleKey} value={roleKey}>
                <UserTable users={users.filter(u => u.role === roleKey)} isLoading={isLoading} />
              </TabsContent>
            ))}

            <TabsContent value="todos">
              <UserTable users={users} isLoading={isLoading} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function UserTable({ users, isLoading }: { users: User[], isLoading: boolean }) {
  if (isLoading) {
    return <div>Cargando usuarios...</div>;
  }

  return (
    <Table>
      <TableCaption>Lista de usuarios del sistema</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Rol</TableHead>
          <TableHead>Dirección</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users && users.length > 0 ? (
          users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant={roles[user.role]?.badge || "outline"}>
                  {roles[user.role]?.name || user.role}
                </Badge>
              </TableCell>
              <TableCell className="max-w-xs truncate">{user.address || 'N/A'}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <span className="sr-only">Abrir menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                    <DropdownMenuItem className="flex items-center cursor-pointer">
                      <Pencil className="mr-2 h-4 w-4" /> Editar
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="flex items-center text-destructive cursor-pointer">
                      <Trash2 className="mr-2 h-4 w-4" /> Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-4">
              No hay usuarios para mostrar
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
