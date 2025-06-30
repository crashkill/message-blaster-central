import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Users, Plus, Search, Upload, Download, Send, Edit, Trash2, RefreshCw, UserPlus, MessageSquare, FileText, Filter, Calendar, BarChart3 } from 'lucide-react';
import { toast } from "sonner";

interface Contact {
  id: string;
  name: string;
  phone: string;
  email?: string;
  tags: string[];
  lastContact?: string;
  status: 'active' | 'inactive' | 'blocked';
  notes?: string;
  addedAt: string;
}

interface ContactGroup {
  id: string;
  name: string;
  description: string;
  contacts: Contact[];
  createdAt: string;
  updatedAt: string;
  tags: string[];
  color: string;
  isActive: boolean;
}

interface BulkMessage {
  id: string;
  groupId: string;
  message: string;
  sentAt: string;
  status: 'pending' | 'sending' | 'sent' | 'failed';
  recipients: number;
  delivered: number;
  failed: number;
}

const ContactGroups: React.FC = (): JSX.Element => {
  const [groups, setGroups] = useState<ContactGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<ContactGroup | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  
  // Dialogs
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [isBulkMessageDialogOpen, setIsBulkMessageDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  
  // Forms
  const [groupForm, setGroupForm] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
    tags: ''
  });
  
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    email: '',
    tags: '',
    notes: ''
  });
  
  const [bulkMessageForm, setBulkMessageForm] = useState({
    message: '',
    selectedContacts: [] as string[]
  });

  const [editingGroup, setEditingGroup] = useState<ContactGroup | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  // Carregar grupos
  const loadGroups = async () => {
    try {
      setLoading(true);
      
      const savedGroups = localStorage.getItem('galateia_contact_groups');
      if (savedGroups) {
        setGroups(JSON.parse(savedGroups));
      } else {
        // Dados de exemplo
        const exampleGroups: ContactGroup[] = [
          {
            id: '1',
            name: 'Clientes VIP',
            description: 'Clientes premium com alta prioridade',
            color: '#10b981',
            tags: ['vip', 'premium'],
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            contacts: [
              {
                id: '1',
                name: 'Fabrício Lima',
                phone: '11996723582',
                email: 'fabricio@example.com',
                tags: ['vip', 'developer'],
                status: 'active',
                addedAt: new Date().toISOString(),
                notes: 'Desenvolvedor principal do projeto'
              },
              {
                id: '2',
                name: 'Ana Silva',
                phone: '11987654321',
                email: 'ana@example.com',
                tags: ['vip', 'designer'],
                status: 'active',
                addedAt: new Date().toISOString(),
                notes: 'Designer UI/UX experiente'
              }
            ]
          },
          {
            id: '2',
            name: 'Prospects',
            description: 'Potenciais clientes para conversão',
            color: '#f59e0b',
            tags: ['prospect', 'lead'],
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            contacts: [
              {
                id: '3',
                name: 'João Santos',
                phone: '11912345678',
                tags: ['prospect'],
                status: 'active',
                addedAt: new Date().toISOString()
              }
            ]
          }
        ];
        setGroups(exampleGroups);
        localStorage.setItem('galateia_contact_groups', JSON.stringify(exampleGroups));
      }
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
      toast.error('Erro ao carregar grupos de contatos');
    } finally {
      setLoading(false);
    }
  };

  // Salvar grupos
  const saveGroups = (updatedGroups: ContactGroup[]) => {
    setGroups(updatedGroups);
    localStorage.setItem('galateia_contact_groups', JSON.stringify(updatedGroups));
  };

  // Criar/Editar grupo
  const handleSaveGroup = () => {
    if (!groupForm.name.trim()) {
      toast.error('Nome do grupo é obrigatório');
      return;
    }

    const now = new Date().toISOString();
    const groupData: ContactGroup = {
      id: editingGroup?.id || Date.now().toString(),
      name: groupForm.name,
      description: groupForm.description,
      color: groupForm.color,
      tags: groupForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      isActive: true,
      createdAt: editingGroup?.createdAt || now,
      updatedAt: now,
      contacts: editingGroup?.contacts || []
    };

    const updatedGroups = editingGroup
      ? groups.map(group => group.id === editingGroup.id ? groupData : group)
      : [...groups, groupData];

    saveGroups(updatedGroups);
    
    setGroupForm({ name: '', description: '', color: '#3b82f6', tags: '' });
    setEditingGroup(null);
    setIsGroupDialogOpen(false);
    
    toast.success(editingGroup ? 'Grupo atualizado!' : 'Grupo criado!');
  };

  // Deletar grupo
  const handleDeleteGroup = (groupId: string) => {
    const updatedGroups = groups.filter(group => group.id !== groupId);
    saveGroups(updatedGroups);
    if (selectedGroup?.id === groupId) {
      setSelectedGroup(null);
    }
    toast.success('Grupo removido!');
  };

  // Criar/Editar contato
  const handleSaveContact = () => {
    if (!contactForm.name.trim() || !contactForm.phone.trim()) {
      toast.error('Nome e telefone são obrigatórios');
      return;
    }

    if (!selectedGroup) {
      toast.error('Selecione um grupo primeiro');
      return;
    }

    const now = new Date().toISOString();
    const contactData: Contact = {
      id: editingContact?.id || Date.now().toString(),
      name: contactForm.name,
      phone: contactForm.phone,
      email: contactForm.email || undefined,
      tags: contactForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      status: 'active',
      addedAt: editingContact?.addedAt || now,
      notes: contactForm.notes || undefined
    };

    const updatedGroups = groups.map(group => {
      if (group.id === selectedGroup.id) {
        const updatedContacts = editingContact
          ? group.contacts.map(contact => contact.id === editingContact.id ? contactData : contact)
          : [...group.contacts, contactData];
        
        return { ...group, contacts: updatedContacts, updatedAt: now };
      }
      return group;
    });

    saveGroups(updatedGroups);
    
    // Atualizar grupo selecionado
    const updatedSelectedGroup = updatedGroups.find(g => g.id === selectedGroup.id);
    if (updatedSelectedGroup) {
      setSelectedGroup(updatedSelectedGroup);
    }
    
    setContactForm({ name: '', phone: '', email: '', tags: '', notes: '' });
    setEditingContact(null);
    setIsContactDialogOpen(false);
    
    toast.success(editingContact ? 'Contato atualizado!' : 'Contato adicionado!');
  };

  // Deletar contato
  const handleDeleteContact = (contactId: string) => {
    if (!selectedGroup) return;

    const updatedGroups = groups.map(group => {
      if (group.id === selectedGroup.id) {
        return {
          ...group,
          contacts: group.contacts.filter(contact => contact.id !== contactId),
          updatedAt: new Date().toISOString()
        };
      }
      return group;
    });

    saveGroups(updatedGroups);
    
    const updatedSelectedGroup = updatedGroups.find(g => g.id === selectedGroup.id);
    if (updatedSelectedGroup) {
      setSelectedGroup(updatedSelectedGroup);
    }
    
    toast.success('Contato removido!');
  };

  // Enviar mensagem em lote
  const handleSendBulkMessage = async () => {
    if (!bulkMessageForm.message.trim()) {
      toast.error('Mensagem é obrigatória');
      return;
    }

    if (bulkMessageForm.selectedContacts.length === 0) {
      toast.error('Selecione pelo menos um contato');
      return;
    }

    try {
      const promises = bulkMessageForm.selectedContacts.map(async (contactId) => {
        const contact = selectedGroup?.contacts.find(c => c.id === contactId);
        if (!contact) return;

        const response = await fetch('http://localhost:3001/api/send-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: contact.phone,
            message: bulkMessageForm.message.replace('{{nome}}', contact.name)
          })
        });

        return { contact, success: response.ok };
      });

      const results = await Promise.all(promises);
      const successful = results.filter(r => r?.success).length;
      const failed = results.length - successful;

      toast.success(`Mensagens enviadas: ${successful} sucesso, ${failed} falhas`);
      
      setBulkMessageForm({ message: '', selectedContacts: [] });
      setIsBulkMessageDialogOpen(false);
    } catch (error) {
      console.error('Erro ao enviar mensagens:', error);
      toast.error('Erro ao enviar mensagens em lote');
    }
  };

  // Importar contatos CSV
  const handleImportContacts = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedGroup) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const newContacts: Contact[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          const nameIndex = headers.findIndex(h => h.includes('nome') || h.includes('name'));
          const phoneIndex = headers.findIndex(h => h.includes('telefone') || h.includes('phone'));
          const emailIndex = headers.findIndex(h => h.includes('email'));
          
          if (nameIndex >= 0 && phoneIndex >= 0 && values[nameIndex] && values[phoneIndex]) {
            newContacts.push({
              id: Date.now() + i + '',
              name: values[nameIndex],
              phone: values[phoneIndex],
              email: emailIndex >= 0 ? values[emailIndex] : undefined,
              tags: [],
              status: 'active',
              addedAt: new Date().toISOString()
            });
          }
        }

        if (newContacts.length > 0) {
          const updatedGroups = groups.map(group => {
            if (group.id === selectedGroup.id) {
              return {
                ...group,
                contacts: [...group.contacts, ...newContacts],
                updatedAt: new Date().toISOString()
              };
            }
            return group;
          });

          saveGroups(updatedGroups);
          
          const updatedSelectedGroup = updatedGroups.find(g => g.id === selectedGroup.id);
          if (updatedSelectedGroup) {
            setSelectedGroup(updatedSelectedGroup);
          }
          
          toast.success(`${newContacts.length} contatos importados!`);
        } else {
          toast.error('Nenhum contato válido encontrado no arquivo');
        }
      } catch (error) {
        toast.error('Erro ao processar arquivo CSV');
      }
    };
    
    reader.readAsText(file);
    event.target.value = '';
    setIsImportDialogOpen(false);
  };

  // Exportar contatos
  const handleExportContacts = () => {
    if (!selectedGroup || selectedGroup.contacts.length === 0) {
      toast.error('Nenhum contato para exportar');
      return;
    }

    const csvContent = [
      'Nome,Telefone,Email,Tags,Status,Notas',
      ...selectedGroup.contacts.map(contact =>
        `"${contact.name}","${contact.phone}","${contact.email || ''}","${contact.tags.join(';')}","${contact.status}","${contact.notes || ''}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${selectedGroup.name}-contatos.csv`;
    link.click();
    
    toast.success('Contatos exportados!');
  };

  // Filtrar contatos
  const filteredContacts = selectedGroup?.contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.phone.includes(searchTerm);
    const matchesStatus = filterStatus === 'all' || contact.status === filterStatus;
    return matchesSearch && matchesStatus;
  }) || [];

  useEffect(() => {
    loadGroups();
  }, []);

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
        <h2 className="text-3xl font-bold tracking-tight">Grupos de Contatos</h2>
        <p className="text-muted-foreground">
            Organize e gerencie seus contatos por grupos
        </p>
      </div>
        <div className="flex gap-2">
          <Button onClick={loadGroups} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingGroup(null);
                  setGroupForm({ name: '', description: '', color: '#3b82f6', tags: '' });
                }}
              >
          <Plus className="w-4 h-4 mr-2" />
          Novo Grupo
        </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Grupos */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                <span>Grupos ({groups.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                      selectedGroup?.id === group.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => setSelectedGroup(group)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: group.color }}
                        />
                        <span className="font-medium text-sm">{group.name}</span>
                      </div>
                      <div className="flex space-x-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingGroup(group);
                            setGroupForm({
                              name: group.name,
                              description: group.description,
                              color: group.color,
                              tags: group.tags.join(', ')
                            });
                            setIsGroupDialogOpen(true);
                          }}
                        >
                          <Edit className="w-3 h-3" />
                </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Trash2 className="w-3 h-3" />
                </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Deletar Grupo?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta ação não pode ser desfeita. Todos os contatos deste grupo serão perdidos.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteGroup(group.id)}>
                                Deletar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {group.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="text-xs">
                        {group.contacts.length} contatos
                      </Badge>
                      <div className="flex space-x-1">
                        {group.tags.slice(0, 2).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {group.tags.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{group.tags.length - 2}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detalhes do Grupo */}
        <div className="lg:col-span-2">
          {selectedGroup ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: selectedGroup.color }}
                    />
                    <div>
                      <CardTitle>{selectedGroup.name}</CardTitle>
                      <CardDescription>{selectedGroup.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleExportContacts}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Exportar
                    </Button>
                    <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Upload className="w-4 h-4 mr-2" />
                          Importar
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                    <Dialog open={isBulkMessageDialogOpen} onOpenChange={setIsBulkMessageDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Mensagem em Lote
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                    <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          onClick={() => {
                            setEditingContact(null);
                            setContactForm({ name: '', phone: '', email: '', tags: '', notes: '' });
                          }}
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Adicionar Contato
                        </Button>
                      </DialogTrigger>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Estatísticas */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedGroup.contacts.length}
                    </div>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedGroup.contacts.filter(c => c.status === 'active').length}
                    </div>
                    <p className="text-xs text-muted-foreground">Ativos</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {selectedGroup.contacts.filter(c => c.status === 'inactive').length}
                    </div>
                    <p className="text-xs text-muted-foreground">Inativos</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {selectedGroup.contacts.filter(c => c.status === 'blocked').length}
                    </div>
                    <p className="text-xs text-muted-foreground">Bloqueados</p>
                  </div>
                </div>

                {/* Filtros */}
                <div className="flex gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar contatos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="active">Ativos</SelectItem>
                      <SelectItem value="inactive">Inativos</SelectItem>
                      <SelectItem value="blocked">Bloqueados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Lista de Contatos */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredContacts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhum contato encontrado</p>
                    </div>
                  ) : (
                    filteredContacts.map((contact) => (
                      <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            checked={bulkMessageForm.selectedContacts.includes(contact.id)}
                            onCheckedChange={(checked) => {
                              setBulkMessageForm(prev => ({
                                ...prev,
                                selectedContacts: checked
                                  ? [...prev.selectedContacts, contact.id]
                                  : prev.selectedContacts.filter(id => id !== contact.id)
                              }));
                            }}
                          />
                          <div>
                            <h4 className="font-medium text-sm">{contact.name}</h4>
                            <p className="text-xs text-muted-foreground">{contact.phone}</p>
                            {contact.email && (
                              <p className="text-xs text-muted-foreground">{contact.email}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge
                            variant={contact.status === 'active' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {contact.status}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingContact(contact);
                              setContactForm({
                                name: contact.name,
                                phone: contact.phone,
                                email: contact.email || '',
                                tags: contact.tags.join(', '),
                                notes: contact.notes || ''
                              });
                              setIsContactDialogOpen(true);
                            }}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="ghost">
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Remover Contato?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  O contato "{contact.name}" será removido deste grupo.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteContact(contact.id)}>
                                  Remover
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Selecione um grupo para ver os contatos</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Dialog Grupo */}
      <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingGroup ? 'Editar Grupo' : 'Novo Grupo'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="groupName">Nome do Grupo</Label>
              <Input
                id="groupName"
                value={groupForm.name}
                onChange={(e) => setGroupForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Clientes VIP"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="groupDescription">Descrição</Label>
              <Textarea
                id="groupDescription"
                value={groupForm.description}
                onChange={(e) => setGroupForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o propósito deste grupo..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="groupColor">Cor</Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={groupForm.color}
                    onChange={(e) => setGroupForm(prev => ({ ...prev, color: e.target.value }))}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={groupForm.color}
                    onChange={(e) => setGroupForm(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="#3b82f6"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="groupTags">Tags</Label>
                <Input
                  id="groupTags"
                  value={groupForm.tags}
                  onChange={(e) => setGroupForm(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="vip, cliente, lead (separado por vírgula)"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveGroup} className="flex-1">
                {editingGroup ? 'Atualizar' : 'Criar'} Grupo
              </Button>
              <Button variant="outline" onClick={() => setIsGroupDialogOpen(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Contato */}
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingContact ? 'Editar Contato' : 'Novo Contato'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactName">Nome *</Label>
                <Input
                  id="contactName"
                  value={contactForm.name}
                  onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Nome completo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPhone">Telefone *</Label>
                <Input
                  id="contactPhone"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="11999999999"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@exemplo.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactTags">Tags</Label>
              <Input
                id="contactTags"
                value={contactForm.tags}
                onChange={(e) => setContactForm(prev => ({ ...prev, tags: e.target.value }))}
                placeholder="vip, desenvolvedor (separado por vírgula)"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactNotes">Observações</Label>
              <Textarea
                id="contactNotes"
                value={contactForm.notes}
                onChange={(e) => setContactForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Informações adicionais sobre o contato..."
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveContact} className="flex-1">
                {editingContact ? 'Atualizar' : 'Adicionar'} Contato
              </Button>
              <Button variant="outline" onClick={() => setIsContactDialogOpen(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Mensagem em Lote */}
      <Dialog open={isBulkMessageDialogOpen} onOpenChange={setIsBulkMessageDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Enviar Mensagem em Lote</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Contatos Selecionados: {bulkMessageForm.selectedContacts.length}</Label>
              <p className="text-sm text-muted-foreground">
                Selecione contatos na lista acima para incluir neste envio
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bulkMessage">Mensagem</Label>
              <Textarea
                id="bulkMessage"
                value={bulkMessageForm.message}
                onChange={(e) => setBulkMessageForm(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Olá {{nome}}, como vai você?

Use {{nome}} para personalizar com o nome do contato."
                rows={6}
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSendBulkMessage}
                disabled={bulkMessageForm.selectedContacts.length === 0}
                className="flex-1"
              >
                <Send className="w-4 h-4 mr-2" />
                Enviar para {bulkMessageForm.selectedContacts.length} contatos
              </Button>
              <Button variant="outline" onClick={() => setIsBulkMessageDialogOpen(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Importar */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Importar Contatos</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Formato CSV</Label>
              <p className="text-sm text-muted-foreground">
                Arquivo CSV com colunas: Nome, Telefone, Email (opcional)
              </p>
              <div className="p-3 bg-gray-50 rounded text-xs font-mono">
                Nome,Telefone,Email<br />
                João Silva,11999999999,joao@email.com<br />
                Maria Santos,11888888888,maria@email.com
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="csvFile">Selecionar Arquivo</Label>
              <Input
                id="csvFile"
                type="file"
                accept=".csv"
                onChange={handleImportContacts}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContactGroups; 