const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");
const { Client, LocalAuth } = require('whatsapp-web.js');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: ["http://localhost:8084", "http://localhost:8085", "http://localhost:8086"], // A porta do seu frontend
        methods: ["GET", "POST"]
    }
});

const port = 3001;

app.use(cors());
app.use(express.json());

let isClientReady = false;

// Socket.io connection
io.on('connection', (socket) => {
    console.log('Frontend conectado via Socket.io');

    // Envia o status atual ao se conectar
    socket.emit('status', isClientReady ? 'ready' : 'connecting');

    socket.on('disconnect', () => {
        console.log('Frontend desconectado');
    });
});

// Configuração do cliente do WhatsApp
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    },
});

client.on('qr', qr => {
    console.log('QR Code gerado. Enviando para o frontend.');
    io.emit('qr', qr);
    isClientReady = false;
    io.emit('status', 'qr');
});

client.on('ready', () => {
    console.log('Cliente do WhatsApp está pronto!');
    isClientReady = true;
    io.emit('status', 'ready');
    io.emit('ready'); // Evento para fechar o modal
});

client.on('auth_failure', msg => {
    console.error('Falha na autenticação!', msg);
    io.emit('status', 'auth_failure');
});

client.on('disconnected', (reason) => {
    console.log('Cliente foi desconectado', reason);
    isClientReady = false;
    io.emit('status', 'disconnected');
    client.initialize(); // Tenta reinicializar
});

client.initialize();

// Endpoint para checar o status inicial
app.get('/api/status', (req, res) => {
    res.json({ ready: isClientReady });
});

// Endpoint para enviar mensagens
app.post('/api/send-message', async (req, res) => {
    if (!isClientReady) {
        return res.status(503).json({ success: false, error: 'O cliente do WhatsApp não está pronto. Por favor, aguarde alguns instantes.' });
    }

    const { to, message } = req.body;

    if (!to || !message) {
        return res.status(400).json({ success: false, error: 'Número e mensagem são obrigatórios.' });
    }

    // Formatar número para o padrão do WhatsApp (ex: 5511999998888@c.us)
    const chatId = `${to.replace(/\D/g, '')}@c.us`;

    try {
        await client.sendMessage(chatId, message);
        res.json({ success: true, message: 'Mensagem enviada com sucesso!' });
    } catch (error) {
        console.error('Erro ao enviar mensagem:', error);
        res.status(500).json({ success: false, error: 'Falha ao enviar mensagem.' });
    }
});

server.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
}); 