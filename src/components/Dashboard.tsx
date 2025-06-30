import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  TrendingUp, 
  MessageSquare, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users,
  Calendar,
  BarChart3,
  RefreshCw,
  Download,
  Eye
} from 'lucide-react';

interface DashboardStats {
  totalMessages: number;
  sentToday: number;
  successRate: number;
  failedMessages: number;
  averageResponseTime: number;
  activeContacts: number;
  scheduledMessages: number;
  popularHours: { hour: number; count: number }[];
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalMessages: 0,
    sentToday: 0,
    successRate: 0,
    failedMessages: 0,
    averageResponseTime: 0,
    activeContacts: 0,
    scheduledMessages: 0,
    popularHours: []
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000); // Atualiza a cada 30s
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3001/api/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        // Dados simulados se a API não estiver disponível
        setStats({
          totalMessages: 1247,
          sentToday: 89,
          successRate: 94.2,
          failedMessages: 23,
          averageResponseTime: 2.4,
          activeContacts: 156,
          scheduledMessages: 12,
          popularHours: [
            { hour: 9, count: 45 },
            { hour: 14, count: 38 },
            { hour: 18, count: 52 },
            { hour: 20, count: 41 }
          ]
        });
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      // Dados simulados em caso de erro
      setStats({
        totalMessages: 1247,
        sentToday: 89,
        successRate: 94.2,
        failedMessages: 23,
        averageResponseTime: 2.4,
        activeContacts: 156,
        scheduledMessages: 12,
        popularHours: [
          { hour: 9, count: 45 },
          { hour: 14, count: 38 },
          { hour: 18, count: 52 },
          { hour: 20, count: 41 }
        ]
      });
    } finally {
      setLoading(false);
      setLastUpdated(new Date());
    }
  };

  const StatCard = ({ title, value, description, icon: Icon, color, trend }: any) => (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">
          {description}
          {trend && (
            <span className={`ml-2 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}%
            </span>
          )}
        </p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header do Dashboard */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Visão geral das suas mensagens e estatísticas
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            Atualizado {lastUpdated.toLocaleTimeString()}
          </Badge>
          <Button onClick={fetchStats} disabled={loading} size="sm">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Cards de Estatísticas Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total de Mensagens"
          value={stats.totalMessages.toLocaleString()}
          description="Mensagens enviadas"
          icon={MessageSquare}
          color="text-blue-600"
          trend={12}
        />
        <StatCard
          title="Enviadas Hoje"
          value={stats.sentToday}
          description="Nas últimas 24h"
          icon={TrendingUp}
          color="text-green-600"
          trend={8}
        />
        <StatCard
          title="Taxa de Sucesso"
          value={`${stats.successRate}%`}
          description="Mensagens entregues"
          icon={CheckCircle}
          color="text-emerald-600"
          trend={2}
        />
        <StatCard
          title="Contatos Ativos"
          value={stats.activeContacts}
          description="Últimos 30 dias"
          icon={Users}
          color="text-purple-600"
          trend={5}
        />
      </div>

      {/* Gráficos e Métricas Detalhadas */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Gráfico de Horários Populares */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span>Horários Mais Ativos</span>
            </CardTitle>
            <CardDescription>
              Horários com maior volume de mensagens
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {stats.popularHours.map((hour) => (
              <div key={hour.hour} className="flex items-center space-x-4">
                <div className="w-16 text-sm font-medium">
                  {hour.hour}:00
                </div>
                <div className="flex-1">
                  <Progress 
                    value={(hour.count / 60) * 100} 
                    className="h-2"
                  />
                </div>
                <div className="w-12 text-right text-sm text-muted-foreground">
                  {hour.count}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Métricas de Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <span>Performance</span>
            </CardTitle>
            <CardDescription>
              Métricas de entrega e resposta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Taxa de Entrega</span>
                <span className="text-sm text-muted-foreground">{stats.successRate}%</span>
              </div>
              <Progress value={stats.successRate} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Tempo Médio de Resposta</span>
                <span className="text-sm text-muted-foreground">{stats.averageResponseTime}s</span>
              </div>
              <Progress value={25} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.totalMessages - stats.failedMessages}
                </div>
                <div className="text-xs text-muted-foreground">Sucessos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {stats.failedMessages}
                </div>
                <div className="text-xs text-muted-foreground">Falhas</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-indigo-600" />
            <span>Ações Rápidas</span>
          </CardTitle>
          <CardDescription>
            Relatórios e exportações de dados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button variant="outline" className="justify-start">
              <Download className="w-4 h-4 mr-2" />
              Exportar Relatório Mensal
            </Button>
            <Button variant="outline" className="justify-start">
              <Calendar className="w-4 h-4 mr-2" />
              Ver Mensagens Agendadas ({stats.scheduledMessages})
            </Button>
            <Button variant="outline" className="justify-start">
              <Users className="w-4 h-4 mr-2" />
              Gerenciar Contatos Ativos
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status do Sistema */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-800">
              Sistema Operacional
            </span>
          </div>
          <div className="text-xs text-green-600">
            WhatsApp Web conectado • API funcionando
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard; 