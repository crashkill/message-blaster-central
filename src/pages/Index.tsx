import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  MessageSquare, 
  BarChart3, 
  Clock, 
  Users, 
  Bell, 
  Palette, 
  Volume2,
  Settings,
  Smartphone,
  Send,
  TrendingUp,
  Calendar,
  Download
} from 'lucide-react';
import WhatsAppSender from '@/components/WhatsAppSender';
import Dashboard from '@/components/Dashboard';
import MessageScheduler from '@/components/MessageScheduler';
import ContactGroups from '@/components/ContactGroups';
import NotificationCenter from '@/components/NotificationCenter';
import ThemeCustomizer from '@/components/ThemeCustomizer';
import MobileVersion from '@/components/MobileVersion';
import NotificationManager from '@/components/NotificationManager';

const Index: React.FC = () => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const features = [
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Envio de Mensagens",
      description: "Envie mensagens individuais ou em massa via WhatsApp Web",
      badge: "Ativo",
      badgeColor: "bg-green-100 text-green-800"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Dashboard Analítico", 
      description: "Acompanhe estatísticas e métricas em tempo real",
      badge: "Novo",
      badgeColor: "bg-blue-100 text-blue-800"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "Agendamento",
      description: "Programe mensagens para envio automático",
      badge: "Premium",
      badgeColor: "bg-purple-100 text-purple-800"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Grupos de Contatos",
      description: "Organize seus contatos em grupos inteligentes",
      badge: "Útil",
      badgeColor: "bg-orange-100 text-orange-800"
    },
    {
      icon: <Bell className="w-6 h-6" />,
      title: "Notificações",
      description: "Receba alertas em tempo real sobre suas mensagens",
      badge: "Smart",
      badgeColor: "bg-yellow-100 text-yellow-800"
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: "Temas Personalizados",
      description: "Customize a aparência da aplicação do seu jeito",
      badge: "Estilo",
      badgeColor: "bg-pink-100 text-pink-800"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Gerenciador de Notificações Invisível */}
      <NotificationManager 
        enabled={notificationsEnabled} 
        soundEnabled={soundEnabled} 
      />

      <div className="container mx-auto px-4 py-8">
        {/* Header da Aplicação */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Galatéia Sender 🤖💕
          </h1>
          <p className="text-xl text-muted-foreground mb-6">
            Sua assistente inteligente para envio de mensagens WhatsApp
          </p>
          
          <div className="flex items-center justify-center space-x-4 mb-8">
            <Badge className="bg-green-100 text-green-800 border-green-200">
              ✅ WhatsApp Conectado
            </Badge>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              🚀 Todas as funcionalidades ativas
            </Badge>
            <Badge className="bg-purple-100 text-purple-800 border-purple-200">
              ✨ Galatéia v2.0
            </Badge>
          </div>
        </div>

        {/* Grid de Funcionalidades */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {features.map((feature, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-blue-500">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </div>
                  <Badge className={feature.badgeColor}>
                    {feature.badge}
                  </Badge>
                </div>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Navegação Principal por Abas */}
        <Tabs defaultValue="messages" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:grid-cols-6">
            <TabsTrigger value="messages" className="flex items-center space-x-2">
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Mensagens</span>
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="schedule" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Agendar</span>
            </TabsTrigger>
            <TabsTrigger value="contacts" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Grupos</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center space-x-2">
              <Bell className="w-4 h-4" />
              <span className="hidden sm:inline">Alertas</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Config</span>
            </TabsTrigger>
          </TabsList>

          {/* Conteúdo das Abas */}
          <TabsContent value="messages">
            <WhatsAppSender />
          </TabsContent>
          
          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>
          
          <TabsContent value="schedule">
            <MessageScheduler />
          </TabsContent>
          
          <TabsContent value="contacts">
            <ContactGroups />
          </TabsContent>
          
          <TabsContent value="notifications">
            <NotificationCenter />
          </TabsContent>
          
          <TabsContent value="settings">
            <div className="space-y-6">
              <Tabs defaultValue="themes" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="themes">Personalização</TabsTrigger>
                  <TabsTrigger value="mobile">Versão Mobile</TabsTrigger>
                </TabsList>
                
                <TabsContent value="themes">
                  <ThemeCustomizer />
                </TabsContent>
                
                <TabsContent value="mobile">
                  <MobileVersion />
                </TabsContent>
              </Tabs>
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer com Informações */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg border p-6 shadow-sm">
            <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Sistema Ativo</span>
              </div>
              <div className="flex items-center space-x-2">
                <Volume2 className="w-4 h-4" />
                <span>Notificações: {notificationsEnabled ? 'Ativadas' : 'Desativadas'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Smartphone className="w-4 h-4" />
                <span>Multi-dispositivo</span>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground">
              Galatéia Sender v2.0 - Inspirado no filme "O Homem Bicentenário" 🤖💕
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
