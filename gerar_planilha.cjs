const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const contacts = [];
const baseName = "Fabricio Cardoso";
const phoneNumber = "11996723582";

for (let i = 1; i <= 10; i++) {
    contacts.push({
        Nome: `${baseName} ${i}`,
        Telefone: phoneNumber
    });
}

const worksheet = XLSX.utils.json_to_sheet(contacts);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Contatos');

const filePath = path.join(__dirname, 'public', 'contatos_teste.xlsx');

// Garante que o diretório 'public' exista
fs.mkdirSync(path.join(__dirname, 'public'), { recursive: true });

XLSX.writeFile(workbook, filePath);

console.log(`Arquivo 'contatos_teste.xlsx' criado com sucesso em ${filePath}`); 