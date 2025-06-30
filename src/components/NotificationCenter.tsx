import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell } from 'lucide-react';

const NotificationCenter: React.FC = () => {
  const [notifications] = useState([
    { id: '1', title: 'Mensagem Enviada', message: 'Mensagem para Vanessa foi entregue', read: false },
    { id: '2', title: 'Sistema', message: 'WhatsApp Web conectado com sucesso', read: true }
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Central de Notificações</h2>
        <p className="text-muted-foreground">
          Gerencie alertas e notificações do sistema
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Notificações Recentes</span>
          </CardTitle>
          <CardDescription>
            Suas notificações mais recentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {notifications.map((notif) => (
              <div key={notif.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <h4 className="font-medium">{notif.title}</h4>
                  <p className="text-sm text-muted-foreground">{notif.message}</p>
                </div>
                {!notif.read && <Badge variant="secondary">Nova</Badge>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationCenter; 