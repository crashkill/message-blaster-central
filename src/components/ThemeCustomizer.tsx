import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Palette, Monitor, Smartphone, Moon, Sun, RefreshCw, Download, Upload, Save, RotateCcw, Settings, Database, Wifi, Shield, Clock, Bell, Zap } from 'lucide-react';
import { toast } from "sonner";

interface AppSettings {
  theme: {
    mode: 'light' | 'dark' | 'system';
    primaryColor: string;
    accentColor: string;
    borderRadius: number;
    fontSize: number;
    fontFamily: string;
    customCss: string;
  };
  system: {
    autoStart: boolean;
    minimizeToTray: boolean;
    enableTelemetry: boolean;
    checkUpdates: boolean;
    language: string;
    timezone: string;
    dateFormat: string;
    numberFormat: string;
  };
  whatsapp: {
    autoReconnect: boolean;
    sessionTimeout: number;
    maxRetries: number;
    enableWebhooks: boolean;
    webhookUrl: string;
    enableLogging: boolean;
    logLevel: string;
    qrCodeTimeout: number;
  };
  security: {
    enableEncryption: boolean;
    requireAuth: boolean;
    sessionExpiry: number;
    maxLoginAttempts: number;
    enableTwoFactor: boolean;
    allowedIPs: string[];
    enableAuditLog: boolean;
  };
  performance: {
    enableCache: boolean;
    cacheSize: number;
    enableCompression: boolean;
    maxConcurrentMessages: number;
    enableRateLimit: boolean;
    rateLimitPerMinute: number;
    enableCleanup: boolean;
    cleanupInterval: number;
  };
}

const ThemeCustomizer: React.FC = (): JSX.Element => {
  const [settings, setSettings] = useState<AppSettings>({
    theme: {
      mode: 'system',
      primaryColor: '#3b82f6',
      accentColor: '#10b981',
      borderRadius: 8,
      fontSize: 14,
      fontFamily: 'Inter',
      customCss: ''
    },
    system: {
      autoStart: false,
      minimizeToTray: true,
      enableTelemetry: false,
      checkUpdates: true,
      language: 'pt-BR',
      timezone: 'America/Sao_Paulo',
      dateFormat: 'DD/MM/YYYY',
      numberFormat: 'pt-BR'
    },
    whatsapp: {
      autoReconnect: true,
      sessionTimeout: 300,
      maxRetries: 5,
      enableWebhooks: false,
      webhookUrl: '',
      enableLogging: true,
      logLevel: 'info',
      qrCodeTimeout: 60
    },
    security: {
      enableEncryption: true,
      requireAuth: false,
      sessionExpiry: 24,
      maxLoginAttempts: 5,
      enableTwoFactor: false,
      allowedIPs: [],
      enableAuditLog: true
    },
    performance: {
      enableCache: true,
      cacheSize: 100,
      enableCompression: true,
      maxConcurrentMessages: 10,
      enableRateLimit: true,
      rateLimitPerMinute: 60,
      enableCleanup: true,
      cleanupInterval: 24
    }
  });

  const [loading, setLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);

  // Carregar configurações
  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Tentar carregar do backend
      try {
        const response = await fetch('http://localhost:3001/api/settings');
        if (response.ok) {
          const serverSettings = await response.json();
          setSettings(serverSettings);
        }
      } catch (error) {
        console.log('Usando configurações locais:', error);
      }

      // Fallback para localStorage
      const savedSettings = localStorage.getItem('galateia_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  // Salvar configurações
  const saveSettings = async () => {
    try {
      setLoading(true);

      // Salvar no localStorage
      localStorage.setItem('galateia_settings', JSON.stringify(settings));

      // Tentar salvar no backend
      try {
        await fetch('http://localhost:3001/api/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(settings)
        });
      } catch (error) {
        console.log('Erro ao salvar no backend, usando apenas localStorage');
      }

      // Aplicar tema imediatamente
      applyTheme();
      
      setHasChanges(false);
      toast.success('Configurações salvas com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setLoading(false);
    }
  };

  // Aplicar tema
  const applyTheme = () => {
    const root = document.documentElement;
    
    // Aplicar modo
    if (settings.theme.mode === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme.mode === 'light') {
      root.classList.remove('dark');
    } else {
      // System mode
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', isDark);
    }

    // Aplicar cores
    root.style.setProperty('--primary', settings.theme.primaryColor);
    root.style.setProperty('--accent', settings.theme.accentColor);
    root.style.setProperty('--radius', `${settings.theme.borderRadius}px`);
    root.style.setProperty('--font-size', `${settings.theme.fontSize}px`);
    root.style.setProperty('--font-family', settings.theme.fontFamily);

    // Aplicar CSS customizado
    let customStyleElement = document.getElementById('galateia-custom-styles');
    if (!customStyleElement) {
      customStyleElement = document.createElement('style');
      customStyleElement.id = 'galateia-custom-styles';
      document.head.appendChild(customStyleElement);
    }
    customStyleElement.textContent = settings.theme.customCss;
  };

  // Resetar configurações
  const resetSettings = () => {
    setSettings({
      theme: {
        mode: 'system',
        primaryColor: '#3b82f6',
        accentColor: '#10b981',
        borderRadius: 8,
        fontSize: 14,
        fontFamily: 'Inter',
        customCss: ''
      },
      system: {
        autoStart: false,
        minimizeToTray: true,
        enableTelemetry: false,
        checkUpdates: true,
        language: 'pt-BR',
        timezone: 'America/Sao_Paulo',
        dateFormat: 'DD/MM/YYYY',
        numberFormat: 'pt-BR'
      },
      whatsapp: {
        autoReconnect: true,
        sessionTimeout: 300,
        maxRetries: 5,
        enableWebhooks: false,
        webhookUrl: '',
        enableLogging: true,
        logLevel: 'info',
        qrCodeTimeout: 60
      },
      security: {
        enableEncryption: true,
        requireAuth: false,
        sessionExpiry: 24,
        maxLoginAttempts: 5,
        enableTwoFactor: false,
        allowedIPs: [],
        enableAuditLog: true
      },
      performance: {
        enableCache: true,
        cacheSize: 100,
        enableCompression: true,
        maxConcurrentMessages: 10,
        enableRateLimit: true,
        rateLimitPerMinute: 60,
        enableCleanup: true,
        cleanupInterval: 24
      }
    });
    setHasChanges(true);
    toast.success('Configurações resetadas para os valores padrão');
  };

  // Exportar configurações
  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `galateia-settings-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast.success('Configurações exportadas com sucesso!');
  };

  // Importar configurações
  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setSettings(imported);
        setHasChanges(true);
        toast.success('Configurações importadas com sucesso!');
      } catch (error) {
        toast.error('Erro ao importar configurações. Verifique o arquivo.');
      }
    };
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
  };

  // Carregar configurações ao montar
  useEffect(() => {
    loadSettings();
  }, []);

  // Aplicar tema quando settings mudam
  useEffect(() => {
    applyTheme();
  }, [settings.theme]);

  // Detectar mudanças
  useEffect(() => {
    const hasUnsavedChanges = JSON.stringify(settings) !== localStorage.getItem('galateia_settings');
    setHasChanges(hasUnsavedChanges);
  }, [settings]);

  const updateSettings = (section: keyof AppSettings, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [key]: value
      }
    }));
  };

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
          <h2 className="text-3xl font-bold tracking-tight">Configurações do Sistema</h2>
        <p className="text-muted-foreground">
            Personalize e configure o sistema Galatéia
          </p>
        </div>
        <div className="flex gap-2">
          <input
            type="file"
            accept=".json"
            onChange={importSettings}
            style={{ display: 'none' }}
            id="import-settings"
          />
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => document.getElementById('import-settings')?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Importar
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={exportSettings}
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm">
                <RotateCcw className="w-4 h-4 mr-2" />
                Resetar
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Resetar Configurações?</AlertDialogTitle>
                <AlertDialogDescription>
                  Isso irá restaurar todas as configurações para os valores padrão. Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={resetSettings}>
                  Resetar
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button 
            onClick={saveSettings} 
            disabled={!hasChanges || loading}
            className="relative"
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar
            {hasChanges && (
              <Badge className="absolute -top-2 -right-2 px-1 py-0 text-xs">
                •
              </Badge>
            )}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="theme" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="theme" className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Tema
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Monitor className="w-4 h-4" />
            Sistema
          </TabsTrigger>
          <TabsTrigger value="whatsapp" className="flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            WhatsApp
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Avançado
          </TabsTrigger>
        </TabsList>

        {/* Tema */}
        <TabsContent value="theme">
          <div className="grid gap-6">
        <Card>
          <CardHeader>
                <CardTitle>Aparência</CardTitle>
                <CardDescription>Customize a aparência da interface</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Modo de Tema</Label>
                  <Select
                    value={settings.theme.mode}
                    onValueChange={(value: 'light' | 'dark' | 'system') => 
                      updateSettings('theme', 'mode', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">
                        <div className="flex items-center gap-2">
                          <Sun className="w-4 h-4" />
                          Claro
                        </div>
                      </SelectItem>
                      <SelectItem value="dark">
                        <div className="flex items-center gap-2">
                          <Moon className="w-4 h-4" />
                          Escuro
                        </div>
                      </SelectItem>
                      <SelectItem value="system">
                        <div className="flex items-center gap-2">
                          <Monitor className="w-4 h-4" />
                          Sistema
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cor Principal</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.theme.primaryColor}
                        onChange={(e) => updateSettings('theme', 'primaryColor', e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={settings.theme.primaryColor}
                        onChange={(e) => updateSettings('theme', 'primaryColor', e.target.value)}
                        placeholder="#3b82f6"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Cor de Destaque</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={settings.theme.accentColor}
                        onChange={(e) => updateSettings('theme', 'accentColor', e.target.value)}
                        className="w-16 h-10 p-1"
                      />
                      <Input
                        value={settings.theme.accentColor}
                        onChange={(e) => updateSettings('theme', 'accentColor', e.target.value)}
                        placeholder="#10b981"
                      />
              </div>
              </div>
            </div>

                <div className="space-y-2">
                  <Label>Raio das Bordas: {settings.theme.borderRadius}px</Label>
                  <Slider
                    value={[settings.theme.borderRadius]}
                    onValueChange={([value]) => updateSettings('theme', 'borderRadius', value)}
                    max={20}
                    min={0}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Tamanho da Fonte: {settings.theme.fontSize}px</Label>
                  <Slider
                    value={[settings.theme.fontSize]}
                    onValueChange={([value]) => updateSettings('theme', 'fontSize', value)}
                    max={20}
                    min={10}
                    step={1}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Família da Fonte</Label>
                  <Select
                    value={settings.theme.fontFamily}
                    onValueChange={(value) => updateSettings('theme', 'fontFamily', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Open Sans">Open Sans</SelectItem>
                      <SelectItem value="Poppins">Poppins</SelectItem>
                      <SelectItem value="Montserrat">Montserrat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>CSS Customizado</Label>
                  <Textarea
                    value={settings.theme.customCss}
                    onChange={(e) => updateSettings('theme', 'customCss', e.target.value)}
                    placeholder="/* Seu CSS customizado aqui */
.custom-class {
  color: #ff0000;
}"
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Sistema */}
        <TabsContent value="system">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Configurações do Sistema</CardTitle>
                <CardDescription>Configure comportamentos gerais do sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Iniciar Automaticamente</Label>
                      <p className="text-sm text-muted-foreground">
                        Iniciar o sistema com o computador
                      </p>
                    </div>
                    <Switch
                      checked={settings.system.autoStart}
                      onCheckedChange={(checked) => updateSettings('system', 'autoStart', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Minimizar para Bandeja</Label>
                      <p className="text-sm text-muted-foreground">
                        Minimizar para a bandeja do sistema
                      </p>
                    </div>
                    <Switch
                      checked={settings.system.minimizeToTray}
                      onCheckedChange={(checked) => updateSettings('system', 'minimizeToTray', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Telemetria</Label>
                      <p className="text-sm text-muted-foreground">
                        Enviar dados de uso anônimos
                      </p>
                    </div>
                    <Switch
                      checked={settings.system.enableTelemetry}
                      onCheckedChange={(checked) => updateSettings('system', 'enableTelemetry', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Verificar Atualizações</Label>
                      <p className="text-sm text-muted-foreground">
                        Verificar atualizações automaticamente
                      </p>
                    </div>
                    <Switch
                      checked={settings.system.checkUpdates}
                      onCheckedChange={(checked) => updateSettings('system', 'checkUpdates', checked)}
                    />
              </div>
            </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Idioma</Label>
                    <Select
                      value={settings.system.language}
                      onValueChange={(value) => updateSettings('system', 'language', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                        <SelectItem value="en-US">English (US)</SelectItem>
                        <SelectItem value="es-ES">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Fuso Horário</Label>
                    <Select
                      value={settings.system.timezone}
                      onValueChange={(value) => updateSettings('system', 'timezone', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="America/Sao_Paulo">São Paulo (GMT-3)</SelectItem>
                        <SelectItem value="America/New_York">New York (GMT-5)</SelectItem>
                        <SelectItem value="Europe/London">London (GMT+0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Formato de Data</Label>
                    <Select
                      value={settings.system.dateFormat}
                      onValueChange={(value) => updateSettings('system', 'dateFormat', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Formato de Número</Label>
                    <Select
                      value={settings.system.numberFormat}
                      onValueChange={(value) => updateSettings('system', 'numberFormat', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt-BR">1.234,56 (BR)</SelectItem>
                        <SelectItem value="en-US">1,234.56 (US)</SelectItem>
                        <SelectItem value="de-DE">1.234,56 (DE)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
            </div>
          </CardContent>
        </Card>
          </div>
        </TabsContent>

        {/* WhatsApp */}
        <TabsContent value="whatsapp">
          <div className="grid gap-6">
        <Card>
          <CardHeader>
                <CardTitle>Configurações do WhatsApp</CardTitle>
                <CardDescription>Configure a conexão e comportamento do WhatsApp</CardDescription>
          </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Reconexão Automática</Label>
                      <p className="text-sm text-muted-foreground">
                        Reconectar automaticamente se a conexão cair
                      </p>
                    </div>
                    <Switch
                      checked={settings.whatsapp.autoReconnect}
                      onCheckedChange={(checked) => updateSettings('whatsapp', 'autoReconnect', checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Habilitar Webhooks</Label>
                      <p className="text-sm text-muted-foreground">
                        Enviar eventos para URL externa
                      </p>
                    </div>
                    <Switch
                      checked={settings.whatsapp.enableWebhooks}
                      onCheckedChange={(checked) => updateSettings('whatsapp', 'enableWebhooks', checked)}
                    />
                  </div>

                <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-base">Habilitar Logs</Label>
                      <p className="text-sm text-muted-foreground">
                        Registrar eventos do WhatsApp
                      </p>
                    </div>
                    <Switch
                      checked={settings.whatsapp.enableLogging}
                      onCheckedChange={(checked) => updateSettings('whatsapp', 'enableLogging', checked)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Timeout da Sessão (segundos)</Label>
                    <Input
                      type="number"
                      value={settings.whatsapp.sessionTimeout}
                      onChange={(e) => updateSettings('whatsapp', 'sessionTimeout', parseInt(e.target.value))}
                      min={60}
                      max={3600}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Máximo de Tentativas</Label>
                    <Input
                      type="number"
                      value={settings.whatsapp.maxRetries}
                      onChange={(e) => updateSettings('whatsapp', 'maxRetries', parseInt(e.target.value))}
                      min={1}
                      max={10}
                    />
                </div>
                
                <div className="space-y-2">
                    <Label>Timeout QR Code (segundos)</Label>
                    <Input
                      type="number"
                      value={settings.whatsapp.qrCodeTimeout}
                      onChange={(e) => updateSettings('whatsapp', 'qrCodeTimeout', parseInt(e.target.value))}
                      min={30}
                      max={300}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Nível de Log</Label>
                    <Select
                      value={settings.whatsapp.logLevel}
                      onValueChange={(value) => updateSettings('whatsapp', 'logLevel', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="error">Error</SelectItem>
                        <SelectItem value="warn">Warning</SelectItem>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="debug">Debug</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {settings.whatsapp.enableWebhooks && (
                  <div className="space-y-2">
                    <Label>URL do Webhook</Label>
                    <Input
                      value={settings.whatsapp.webhookUrl}
                      onChange={(e) => updateSettings('whatsapp', 'webhookUrl', e.target.value)}
                      placeholder="https://exemplo.com/webhook"
                    />
              </div>
                )}
          </CardContent>
        </Card>
      </div>
        </TabsContent>

        {/* Adicionar outras abas conforme necessário */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Segurança</CardTitle>
              <CardDescription>Configure aspectos de segurança do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Seção em desenvolvimento...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Performance</CardTitle>
              <CardDescription>Otimize o desempenho do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Seção em desenvolvimento...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Avançadas</CardTitle>
              <CardDescription>Configurações para usuários avançados</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Seção em desenvolvimento...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ThemeCustomizer; 