import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Smartphone, Tablet, QrCode } from 'lucide-react';

const MobileVersion: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Versão Mobile</h2>
        <p className="text-muted-foreground">
          Acesse a Galatéia de qualquer lugar com nossa versão otimizada para dispositivos móveis
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Smartphone className="w-5 h-5" />
              <span>Interface Responsiva</span>
            </CardTitle>
            <CardDescription>
              Experiência otimizada para mobile
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium">Touch First</h4>
                  <p className="text-sm text-muted-foreground">Interface otimizada para touch</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <QrCode className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium">QR Login</h4>
                  <p className="text-sm text-muted-foreground">Login rápido via QR code</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Status de Desenvolvimento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Interface responsiva</span>
                <Badge variant="default">Concluído</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">PWA</span>
                <Badge variant="secondary">Em andamento</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">App nativo</span>
                <Badge variant="outline">Planejado</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MobileVersion; 