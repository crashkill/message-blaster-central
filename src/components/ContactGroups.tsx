import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Edit, Trash2 } from 'lucide-react';

const ContactGroups: React.FC = () => {
  const [groups] = useState([
    { id: '1', name: 'Família', contacts: 5, description: 'Grupo da família' },
    { id: '2', name: 'Trabalho', contacts: 12, description: 'Colegas de trabalho' },
    { id: '3', name: 'Clientes VIP', contacts: 8, description: 'Clientes importantes' }
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Grupos de Contatos</h2>
        <p className="text-muted-foreground">
          Organize seus contatos em grupos para facilitar o envio de mensagens
        </p>
      </div>

      <div className="flex justify-between items-center">
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Novo Grupo
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <Card key={group.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>{group.name}</span>
                </div>
                <Badge variant="secondary">{group.contacts}</Badge>
              </CardTitle>
              <CardDescription>{group.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                  <Edit className="w-3 h-3 mr-1" />
                  Editar
                </Button>
                <Button size="sm" variant="outline">
                  <Trash2 className="w-3 h-3 mr-1" />
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ContactGroups; 