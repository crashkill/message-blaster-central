const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const exampleContact = [
    {
        Nome: "João da Silva",
        Telefone: "5511987654321",
        Email: "joao.silva@exemplo.com"
    }
];

const worksheet = XLSX.utils.json_to_sheet(exampleContact);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Contatos');

// Adiciona comentários/instruções nas células do cabeçalho
if(!worksheet['A1']) worksheet['A1'] = {};
worksheet['A1'].c = [{a:'Sistema', t:'Obrigatório. O nome será usado na personalização da mensagem com {nome}.'}];

if(!worksheet['B1']) worksheet['B1'] = {};
worksheet['B1'].c = [{a:'Sistema', t:'Obrigatório. Inclua o DDI e DDD. Ex: 5511987654321'}];

if(!worksheet['C1']) worksheet['C1'] = {};
worksheet['C1'].c = [{a:'Sistema', t:'Opcional. Este campo não é usado no envio.'}];


const filePath = path.join(__dirname, 'public', 'template_contatos.xlsx');

// Garante que o diretório 'public' exista
fs.mkdirSync(path.join(__dirname, 'public'), { recursive: true });

XLSX.writeFile(workbook, filePath);

console.log(`Arquivo 'template_contatos.xlsx' criado com sucesso em ${filePath}`); 