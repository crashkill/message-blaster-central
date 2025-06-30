import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Send, Trash2, Plus, RefreshCw } from 'lucide-react';
import { toast } from "sonner";

interface ScheduledMessage {
  id: string;
  recipient: string;
  message: string;
  scheduledTime: string;
  status: 'pending' | 'sent' | 'failed';
  createdAt: string;
  sentAt?: string;
  failedAt?: string;
  error?: string;
}

interface ScheduledResponse {
  success: boolean;
  messages: ScheduledMessage[];
  total: number;
  pending: number;
}

const MessageScheduler: React.FC = () => {
  const [scheduledMessages, setScheduledMessages] = useState<ScheduledMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Estados do formulário
  const [recipient, setRecipient] = useState('');
  const [message, setMessage] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  // Função para carregar mensagens agendadas
  const loadScheduledMessages = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/scheduled');
      const data: ScheduledResponse = await response.json();
      
      if (data.success) {
        setScheduledMessages(data.messages);
      } else {
        toast.error('Erro ao carregar mensagens agendadas');
      }
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
      toast.error('Erro de conexão com o servidor');
    } finally {
      setLoading(false);
    }
  };

  // Função para agendar nova mensagem
  const handleScheduleMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipient || !message || !date || !time) {
      toast.error('Todos os campos são obrigatórios');
      return;
    }

    setSubmitting(true);

    try {
      // Combina data e hora no formato ISO (horário local brasileiro)
      const localDateTime = new Date(`${date}T${time}`);
      // Converte para ISO string mantendo o horário local
      const scheduledTime = localDateTime.toISOString();
      
      const response = await fetch('http://localhost:3001/api/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipient,
          message,
          scheduledTime
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Mensagem agendada com sucesso!');
        
        // Limpa o formulário
        setRecipient('');
        setMessage('');
        setDate('');
        setTime('');
        
        // Recarrega a lista
        loadScheduledMessages();
      } else {
        toast.error(data.error || 'Erro ao agendar mensagem');
      }
    } catch (error) {
      console.error('Erro ao agendar mensagem:', error);
      toast.error('Erro de conexão com o servidor');
    } finally {
      setSubmitting(false);
    }
  };

  // Função para deletar mensagem agendada
  const handleDeleteMessage = async (id: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/scheduled/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Mensagem deletada com sucesso!');
        loadScheduledMessages();
      } else {
        toast.error(data.error || 'Erro ao deletar mensagem');
      }
    } catch (error) {
      console.error('Erro ao deletar mensagem:', error);
      toast.error('Erro de conexão com o servidor');
    }
  };

  // Função para formatar data/hora para exibição
  const formatDateTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Função para definir valores padrão de data/hora (próxima hora)
  const setDefaultDateTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1); // Próxima hora
    now.setMinutes(0); // Minutos zerados
    
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 5);
    
    setDate(dateStr);
    setTime(timeStr);
  };

  // Carrega mensagens ao montar o componente
  useEffect(() => {
    loadScheduledMessages();
    setDefaultDateTime();
  }, []);

  // Filtra mensagens por status
  const pendingMessages = scheduledMessages.filter(msg => msg.status === 'pending');
  const sentMessages = scheduledMessages.filter(msg => msg.status === 'sent');
  const failedMessages = scheduledMessages.filter(msg => msg.status === 'failed');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Agendamento de Mensagens</h2>
        <p className="text-muted-foreground">
          Agende mensagens para serem enviadas automaticamente
        </p>
        </div>
        <Button onClick={loadScheduledMessages} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{pendingMessages.length}</div>
            <p className="text-xs text-muted-foreground">Pendentes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{sentMessages.length}</div>
            <p className="text-xs text-muted-foreground">Enviadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{failedMessages.length}</div>
            <p className="text-xs text-muted-foreground">Falharam</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{scheduledMessages.length}</div>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Formulário de Nova Mensagem */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Nova Mensagem Agendada</span>
            </CardTitle>
            <CardDescription>
              Configure uma mensagem para ser enviada automaticamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleScheduleMessage} className="space-y-4">
            <div className="space-y-2">
              <Label>Destinatário</Label>
                <Input 
                  placeholder="Nome ou número do contato (ex: 11999998888)"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
            </div>
            
            <div className="space-y-2">
              <Label>Mensagem</Label>
                <Textarea 
                  placeholder="Digite sua mensagem aqui..."
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data</Label>
                  <Input 
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
              </div>
              <div className="space-y-2">
                <Label>Horário</Label>
                  <Input 
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
              </div>
            </div>
            
              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
              <Clock className="w-4 h-4 mr-2" />
                )}
                {submitting ? 'Agendando...' : 'Agendar Mensagem'}
            </Button>
            </form>
          </CardContent>
        </Card>

        {/* Lista de Mensagens Agendadas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Send className="w-5 h-5" />
              <span>Mensagens Agendadas ({scheduledMessages.length})</span>
            </CardTitle>
            <CardDescription>
              Suas mensagens programadas para envio
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-6 h-6 animate-spin" />
              </div>
            ) : scheduledMessages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma mensagem agendada</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {scheduledMessages
                  .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime())
                  .map((msg) => (
                  <div key={msg.id} className="flex items-start justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-sm">{msg.recipient}</span>
                        <Badge variant={
                          msg.status === 'sent' ? 'default' : 
                          msg.status === 'failed' ? 'destructive' : 
                          'secondary'
                        }>
                          {msg.status === 'sent' ? 'Enviada' : 
                           msg.status === 'failed' ? 'Falhou' : 
                           'Pendente'}
                      </Badge>
                    </div>
                      <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                        {msg.message}
                      </p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                        <span>{formatDateTime(msg.scheduledTime)}</span>
                      </div>
                      {msg.error && (
                        <p className="text-xs text-red-600 mt-1">
                          Erro: {msg.error}
                        </p>
                      )}
                    </div>
                    {msg.status === 'pending' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteMessage(msg.id)}
                      >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                    )}
                </div>
              ))}
            </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MessageScheduler; 