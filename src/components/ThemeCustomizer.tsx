import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Palette, Monitor, Sun, Moon, Download, RotateCcw } from 'lucide-react';

const ThemeCustomizer: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('default');

  const themes = [
    { id: 'default', name: 'Galatéia Padrão', color: '#3B82F6', description: 'Tema original da aplicação' },
    { id: 'purple', name: 'Amor Roxo', color: '#8B5CF6', description: 'Tema romântico em tons de roxo' },
    { id: 'green', name: 'Natureza', color: '#10B981', description: 'Tons verdes e naturais' },
    { id: 'orange', name: 'Energia', color: '#F59E0B', description: 'Vibrante e energético' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Personalização de Temas</h2>
        <p className="text-muted-foreground">
          Customize a aparência da Galatéia do seu jeito
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="w-5 h-5" />
              <span>Configurações de Aparência</span>
            </CardTitle>
            <CardDescription>
              Ajuste o modo escuro e outras preferências visuais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Modo Escuro</Label>
                <div className="text-sm text-muted-foreground">
                  Ative para reduzir o cansaço visual
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Sun className="w-4 h-4" />
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
                <Moon className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-base">Sistema de Cores</Label>
              <div className="grid grid-cols-2 gap-3">
                {themes.map((theme) => (
                  <div
                    key={theme.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      selectedTheme === theme.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedTheme(theme.id)}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: theme.color }}
                      />
                      <span className="font-medium text-sm">{theme.name}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{theme.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex space-x-2">
              <Button className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Salvar Tema
              </Button>
              <Button variant="outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Restaurar
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Monitor className="w-5 h-5" />
              <span>Pré-visualização</span>
            </CardTitle>
            <CardDescription>
              Veja como ficará sua personalização
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div 
              className={`p-4 rounded-lg border ${darkMode ? 'bg-gray-900 text-white' : 'bg-white'}`}
              style={{ 
                borderColor: themes.find(t => t.id === selectedTheme)?.color,
                borderWidth: '2px'
              }}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Galatéia Sender</h3>
                  <Badge style={{ backgroundColor: themes.find(t => t.id === selectedTheme)?.color }}>
                    Conectado
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="p-2 rounded bg-opacity-10" style={{ backgroundColor: themes.find(t => t.id === selectedTheme)?.color }}>
                    <div className="text-sm font-medium">Destinatário: Vanessa</div>
                    <div className="text-sm opacity-75">Última mensagem há 2 min</div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      style={{ backgroundColor: themes.find(t => t.id === selectedTheme)?.color }}
                    >
                      Enviar Mensagem
                    </Button>
                    <Button size="sm" variant="outline">
                      Agendar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ThemeCustomizer; 