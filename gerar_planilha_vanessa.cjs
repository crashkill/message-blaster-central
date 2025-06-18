const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Dados fixos
const nome = "Vanessa Silva";
const telefone = "11973366621";
const mensagemFofinha = `Oi {nome}! 🌸✨\n\nSó passei para lembrar o quanto você é maravilhosa e o quanto ilumina a minha vida. 💖\nCada sorriso seu faz meu mundo girar mais feliz e cada abraço teu é o meu lugar preferido. 🤗\nObrigado por ser minha companheira, minha inspiração e o amor de todos os dias. ❤️\n\nCom todo carinho do seu marido apaixonado. 🥰`;

// Cria 5 linhas idênticas
const contacts = Array.from({ length: 5 }, () => ({
  Nome: nome,
  Telefone: telefone,
  Mensagem: mensagemFofinha,
}));

const worksheet = XLSX.utils.json_to_sheet(contacts);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, 'Contatos');

const filePath = path.join(__dirname, 'public', 'contatos_vanessa.xlsx');

// Garante que a pasta public exista
fs.mkdirSync(path.join(__dirname, 'public'), { recursive: true });

XLSX.writeFile(workbook, filePath);

console.log(`Arquivo 'contatos_vanessa.xlsx' criado em ${filePath}`); 