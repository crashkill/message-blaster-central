const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");
const { Client, LocalAuth } = require('whatsapp-web.js');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        // Permite conexões vindas do frontend. Ajuste as portas conforme necessidade.
        origin: [
            "http://localhost:8080", // Porta padrão do Vite
            "http://localhost:8081",
            "http://localhost:8082", 
            "http://localhost:8083", // Porta atual do frontend
            "http://localhost:8084",
            "http://localhost:8085",
            "http://localhost:8086"
        ],
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
        args: [
            '--no-sandbox', 
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ],
        timeout: 60000,
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
    
    // Aguarda um pouco antes de tentar reinicializar
    setTimeout(() => {
        console.log('Tentando reinicializar o cliente...');
        client.initialize();
    }, 5000);
});

// Tratamento de erros do cliente
client.on('error', (error) => {
    console.error('Erro no cliente WhatsApp:', error);
    isClientReady = false;
    io.emit('status', 'error');
});

// Tratamento de erros do processo
process.on('uncaughtException', (error) => {
    console.error('Erro não capturado:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Promise rejeitada não tratada:', reason);
});

client.initialize();

// Endpoint para checar o status inicial
app.get('/api/status', (req, res) => {
    res.json({ ready: isClientReady });
});

// Endpoint para desconectar o WhatsApp
app.post('/api/disconnect', async (req, res) => {
    try {
        console.log('🔌 Desconectando WhatsApp Web...');
        
        if (!isClientReady) {
            console.log('⚠️ Cliente já está desconectado');
            return res.json({ success: true, message: 'WhatsApp já estava desconectado!' });
        }
        
        isClientReady = false;
        io.emit('status', 'disconnecting');
        
        // Tenta fazer logout do cliente com timeout
        try {
            const logoutPromise = client.logout();
            const timeoutPromise = new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 10000)
            );
            
            await Promise.race([logoutPromise, timeoutPromise]);
            console.log('✅ WhatsApp Web desconectado com sucesso!');
        } catch (logoutError) {
            console.warn('⚠️ Erro durante logout, mas continuando:', logoutError.message);
            // Mesmo com erro no logout, consideramos como sucesso
            // pois o objetivo é desconectar
        }
        
        // Força o estado desconectado
        isClientReady = false;
        io.emit('status', 'disconnected');
        
        res.json({ success: true, message: 'WhatsApp desconectado com sucesso!' });
        
    } catch (error) {
        console.error('❌ Erro crítico ao desconectar WhatsApp:', error);
        
        // Mesmo com erro, força o estado desconectado
        isClientReady = false;
        io.emit('status', 'disconnected');
        
        res.status(500).json({ 
            success: false, 
            error: `Erro ao desconectar: ${error.message || 'Falha interna do servidor.'}` 
        });
    }
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

    // Formatar número para o padrão do WhatsApp brasileiro (ex: 5511999998888@c.us)
    // Automaticamente adiciona o código do Brasil (55) se não estiver presente
    const cleanNumber = to.replace(/\D/g, '');
    const finalNumber = cleanNumber.startsWith('55') ? cleanNumber : `55${cleanNumber}`;
    const chatId = `${finalNumber}@c.us`;

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