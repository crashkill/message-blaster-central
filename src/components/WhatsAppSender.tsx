
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Upload, Send, MessageSquare, Users, Moon, Sun } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import InputMask from 'react-input-mask';

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
  const { toast } = useToast();

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

  const sendMessage = (contact: Contact) => {
    if (!message.trim()) {
      toast({
        title: "Mensagem vazia",
        description: "Por favor, digite uma mensagem antes de enviar.",
        variant: "destructive",
      });
      return;
    }

    const personalizedMessage = message.replace(/\{nome\}/g, contact.nome);
    const encodedMessage = encodeURIComponent(personalizedMessage);
    const whatsappUrl = `https://wa.me/${contact.telefone.replace('+', '')}?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
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
    
    for (let i = 0; i < contacts.length; i++) {
      sendMessage(contacts[i]);
      
      // Aguarda 3 segundos entre cada envio (exceto no último)
      if (i < contacts.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }

    setIsLoading(false);
    toast({
      title: "Envios iniciados!",
      description: `${contacts.length} abas do WhatsApp foram abertas.`,
    });
  };

  const sendIndividualMessage = () => {
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
      email: individualContact.email
    };

    sendMessage(contact);
    toast({
      title: "Mensagem enviada!",
      description: "WhatsApp Web foi aberto em uma nova aba.",
    });
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
              WhatsApp Sender
            </h1>
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

        {/* Message Composer */}
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
                    <InputMask
                      mask="(99) 99999-9999"
                      value={individualContact.telefone}
                      onChange={(e) => setIndividualContact({
                        ...individualContact,
                        telefone: e.target.value
                      })}
                    >
                      {(inputProps: any) => (
                        <Input
                          {...inputProps}
                          id="telefone"
                          placeholder="(11) 99999-9999"
                        />
                      )}
                    </InputMask>
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
              <Card>
                <CardHeader>
                  <CardTitle>Upload de Contatos</CardTitle>
                  <CardDescription>
                    Faça upload de um arquivo .xlsx ou .csv com as colunas: Nome, Telefone, E-mail
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                          <span className="font-semibold">Clique para fazer upload</span> ou arraste o arquivo
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          XLSX ou CSV (MAX. 10MB)
                        </p>
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept=".xlsx,.csv"
                        onChange={handleFileUpload}
                        disabled={isLoading}
                      />
                    </label>
                  </div>
                </CardContent>
              </Card>

              {/* Contacts Preview */}
              {contacts.length > 0 && (
                <Card>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle>Contatos Carregados</CardTitle>
                        <CardDescription>
                          Preview dos contatos que serão processados
                        </CardDescription>
                      </div>
                      <Badge variant="secondary" className="text-lg px-3 py-1">
                        {contacts.length} contatos
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border max-h-96 overflow-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Nome</TableHead>
                            <TableHead>Telefone</TableHead>
                            <TableHead>E-mail</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {contacts.map((contact, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium">{contact.nome}</TableCell>
                              <TableCell>{contact.telefone}</TableCell>
                              <TableCell>{contact.email || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="mt-4">
                      <Button 
                        onClick={sendBulkMessages}
                        className="w-full"
                        disabled={isLoading || !message.trim()}
                      >
                        {isLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4 mr-2" />
                            Enviar para todos os contatos
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default WhatsAppSender;
