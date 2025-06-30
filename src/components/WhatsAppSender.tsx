import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import QRCode from 'react-qr-code';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Upload, Send, MessageSquare, Users, Moon, Sun, Eye, X, Download, Wifi, WifiOff, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
// import InputMask from 'react-input-mask'; // Removido para eliminar warning findDOMNode
import TiltCard from '@/components/TiltCard';

interface Contact {
  nome: string;
  telefone: string;
  email?: string;
}

const WhatsAppSender = () => {
  const [activeTab, setActiveTab] = useState('individual');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [message, setMessage] = useState('');
  const [individualContact, setIndividualContact] = useState({
    nome: '',
    telefone: '',
    email: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Função para formatar telefone (substituindo react-input-mask)
  const formatPhone = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica formatação (XX) XXXXX-XXXX
    if (numbers.length <= 2) {
      return `(${numbers}`;
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    } else {
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setIndividualContact({
      ...individualContact,
      telefone: formatted
    });
  };
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const socket = io('http://localhost:3001');

    socket.on('connect', () => {
      console.log('Conectado ao servidor via Socket.io');
    });

    socket.on('qr', (qr) => {
      console.log('📱 QR Code recebido do servidor:', qr ? 'SIM' : 'NÃO');
      console.log('📱 QR Code length:', qr?.length || 0);
      setQrCode(qr);
      // Não abre automaticamente, apenas armazena o QR Code
    });
    
    socket.on('ready', () => {
      setIsModalOpen(false);
      toast({
        title: "Conectado!",
        description: "A Galatéia está pronta para enviar suas mensagens.",
        variant: "default",
      });
    });

    socket.on('status', (status) => {
        console.log('🔄 Status atualizado para:', status);
        setConnectionStatus(status);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleWhatsAppConnection = () => {
    console.log('🔍 Debug - connectionStatus:', connectionStatus);
    console.log('🔍 Debug - qrCode exists:', !!qrCode);
    console.log('🔍 Debug - qrCode length:', qrCode?.length || 0);
    
    if (connectionStatus === 'ready') {
      toast({
        title: "WhatsApp já conectado!",
        description: "Você já está conectado e pode enviar mensagens.",
        variant: "default",
      });
    } else if (qrCode) {
      console.log('✅ Abrindo modal do QR Code');
      setIsModalOpen(true);
    } else {
      console.log('⚠️ QR Code não disponível, solicitando geração...');
      // Força a abertura do modal mesmo sem QR Code para mostrar "Carregando..."
      setIsModalOpen(true);
      toast({
        title: "Aguardando QR Code...",
        description: "O servidor está gerando o código QR. Tente novamente em alguns segundos.",
        variant: "default",
      });
    }
  };

  const handleWhatsAppDisconnect = async () => {
    if (isDisconnecting) return; // Previne múltiplos cliques
    
    setIsDisconnecting(true);
    try {
      console.log('🔌 Desconectando WhatsApp...');
      
      const response = await fetch('http://localhost:3001/api/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        console.log('✅ WhatsApp desconectado com sucesso');
        toast({
          title: "WhatsApp desconectado!",
          description: data.message || "Você foi desconectado com sucesso. Clique em 'Conectar WhatsApp' para gerar um novo QR Code.",
          variant: "default",
        });
        setQrCode(null); // Limpa o QR Code atual
      } else {
        console.error('❌ Erro retornado pelo servidor:', data.error);
        toast({
          title: "Erro ao desconectar",
          description: data.error || "Falha ao desconectar do WhatsApp.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Erro ao desconectar:', error);
      
      // Verifica se é erro de conexão
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast({
          title: "Servidor Offline",
          description: "Não foi possível conectar ao servidor. Verifique se ele está rodando na porta 3001.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro de Comunicação",
          description: error.message || "Erro inesperado ao se comunicar com o servidor.",
          variant: "destructive",
        });
      }
    } finally {
      setIsDisconnecting(false);
    }
  };

  const normalizePhone = (phone: string): string => {
    // Remove todos os caracteres não numéricos
    const cleaned = phone.replace(/\D/g, '');
    
    // Se começar com 55, assume que já tem DDI
    if (cleaned.startsWith('55') && cleaned.length >= 12) {
      return `+${cleaned}`;
    }
    
    // Se tem 11 dígitos (DDD + 9 + 8 dígitos), adiciona +55
    if (cleaned.length === 11) {
      return `+55${cleaned}`;
    }
    
    // Se tem 10 dígitos (DDD + 8 dígitos), adiciona +55 e 9
    if (cleaned.length === 10) {
      return `+55${cleaned.slice(0, 2)}9${cleaned.slice(2)}`;
    }
    
    return phone;
  };

  const validatePhone = (phone: string): boolean => {
    const normalized = normalizePhone(phone);
    return /^\+55\d{11}$/.test(normalized);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      const processedContacts: Contact[] = jsonData.map((row: any) => ({
        nome: row.Nome || row.nome || '',
        telefone: normalizePhone(row.Telefone || row.telefone || ''),
        email: row.Email || row.email || row['E-mail'] || ''
      })).filter(contact => contact.nome && validatePhone(contact.telefone));

      setContacts(processedContacts);
      toast({
        title: "Arquivo carregado com sucesso!",
        description: `${processedContacts.length} contatos válidos encontrados.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao processar arquivo",
        description: "Verifique se o arquivo está no formato correto.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearContacts = () => {
    setContacts([]);
    toast({
      title: "Lista de contatos limpa",
      description: "Você pode carregar um novo arquivo.",
    });
  };

  const sendMessage = async (contact: Contact) => {
    if (!message.trim()) {
      toast({
        title: "Mensagem vazia",
        description: "Por favor, digite uma mensagem antes de enviar.",
        variant: "destructive",
      });
      return;
    }

    const personalizedMessage = message.replace(/\{nome\}/g, contact.nome);
    
    try {
      const response = await fetch('http://localhost:3001/api/send-message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: contact.telefone,
          message: personalizedMessage,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Falha ao enviar mensagem pelo servidor.');
      }

    } catch (error) {
      console.error("Erro ao chamar a API do servidor:", error);
      toast({
        title: "Erro de Comunicação",
        description: "Não foi possível conectar ao servidor para enviar a mensagem.",
        variant: "destructive",
      });
      // Para o loop em caso de erro de comunicação
      throw error;
    }
  };

  const sendBulkMessages = async () => {
    if (contacts.length === 0) {
      toast({
        title: "Nenhum contato",
        description: "Carregue uma lista de contatos primeiro.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    let sentCount = 0;
    
    for (let i = 0; i < contacts.length; i++) {
      try {
        await sendMessage(contacts[i]);
        sentCount++;
        // Aguarda um tempo para não sobrecarregar
        if (i < contacts.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 3000)); // 3 segundos de intervalo
        }
      } catch (error) {
        // O erro já foi mostrado no toast dentro de sendMessage
        // Paramos o envio em massa se um erro de comunicação ocorrer
        break; 
      }
    }

    setIsLoading(false);
    toast({
      title: "Envio em Massa Finalizado!",
      description: `${sentCount} de ${contacts.length} mensagens foram processadas pelo servidor.`,
    });
  };

  const sendIndividualMessage = async () => {
    if (!individualContact.nome || !individualContact.telefone) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e telefone são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    if (!validatePhone(individualContact.telefone)) {
      toast({
        title: "Telefone inválido",
        description: "Digite um número de telefone válido.",
        variant: "destructive",
      });
      return;
    }

    const contact: Contact = {
      nome: individualContact.nome,
      telefone: normalizePhone(individualContact.telefone),
      email: individualContact.email,
    };

    try {
      await sendMessage(contact);
      toast({
        title: "Mensagem Enviada!",
        description: "A mensagem foi enviada para o servidor para disparo.",
      });
    } catch (error) {
      // O erro já é tratado dentro da função sendMessage
    }
  };

  React.useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className={`min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4 transition-colors`}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Galatéia Sender
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                {connectionStatus === 'ready' && <Wifi className="h-5 w-5 text-green-500" />}
                {connectionStatus === 'connecting' && <Wifi className="h-5 w-5 text-yellow-500 animate-pulse" />}
                {connectionStatus === 'disconnected' && <WifiOff className="h-5 w-5 text-red-500" />}
                {connectionStatus === 'qr' && <Wifi className="h-5 w-5 text-blue-500" />}
                
                <span className="capitalize">
                    {connectionStatus === 'ready' ? 'Conectado' : 
                     connectionStatus === 'qr' ? 'Aguardando QR Code' : 
                     connectionStatus === 'auth_failure' ? 'Falha na Autenticação' :
                     connectionStatus === 'disconnected' ? 'Desconectado' : 'Conectando...'}
                </span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant={connectionStatus === 'ready' ? 'default' : 'outline'}
                size="sm"
                onClick={handleWhatsAppConnection}
                className="flex items-center gap-2"
              >
                {connectionStatus === 'ready' ? (
                  <>
                    <Wifi className="h-4 w-4" />
                    Conectado
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4" />
                    Conectar WhatsApp
                  </>
                )}
              </Button>
              
              {connectionStatus === 'ready' && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleWhatsAppDisconnect}
                  disabled={isDisconnecting}
                  className="flex items-center gap-2"
                >
                  {isDisconnecting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      Desconectando...
                    </>
                  ) : (
                    <>
                      <LogOut className="h-4 w-4" />
                      Desconectar
                    </>
                  )}
                </Button>
              )}
            </div>
            
            <Button
              variant="outline"
              size="icon"
              onClick={() => setDarkMode(!darkMode)}
              className="h-10 w-10"
            >
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Message Composer */}
        <TiltCard>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Compose sua mensagem
              </CardTitle>
              <CardDescription>
                Use {'{nome}'} para personalizar a mensagem com o nome do contato
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Textarea
                  placeholder="Olá {nome}, como vai? Esta é uma mensagem automática..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Use {'{nome}'} para personalização</span>
                  <span>{message.length}/1000 caracteres</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TiltCard>

        {/* Preview Section */}
        {contacts.length > 0 && (
          <Card className="mb-6 bg-blue-50 dark:bg-gray-800/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Pré-visualização
              </CardTitle>
              <CardDescription>
                Esta é uma prévia de como sua mensagem ficará para o primeiro contato: <strong>{contacts[0].nome}</strong>.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 border rounded-md bg-white dark:bg-gray-700 whitespace-pre-wrap">
                {message.replace(/\{nome\}/g, contacts[0].nome) || (
                  <span className="text-gray-500">Digite sua mensagem acima para ver a prévia.</span>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="individual" className="flex items-center gap-2">
              <Send className="h-4 w-4" />
              Envio Individual
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Envio em Massa
            </TabsTrigger>
          </TabsList>

          {/* Individual Send Tab */}
          <TabsContent value="individual">
            <Card>
              <CardHeader>
                <CardTitle>Envio Individual</CardTitle>
                <CardDescription>
                  Envie uma mensagem para um contato específico
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome *</Label>
                    <Input
                      id="nome"
                      placeholder="Digite o nome do contato"
                      value={individualContact.nome}
                      onChange={(e) => setIndividualContact({
                        ...individualContact,
                        nome: e.target.value
                      })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone *</Label>
                    <Input
                      id="telefone"
                      placeholder="(11) 99999-9999"
                      value={individualContact.telefone}
                      onChange={handlePhoneChange}
                      maxLength={15}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail (opcional)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@exemplo.com"
                    value={individualContact.email}
                    onChange={(e) => setIndividualContact({
                      ...individualContact,
                      email: e.target.value
                    })}
                  />
                </div>
                <Button 
                  onClick={sendIndividualMessage}
                  className="w-full"
                  disabled={!message.trim()}
                >
                  <Send className="h-4 w-4 mr-2" />
                  Enviar via WhatsApp
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bulk Send Tab */}
          <TabsContent value="bulk">
            <div className="space-y-6">
              {/* File Upload */}
              <TiltCard>
                <Card>
                  <CardHeader>
                    <CardTitle>Upload de Contatos</CardTitle>
                    <CardDescription>
                      Faça upload de um arquivo .xlsx com as colunas "Nome" e "Telefone".
                    </CardDescription>
                    <a href="/template_contatos.xlsx" download>
                      <Button variant="outline" size="sm" className="mt-2 flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        Baixar modelo da planilha
                      </Button>
                    </a>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-center w-full">
                        <Label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            <Upload className="w-8 h-8 mb-4 text-gray-500" />
                            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Clique para carregar</span> ou arraste e solte</p>
                            <p className="text-xs text-gray-500">XLSX, XLS ou CSV</p>
                          </div>
                          <Input id="file-upload" type="file" onChange={handleFileUpload} accept=".xlsx, .xls, .csv" className="hidden" />
                        </Label>
                      </div>

                      {contacts.length > 0 && (
                        <>
                          <div className="flex justify-between items-center mt-6 mb-2">
                            <h3 className="text-lg font-semibold">Contatos Carregados ({contacts.length})</h3>
                            <Button variant="ghost" size="sm" onClick={clearContacts} className="flex items-center gap-2">
                              <X className="h-4 w-4" />
                              Limpar Lista
                            </Button>
                          </div>
                          <div className="rounded-md border max-h-96 overflow-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Nome</TableHead>
                                  <TableHead>Telefone</TableHead>
                                  <TableHead>Status</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {contacts.map((contact, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{contact.nome}</TableCell>
                                    <TableCell>{contact.telefone}</TableCell>
                                    <TableCell>
                                      <Badge variant="secondary">
                                        Aguardando
                                      </Badge>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full flex items-center gap-2"
                      onClick={sendBulkMessages}
                      disabled={isLoading || contacts.length === 0}
                    >
                      {isLoading ? 'Enviando...' : `Enviar para ${contacts.length} contatos`}
                      <Send className="h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </TiltCard>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-600" />
              Conectar WhatsApp
            </DialogTitle>
            <DialogDescription>
              Para usar a Galatéia, você precisa conectar seu WhatsApp. Siga os passos:
              <br />
              <br />
              1. Abra o WhatsApp no seu celular
              <br />
              2. Vá em <strong>Configurações → Aparelhos conectados</strong>
              <br />
              3. Toque em <strong>"Conectar um aparelho"</strong>
              <br />
              4. Escaneie o QR Code abaixo
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center p-4 bg-white dark:bg-gray-100 rounded-lg">
            {qrCode ? (
              <QRCode value={qrCode} size={256} />
            ) : (
              <div className="flex items-center justify-center h-64 w-64 bg-gray-100 dark:bg-gray-200 rounded">
                <span className="text-gray-500">Carregando QR Code...</span>
              </div>
            )}
          </div>
          <div className="text-center text-sm text-gray-500">
            O QR Code é atualizado automaticamente para sua segurança
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WhatsAppSender;
