import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Bell, CheckCircle, XCircle, Info, Settings, Trash2, RefreshCw, Search, Clock, User } from 'lucide-react';
import { toast } from "sonner";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'system';
  read: boolean;
  timestamp: string;
  category: string;
  source?: string;
}

interface NotificationSettings {
  enableDesktop: boolean;
  enableSound: boolean;
  enableEmail: boolean;
  categories: {
    messages: boolean;
    system: boolean;
    errors: boolean;
    scheduling: boolean;
    connections: boolean;
  };
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

const NotificationCenter: React.FC = (): JSX.Element => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterRead, setFilterRead] = useState<string>('all');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [settings, setSettings] = useState<NotificationSettings>({
    enableDesktop: true,
    enableSound: true,
    enableEmail: false,
    categories: {
      messages: true,
      system: true,
      errors: true,
      scheduling: true,
      connections: true,
    },
    quietHours: {
      enabled: false,
      start: '22:00',
      end: '08:00'
    }
  });

  // Carregar notificações
  const loadNotifications = async () => {
    try {
      setLoading(true);
      
      const savedNotifications = localStorage.getItem('galateia_notifications');
      if (savedNotifications) {
        setNotifications(JSON.parse(savedNotifications));
      } else {
        const exampleNotifications: Notification[] = [
          {
            id: '1',
            title: 'WhatsApp Conectado',
            message: 'Conexão com WhatsApp Web estabelecida com sucesso',
            type: 'success',
            read: false,
            timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
            category: 'system',
            source: 'WhatsApp'
          },
          {
            id: '2',
            title: 'Mensagem Enviada',
            message: 'Mensagem para Fabrício foi entregue com sucesso',
            type: 'success',
            read: false,
            timestamp: new Date(Date.now() - 10 * 60000).toISOString(),
            category: 'messages',
            source: 'MessageSender'
          },
          {
            id: '3',
            title: 'Erro de Conexão',
            message: 'Falha temporária na conexão. Tentando reconectar...',
            type: 'warning',
            read: true,
            timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
            category: 'errors',
            source: 'System'
          },
          {
            id: '4',
            title: 'Mensagem Agendada',
            message: '3 mensagens foram agendadas para hoje às 19:30',
            type: 'info',
            read: false,
            timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
            category: 'scheduling',
            source: 'Scheduler'
          }
        ];
        setNotifications(exampleNotifications);
        localStorage.setItem('galateia_notifications', JSON.stringify(exampleNotifications));
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
      toast.error('Erro ao carregar notificações');
    } finally {
      setLoading(false);
    }
  };

  // Adicionar nova notificação
  const addNotification = (notificationData: Partial<Notification>) => {
    const newNotification: Notification = {
      id: Date.now().toString(),
      title: notificationData.title || 'Notificação',
      message: notificationData.message || '',
      type: notificationData.type || 'info',
      read: false,
      timestamp: new Date().toISOString(),
      category: notificationData.category || 'system',
      source: notificationData.source
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      localStorage.setItem('galateia_notifications', JSON.stringify(updated));
      return updated;
    });

    // Notificação desktop
    if (settings.enableDesktop && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(newNotification.title, {
          body: newNotification.message,
          icon: '/favicon.ico'
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(newNotification.title, {
              body: newNotification.message,
              icon: '/favicon.ico'
            });
          }
        });
      }
    }

    // Som
    if (settings.enableSound) {
      try {
        const audio = new Audio('/notification.mp3');
        audio.play().catch(() => {});
      } catch (error) {
        console.error('Erro ao reproduzir som:', error);
      }
    }
  };

  // Marcar como lida
  const markAsRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      );
      localStorage.setItem('galateia_notifications', JSON.stringify(updated));
      return updated;
    });
  };

  // Marcar todas como lidas
  const markAllAsRead = () => {
    setNotifications(prev => {
      const updated = prev.map(notif => ({ ...notif, read: true }));
      localStorage.setItem('galateia_notifications', JSON.stringify(updated));
      return updated;
    });
    toast.success('Todas as notificações foram marcadas como lidas');
  };

  // Deletar notificação
  const deleteNotification = (id: string) => {
    setNotifications(prev => {
      const updated = prev.filter(notif => notif.id !== id);
      localStorage.setItem('galateia_notifications', JSON.stringify(updated));
      return updated;
    });
    toast.success('Notificação removida');
  };

  // Limpar todas
  const clearAllNotifications = () => {
    setNotifications([]);
    localStorage.removeItem('galateia_notifications');
    toast.success('Todas as notificações foram removidas');
  };

  // Salvar configurações
  const saveSettings = () => {
    localStorage.setItem('galateia_notification_settings', JSON.stringify(settings));
    setIsSettingsOpen(false);
    toast.success('Configurações salvas com sucesso!');
  };

  // WebSocket para notificações em tempo real
  useEffect(() => {
    const connectWebSocket = () => {
      try {
        const ws = new WebSocket('ws://localhost:3001');
        
        ws.onopen = () => {
          console.log('🔔 Conectado ao sistema de notificações');
          addNotification({
            title: 'Sistema Conectado',
            message: 'Notificações em tempo real ativadas',
            type: 'system',
            category: 'connections'
          });
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'notification') {
              addNotification({
                title: data.title,
                message: data.message,
                type: data.notificationType || 'info',
                category: data.category || 'system',
                source: data.source
              });
            }
          } catch (error) {
            console.error('Erro ao processar notificação WebSocket:', error);
          }
        };

        ws.onclose = () => {
          console.log('🔔 Desconectado do sistema de notificações');
          setTimeout(connectWebSocket, 5000);
        };

        return ws;
      } catch (error) {
        console.error('Erro ao conectar WebSocket:', error);
        return null;
      }
    };

    const ws = connectWebSocket();
    
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, [settings]);

  // Carregar configurações e notificações
  useEffect(() => {
    const savedSettings = localStorage.getItem('galateia_notification_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    loadNotifications();
  }, []);

  // Filtrar notificações
  const filteredNotifications = notifications.filter(notif => {
    const matchesSearch = notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notif.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || notif.type === filterType;
    const matchesRead = filterRead === 'all' || 
                       (filterRead === 'unread' && !notif.read) ||
                       (filterRead === 'read' && notif.read);
    
    return matchesSearch && matchesType && matchesRead;
  });

  // Ícone por tipo
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'system': return <Settings className="w-5 h-5 text-blue-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  // Tempo relativo
  const getRelativeTime = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins}m atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    return `${diffDays}d atrás`;
  };

  const unreadCount = notifications.filter(notif => !notif.read).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="w-6 h-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Central de Notificações</h2>
        <p className="text-muted-foreground">
            Gerencie alertas e notificações do sistema em tempo real
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={loadNotifications} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{notifications.length}</div>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{unreadCount}</div>
            <p className="text-xs text-muted-foreground">Não Lidas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">
              {notifications.filter(n => n.type === 'success').length}
            </div>
            <p className="text-xs text-muted-foreground">Sucessos</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {notifications.filter(n => n.type === 'error').length}
            </div>
            <p className="text-xs text-muted-foreground">Erros</p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar notificações..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="success">Sucesso</SelectItem>
              <SelectItem value="error">Erro</SelectItem>
              <SelectItem value="warning">Aviso</SelectItem>
              <SelectItem value="info">Info</SelectItem>
              <SelectItem value="system">Sistema</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterRead} onValueChange={setFilterRead}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="unread">Não Lidas</SelectItem>
              <SelectItem value="read">Lidas</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline" size="sm">
              <CheckCircle className="w-4 h-4 mr-2" />
              Marcar Todas Lidas
            </Button>
          )}
          <Button onClick={clearAllNotifications} variant="outline" size="sm">
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar Todas
          </Button>
        </div>
      </div>

      {/* Lista de Notificações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Notificações ({filteredNotifications.length})</span>
          </CardTitle>
          <CardDescription>
            Suas notificações mais recentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>
                {searchTerm || filterType !== 'all' || filterRead !== 'all' 
                  ? 'Nenhuma notificação encontrada com esses filtros' 
                  : 'Nenhuma notificação ainda'}
              </p>
                </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredNotifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className={`flex items-start justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors ${
                    !notif.read ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3 flex-1">
                    {getNotificationIcon(notif.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-sm">{notif.title}</h4>
                {!notif.read && <Badge variant="secondary">Nova</Badge>}
                        <Badge variant="outline" className="text-xs">
                          {notif.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {notif.message}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{getRelativeTime(notif.timestamp)}</span>
                        </div>
                        {notif.source && (
                          <div className="flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span>{notif.source}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {!notif.read && (
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => markAsRead(notif.id)}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => deleteNotification(notif.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
              </div>
            ))}
          </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog Configurações */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configurações de Notificações</DialogTitle>
          </DialogHeader>
          <Tabs defaultValue="general">
            <TabsList>
              <TabsTrigger value="general">Geral</TabsTrigger>
              <TabsTrigger value="categories">Categorias</TabsTrigger>
              <TabsTrigger value="schedule">Horários</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Notificações Desktop</Label>
                    <p className="text-sm text-muted-foreground">
                      Mostrar notificações na área de trabalho
                    </p>
                  </div>
                  <Switch 
                    checked={settings.enableDesktop}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({...prev, enableDesktop: checked}))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Sons de Notificação</Label>
                    <p className="text-sm text-muted-foreground">
                      Reproduzir som ao receber notificações
                    </p>
                  </div>
                  <Switch 
                    checked={settings.enableSound}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({...prev, enableSound: checked}))
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Notificações por Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Enviar notificações importantes por email
                    </p>
                  </div>
                  <Switch 
                    checked={settings.enableEmail}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({...prev, enableEmail: checked}))
                    }
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="categories" className="space-y-4">
              <div className="space-y-4">
                {Object.entries(settings.categories).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <Label className="text-base capitalize">{key}</Label>
                      <p className="text-sm text-muted-foreground">
                        Notificações da categoria {key}
                      </p>
                    </div>
                    <Switch 
                      checked={value}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({
                          ...prev, 
                          categories: {...prev.categories, [key]: checked}
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Modo Silencioso</Label>
                    <p className="text-sm text-muted-foreground">
                      Desativar notificações em horários específicos
                    </p>
                  </div>
                  <Switch 
                    checked={settings.quietHours.enabled}
                    onCheckedChange={(checked) => 
                      setSettings(prev => ({
                        ...prev, 
                        quietHours: {...prev.quietHours, enabled: checked}
                      }))
                    }
                  />
                </div>

                {settings.quietHours.enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quietStart">Início</Label>
                      <Input
                        id="quietStart"
                        type="time"
                        value={settings.quietHours.start}
                        onChange={(e) => 
                          setSettings(prev => ({
                            ...prev, 
                            quietHours: {...prev.quietHours, start: e.target.value}
                          }))
                        }
                      />
                    </div>
                    <div>
                      <Label htmlFor="quietEnd">Fim</Label>
                      <Input
                        id="quietEnd"
                        type="time"
                        value={settings.quietHours.end}
                        onChange={(e) => 
                          setSettings(prev => ({
                            ...prev, 
                            quietHours: {...prev.quietHours, end: e.target.value}
                          }))
                        }
                      />
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-2 pt-4">
            <Button onClick={saveSettings} className="flex-1">
              Salvar Configurações
            </Button>
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
              Cancelar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotificationCenter; 