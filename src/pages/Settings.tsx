
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon, Save, Building, Mail, Phone, MapPin, Globe, Bell, Shield, Database, Key } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Switch
} from '@/components/ui/switch';

const Settings: React.FC = () => {
  const [companySettings, setCompanySettings] = useState({
    name: 'LicorHub',
    legalName: 'LicorHub S.A.S.',
    taxId: '900.123.456-7',
    email: 'contacto@licorhub.com',
    phone: '+57 (1) 234-5678',
    address: 'Calle 123 #45-67, Bogotá, Colombia',
    website: 'www.licorhub.com'
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    lowStockAlerts: true,
    orderUpdates: true,
    marketingEmails: false,
    dailyReports: true,
    weeklyReports: true,
    monthlyReports: true
  });
  
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    passwordExpiration: '90',
    loginAttempts: '5',
    sessionTimeout: '30'
  });
  
  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    retentionPeriod: '30',
    backupTime: '02:00'
  });
  
  const { toast } = useToast();
  
  const handleCompanyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompanySettings({
      ...companySettings,
      [e.target.name]: e.target.value
    });
  };
  
  const handleNotificationToggle = (setting: keyof typeof notificationSettings) => {
    setNotificationSettings({
      ...notificationSettings,
      [setting]: !notificationSettings[setting]
    });
  };
  
  const handleSecurityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSecuritySettings({
      ...securitySettings,
      [e.target.name]: e.target.value
    });
  };

  const handleSecurityToggle = (setting: keyof typeof securitySettings) => {
    if (typeof securitySettings[setting] === 'boolean') {
      setSecuritySettings({
        ...securitySettings,
        [setting]: !securitySettings[setting]
      });
    }
  };
  
  const handleBackupToggle = (setting: keyof typeof backupSettings) => {
    if (typeof backupSettings[setting] === 'boolean') {
      setBackupSettings({
        ...backupSettings,
        [setting]: !backupSettings[setting]
      });
    }
  };
  
  const handleBackupChange = (key: keyof typeof backupSettings, value: string) => {
    setBackupSettings({
      ...backupSettings,
      [key]: value
    });
  };
  
  const saveSettings = (type: string) => {
    // Here you would normally save the settings to your database
    toast({
      title: "Configuración guardada",
      description: `La configuración de ${
        type === 'company' ? 'la empresa' : 
        type === 'notifications' ? 'notificaciones' : 
        type === 'security' ? 'seguridad' : 
        'copias de seguridad'
      } ha sido actualizada.`
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Configuración</h1>
        <p className="text-muted-foreground">
          Personaliza la configuración del sistema.
        </p>
      </div>
      
      <Tabs defaultValue="company" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full md:w-[600px]">
          <TabsTrigger value="company">
            <Building className="h-4 w-4 mr-2" />
            Empresa
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notificaciones
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            Seguridad
          </TabsTrigger>
          <TabsTrigger value="backup">
            <Database className="h-4 w-4 mr-2" />
            Respaldo
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Empresa</CardTitle>
              <CardDescription>
                Actualiza la información básica de tu empresa
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Comercial</Label>
                  <Input 
                    id="name" 
                    name="name"
                    value={companySettings.name}
                    onChange={handleCompanyChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="legalName">Razón Social</Label>
                  <Input 
                    id="legalName" 
                    name="legalName"
                    value={companySettings.legalName}
                    onChange={handleCompanyChange}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxId">NIT / RUT</Label>
                  <Input 
                    id="taxId" 
                    name="taxId"
                    value={companySettings.taxId}
                    onChange={handleCompanyChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <div className="flex">
                    <Phone className="h-4 w-4 mr-2 mt-3 text-muted-foreground" />
                    <Input 
                      id="phone" 
                      name="phone"
                      value={companySettings.phone}
                      onChange={handleCompanyChange}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Correo Electrónico</Label>
                <div className="flex">
                  <Mail className="h-4 w-4 mr-2 mt-3 text-muted-foreground" />
                  <Input 
                    id="email" 
                    name="email"
                    type="email"
                    value={companySettings.email}
                    onChange={handleCompanyChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="address">Dirección</Label>
                <div className="flex">
                  <MapPin className="h-4 w-4 mr-2 mt-3 text-muted-foreground flex-shrink-0" />
                  <Input 
                    id="address" 
                    name="address"
                    value={companySettings.address}
                    onChange={handleCompanyChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="website">Sitio Web</Label>
                <div className="flex">
                  <Globe className="h-4 w-4 mr-2 mt-3 text-muted-foreground" />
                  <Input 
                    id="website" 
                    name="website"
                    value={companySettings.website}
                    onChange={handleCompanyChange}
                  />
                </div>
              </div>
              
              <div className="pt-4">
                <Button onClick={() => saveSettings('company')}>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Notificaciones</CardTitle>
              <CardDescription>
                Personaliza cómo y cuándo recibir notificaciones
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notificaciones por Email</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="emailNotifications" className="font-medium">Notificaciones por Email</Label>
                      <p className="text-sm text-muted-foreground">Recibir todas las notificaciones por correo electrónico</p>
                    </div>
                    <Switch 
                      id="emailNotifications" 
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={() => handleNotificationToggle('emailNotifications')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="lowStockAlerts" className="font-medium">Alertas de Stock Bajo</Label>
                      <p className="text-sm text-muted-foreground">Notificaciones cuando el inventario esté por debajo del umbral</p>
                    </div>
                    <Switch 
                      id="lowStockAlerts" 
                      checked={notificationSettings.lowStockAlerts}
                      onCheckedChange={() => handleNotificationToggle('lowStockAlerts')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="orderUpdates" className="font-medium">Actualizaciones de Pedidos</Label>
                      <p className="text-sm text-muted-foreground">Notificaciones sobre cambios en el estado de los pedidos</p>
                    </div>
                    <Switch 
                      id="orderUpdates" 
                      checked={notificationSettings.orderUpdates}
                      onCheckedChange={() => handleNotificationToggle('orderUpdates')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="marketingEmails" className="font-medium">Emails de Marketing</Label>
                      <p className="text-sm text-muted-foreground">Recibir información sobre promociones y nuevos productos</p>
                    </div>
                    <Switch 
                      id="marketingEmails" 
                      checked={notificationSettings.marketingEmails}
                      onCheckedChange={() => handleNotificationToggle('marketingEmails')}
                    />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 pt-2 border-t">
                <h3 className="text-lg font-medium pt-2">Reportes Automáticos</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="dailyReports" className="font-medium">Reportes Diarios</Label>
                      <p className="text-sm text-muted-foreground">Recibir resúmenes diarios de ventas e inventario</p>
                    </div>
                    <Switch 
                      id="dailyReports" 
                      checked={notificationSettings.dailyReports}
                      onCheckedChange={() => handleNotificationToggle('dailyReports')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="weeklyReports" className="font-medium">Reportes Semanales</Label>
                      <p className="text-sm text-muted-foreground">Recibir análisis semanales de rendimiento</p>
                    </div>
                    <Switch 
                      id="weeklyReports" 
                      checked={notificationSettings.weeklyReports}
                      onCheckedChange={() => handleNotificationToggle('weeklyReports')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="monthlyReports" className="font-medium">Reportes Mensuales</Label>
                      <p className="text-sm text-muted-foreground">Recibir informes mensuales detallados</p>
                    </div>
                    <Switch 
                      id="monthlyReports" 
                      checked={notificationSettings.monthlyReports}
                      onCheckedChange={() => handleNotificationToggle('monthlyReports')}
                    />
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <Button onClick={() => saveSettings('notifications')}>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Seguridad</CardTitle>
              <CardDescription>
                Administra la seguridad y control de acceso al sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Autenticación</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="twoFactorAuth" className="font-medium">Autenticación de Dos Factores</Label>
                      <p className="text-sm text-muted-foreground">Requerir verificación adicional al iniciar sesión</p>
                    </div>
                    <Switch 
                      id="twoFactorAuth" 
                      checked={securitySettings.twoFactorAuth as boolean}
                      onCheckedChange={() => handleSecurityToggle('twoFactorAuth')}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="passwordExpiration">Expiración de Contraseña (días)</Label>
                      <Input 
                        id="passwordExpiration" 
                        name="passwordExpiration"
                        type="number"
                        value={securitySettings.passwordExpiration}
                        onChange={handleSecurityChange}
                      />
                      <p className="text-xs text-muted-foreground">Días antes de solicitar cambio de contraseña</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="loginAttempts">Intentos de Inicio de Sesión</Label>
                      <Input 
                        id="loginAttempts" 
                        name="loginAttempts"
                        type="number"
                        value={securitySettings.loginAttempts}
                        onChange={handleSecurityChange}
                      />
                      <p className="text-xs text-muted-foreground">Número de intentos antes de bloquear la cuenta</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 pt-2 border-t">
                <h3 className="text-lg font-medium pt-2">Sesiones</h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Tiempo de Inactividad (minutos)</Label>
                    <Input 
                      id="sessionTimeout" 
                      name="sessionTimeout"
                      type="number"
                      value={securitySettings.sessionTimeout}
                      onChange={handleSecurityChange}
                    />
                    <p className="text-xs text-muted-foreground">Minutos de inactividad antes de cerrar sesión automáticamente</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4 pt-2 border-t">
                <h3 className="text-lg font-medium pt-2">Contraseña Maestra</h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="masterPassword">Cambiar Contraseña Maestra</Label>
                    <div className="flex">
                      <Key className="h-4 w-4 mr-2 mt-3 text-muted-foreground" />
                      <Input 
                        id="masterPassword" 
                        type="password"
                        placeholder="Ingrese la nueva contraseña maestra"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Esta contraseña permite acceso de emergencia al sistema</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <Button onClick={() => saveSettings('security')}>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle>Configuración de Copias de Seguridad</CardTitle>
              <CardDescription>
                Administra las copias de seguridad automáticas del sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoBackup" className="font-medium">Copias de Seguridad Automáticas</Label>
                  <p className="text-sm text-muted-foreground">Realizar copias de seguridad de forma automática</p>
                </div>
                <Switch 
                  id="autoBackup" 
                  checked={backupSettings.autoBackup}
                  onCheckedChange={() => handleBackupToggle('autoBackup')}
                />
              </div>
              
              <div className="space-y-4 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="backupFrequency">Frecuencia</Label>
                    <Select 
                      value={backupSettings.backupFrequency} 
                      onValueChange={(value) => handleBackupChange('backupFrequency', value)}
                    >
                      <SelectTrigger id="backupFrequency">
                        <SelectValue placeholder="Seleccionar frecuencia" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Diaria</SelectItem>
                        <SelectItem value="weekly">Semanal</SelectItem>
                        <SelectItem value="monthly">Mensual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="backupTime">Hora de Ejecución</Label>
                    <Input 
                      id="backupTime" 
                      type="time"
                      value={backupSettings.backupTime}
                      onChange={(e) => handleBackupChange('backupTime', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Hora en formato 24 horas</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="retentionPeriod">Período de Retención (días)</Label>
                  <Input 
                    id="retentionPeriod" 
                    type="number"
                    value={backupSettings.retentionPeriod}
                    onChange={(e) => handleBackupChange('retentionPeriod', e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Número de días que se conservarán las copias de seguridad</p>
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium pt-2">Copia de Seguridad Manual</h3>
                <div className="space-y-3">
                  <Button variant="outline">
                    <Database className="mr-2 h-4 w-4" />
                    Crear Copia de Seguridad Ahora
                  </Button>
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-lg font-medium pt-2">Restaurar Copia de Seguridad</h3>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="restoreBackup">Seleccionar Copia de Seguridad</Label>
                    <Select>
                      <SelectTrigger id="restoreBackup">
                        <SelectValue placeholder="Seleccionar copia de seguridad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="backup-2024-04-20">Copia de seguridad (2024-04-20)</SelectItem>
                        <SelectItem value="backup-2024-04-19">Copia de seguridad (2024-04-19)</SelectItem>
                        <SelectItem value="backup-2024-04-18">Copia de seguridad (2024-04-18)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button variant="outline" className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700">
                    Restaurar Copia de Seguridad
                  </Button>
                </div>
              </div>
              
              <div className="pt-4">
                <Button onClick={() => saveSettings('backup')}>
                  <Save className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
