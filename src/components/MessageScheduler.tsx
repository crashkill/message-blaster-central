import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Send, Trash2 } from 'lucide-react';

const MessageScheduler: React.FC = () => {
  const [scheduledMessages] = useState([
    {
      id: '1',
      recipient: 'Vanessa',
      message: 'Bom dia, meu amor! Como dormiu?',
      scheduledTime: '2024-01-20 07:00',
      status: 'pending'
    },
    {
      id: '2',
      recipient: 'Equipe',
      message: 'Reunião às 14h na sala de conferências',
      scheduledTime: '2024-01-20 13:30',
      status: 'sent'
    }
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Agendamento de Mensagens</h2>
        <p className="text-muted-foreground">
          Agende mensagens para serem enviadas automaticamente
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Nova Mensagem Agendada</span>
            </CardTitle>
            <CardDescription>
              Configure uma mensagem para ser enviada automaticamente
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Destinatário</Label>
              <Input placeholder="Nome ou número do contato" />
            </div>
            
            <div className="space-y-2">
              <Label>Mensagem</Label>
              <Textarea placeholder="Digite sua mensagem aqui..." rows={4} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data</Label>
                <Input type="date" />
              </div>
              <div className="space-y-2">
                <Label>Horário</Label>
                <Input type="time" />
              </div>
            </div>
            
            <Button className="w-full">
              <Clock className="w-4 h-4 mr-2" />
              Agendar Mensagem
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Send className="w-5 h-5" />
              <span>Mensagens Agendadas</span>
            </CardTitle>
            <CardDescription>
              Suas mensagens programadas para envio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {scheduledMessages.map((msg) => (
                <div key={msg.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm">{msg.recipient}</span>
                      <Badge variant={msg.status === 'sent' ? 'default' : 'secondary'}>
                        {msg.status === 'sent' ? 'Enviada' : 'Pendente'}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{msg.message}</p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{msg.scheduledTime}</span>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MessageScheduler; 