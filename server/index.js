const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require("socket.io");
const { Client, LocalAuth } = require('whatsapp-web.js');
const fs = require('fs').promises;
const path = require('path');

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

// Sistema de Estatísticas Reais
const STATS_FILE = path.join(__dirname, 'stats.json');

// 🚀 SISTEMA DE AGENDAMENTO DE MENSAGENS
const SCHEDULED_FILE = path.join(__dirname, 'scheduled_messages.json');

let scheduledMessages = [];

// Estrutura inicial das estatísticas
const defaultStats = {
    totalMessages: 0,
    sentToday: 0,
    successCount: 0,
    failedCount: 0,
    responseTime: [],
    activeContacts: new Set(),
    scheduledMessages: 0,
    hourlyStats: {},
    dailyStats: {},
    lastReset: new Date().toISOString().split('T')[0]
};

let statsData = { ...defaultStats };

// Função para carregar estatísticas do arquivo
async function loadStats() {
    try {
        const data = await fs.readFile(STATS_FILE, 'utf8');
        const loaded = JSON.parse(data);
        
        // Converte activeContacts de volta para Set
        loaded.activeContacts = new Set(loaded.activeContacts || []);
        
        // Verifica se é um novo dia e reseta estatísticas diárias
        const today = new Date().toISOString().split('T')[0];
        if (loaded.lastReset !== today) {
            loaded.sentToday = 0;
            loaded.lastReset = today;
        }
        
        statsData = { ...defaultStats, ...loaded };
    } catch (error) {
        console.log('Criando novo arquivo de estatísticas...');
        await saveStats();
    }
}

// Função para salvar estatísticas no arquivo
async function saveStats() {
    try {
        const dataToSave = {
            ...statsData,
            activeContacts: Array.from(statsData.activeContacts)
        };
        await fs.writeFile(STATS_FILE, JSON.stringify(dataToSave, null, 2));
    } catch (error) {
        console.error('Erro ao salvar estatísticas:', error);
    }
}

// Função para registrar uma mensagem enviada
function logMessage(to, success = true, responseTime = 0) {
    const now = new Date();
    const hour = now.getHours();
    const today = now.toISOString().split('T')[0];
    
    // Atualiza contadores gerais
    statsData.totalMessages++;
    
    // Verifica se é um novo dia
    if (statsData.lastReset !== today) {
        statsData.sentToday = 0;
        statsData.lastReset = today;
    }
    
    statsData.sentToday++;
    
    if (success) {
        statsData.successCount++;
    } else {
        statsData.failedCount++;
    }
    
    // Adiciona contato ativo (extrai número limpo)
    const cleanNumber = to.replace(/\D/g, '');
    statsData.activeContacts.add(cleanNumber);
    
    // Estatísticas por horário
    if (!statsData.hourlyStats[hour]) {
        statsData.hourlyStats[hour] = 0;
    }
    statsData.hourlyStats[hour]++;
    
    // Estatísticas diárias
    if (!statsData.dailyStats[today]) {
        statsData.dailyStats[today] = 0;
    }
    statsData.dailyStats[today]++;
    
    // Tempo de resposta
    if (responseTime > 0) {
        statsData.responseTime.push(responseTime);
        // Mantém apenas os últimos 100 tempos de resposta
        if (statsData.responseTime.length > 100) {
            statsData.responseTime = statsData.responseTime.slice(-100);
        }
    }
    
    // Salva as estatísticas
    saveStats();
}

// Função para calcular estatísticas computadas
function getComputedStats() {
    const successRate = statsData.totalMessages > 0 
        ? ((statsData.successCount / statsData.totalMessages) * 100).toFixed(1)
        : 0;
    
    const avgResponseTime = statsData.responseTime.length > 0
        ? (statsData.responseTime.reduce((a, b) => a + b, 0) / statsData.responseTime.length).toFixed(1)
        : 2.4;
    
    // Top 4 horários mais ativos
    const popularHours = Object.entries(statsData.hourlyStats)
        .map(([hour, count]) => ({ hour: parseInt(hour), count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 4);
    
    return {
        totalMessages: statsData.totalMessages,
        sentToday: statsData.sentToday,
        successRate: parseFloat(successRate),
        failedMessages: statsData.failedCount,
        averageResponseTime: parseFloat(avgResponseTime),
        activeContacts: statsData.activeContacts.size,
        scheduledMessages: statsData.scheduledMessages,
        popularHours: popularHours.length > 0 ? popularHours : [
            { hour: 9, count: 0 },
            { hour: 14, count: 0 },
            { hour: 18, count: 0 },
            { hour: 20, count: 0 }
        ]
    };
}

// Função para carregar mensagens agendadas
async function loadScheduledMessages() {
    try {
        const data = await fs.readFile(SCHEDULED_FILE, 'utf8');
        scheduledMessages = JSON.parse(data);
        console.log(`📅 ${scheduledMessages.length} mensagens agendadas carregadas`);
    } catch (error) {
        console.log('📅 Criando novo arquivo de mensagens agendadas...');
        await saveScheduledMessages();
    }
}

// Função para salvar mensagens agendadas
async function saveScheduledMessages() {
    try {
        await fs.writeFile(SCHEDULED_FILE, JSON.stringify(scheduledMessages, null, 2));
    } catch (error) {
        console.error('Erro ao salvar mensagens agendadas:', error);
    }
}

// Função para adicionar mensagem agendada
function addScheduledMessage(recipient, message, scheduledTime) {
    const newMessage = {
        id: Date.now().toString(),
        recipient: recipient,
        message: message,
        scheduledTime: scheduledTime,
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    scheduledMessages.push(newMessage);
    saveScheduledMessages();
    
    // Atualiza contador de mensagens agendadas nas stats
    statsData.scheduledMessages = scheduledMessages.filter(msg => msg.status === 'pending').length;
    saveStats();
    
    return newMessage;
}

// Função para deletar mensagem agendada
function deleteScheduledMessage(id) {
    const index = scheduledMessages.findIndex(msg => msg.id === id);
    if (index !== -1) {
        scheduledMessages.splice(index, 1);
        saveScheduledMessages();
        
        // Atualiza contador nas stats
        statsData.scheduledMessages = scheduledMessages.filter(msg => msg.status === 'pending').length;
        saveStats();
        
        return true;
    }
    return false;
}

// Sistema automático de execução de mensagens agendadas
function checkScheduledMessages() {
    if (!isClientReady) {
        console.log('📅⏳ Sistema automático aguardando WhatsApp conectar...');
        return;
    }
    
    const now = new Date();
    console.log(`📅🔍 Verificando mensagens agendadas às ${now.toLocaleString('pt-BR')}...`);
    
    const pendingMessages = scheduledMessages.filter(msg => {
        const scheduleTime = new Date(msg.scheduledTime);
        const isReady = msg.status === 'pending' && scheduleTime <= now;
        
        if (msg.status === 'pending') {
            console.log(`📅⏰ Mensagem ${msg.id}: agendada para ${scheduleTime.toLocaleString('pt-BR')}, agora são ${now.toLocaleString('pt-BR')} - ${isReady ? 'PRONTA!' : 'aguardando...'}`);
        }
        
        return isReady;
    });
    
    pendingMessages.forEach(async (msg) => {
        try {
            // Formatar número para o padrão do WhatsApp
            const cleanNumber = msg.recipient.replace(/\D/g, '');
            const finalNumber = cleanNumber.startsWith('55') ? cleanNumber : `55${cleanNumber}`;
            const chatId = `${finalNumber}@c.us`;
            
            const startTime = Date.now();
            await client.sendMessage(chatId, msg.message);
            const responseTime = (Date.now() - startTime) / 1000;
            
            // Atualiza status da mensagem
            msg.status = 'sent';
            msg.sentAt = new Date().toISOString();
            
            // Registra nas estatísticas
            logMessage(msg.recipient, true, responseTime);
            
            console.log(`📅✅ Mensagem agendada enviada para ${msg.recipient}: "${msg.message}"`);
            
            // Emite evento para frontend
            io.emit('scheduled-message-sent', {
                id: msg.id,
                recipient: msg.recipient,
                success: true
            });
            
        } catch (error) {
            // Marca como falha
            msg.status = 'failed';
            msg.failedAt = new Date().toISOString();
            msg.error = error.message;
            
            // Registra falha nas estatísticas
            logMessage(msg.recipient, false);
            
            console.error(`📅❌ Erro ao enviar mensagem agendada para ${msg.recipient}:`, error);
            
            // Emite evento de erro para frontend
            io.emit('scheduled-message-sent', {
                id: msg.id,
                recipient: msg.recipient,
                success: false,
                error: error.message
            });
        }
    });
    
    if (pendingMessages.length > 0) {
        saveScheduledMessages();
        // Atualiza contador nas stats
        statsData.scheduledMessages = scheduledMessages.filter(msg => msg.status === 'pending').length;
        saveStats();
    }
}

// Verifica mensagens agendadas a cada minuto
setInterval(checkScheduledMessages, 60000);

// Carrega mensagens agendadas ao inicializar
loadScheduledMessages();

// Carrega estatísticas ao inicializar
loadStats();

// Socket.io connection
io.on('connection', (socket) => {
    console.log('Frontend conectado via Socket.io');

    // Envia o status atual ao se conectar
    socket.emit('status', isClientReady ? 'ready' : 'connecting');

    socket.on('disconnect', () => {
        console.log('Frontend desconectado');
    });
});

// Configuração do cliente do WhatsApp com configurações melhoradas
const client = new Client({
    authStrategy: new LocalAuth({
        dataPath: './whatsapp-session'
    }),
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
            '--disable-gpu',
            '--disable-web-security',
            '--disable-extensions',
            '--disable-background-timer-throttling',
            '--disable-backgrounding-occluded-windows',
            '--disable-renderer-backgrounding'
        ],
        timeout: 120000, // Aumentado para 2 minutos
        handleSIGINT: false,
    },
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2412.54.html',
    }
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
    console.log('Cliente foi desconectado:', reason);
    isClientReady = false;
    io.emit('status', 'disconnected');
    
    // Não tenta reconectar automaticamente para evitar loops
    console.log('⚠️ WhatsApp desconectado. Use o botão "Conectar WhatsApp" para reconectar.');
});

// Tratamento de erros do cliente
client.on('error', (error) => {
    console.error('❌ Erro no cliente WhatsApp:', error.message);
    isClientReady = false;
    io.emit('status', 'error');
});

// Evento para loading
client.on('loading_screen', (percent, message) => {
    console.log(`📱 Carregando WhatsApp: ${percent}% - ${message}`);
    io.emit('loading', { percent, message });
});

// Tratamento melhorado de erros do processo
process.on('uncaughtException', (error) => {
    console.error('❌ Erro não capturado:', error.message);
    // Não mata o processo, apenas loga o erro
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Promise rejeitada:', reason?.message || reason);
    // Não mata o processo, apenas loga o erro
});

client.initialize();

// 🚀 NOVA ROTA: API de Estatísticas Reais
app.get('/api/stats', (req, res) => {
    try {
        const stats = getComputedStats();
        console.log('📊 Estatísticas enviadas:', stats);
        res.json(stats);
    } catch (error) {
        console.error('Erro ao buscar estatísticas:', error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});

// 🚀 NOVA ROTA: Reset de Estatísticas (para testes)
app.post('/api/stats/reset', async (req, res) => {
    try {
        statsData = { ...defaultStats };
        statsData.activeContacts = new Set();
        await saveStats();
        res.json({ success: true, message: 'Estatísticas resetadas com sucesso!' });
    } catch (error) {
        console.error('Erro ao resetar estatísticas:', error);
        res.status(500).json({ error: 'Erro ao resetar estatísticas' });
    }
});

// 🚀 ROTAS DE AGENDAMENTO DE MENSAGENS

// GET: Listar todas as mensagens agendadas
app.get('/api/scheduled', (req, res) => {
    try {
        res.json({
            success: true,
            messages: scheduledMessages,
            total: scheduledMessages.length,
            pending: scheduledMessages.filter(msg => msg.status === 'pending').length
        });
    } catch (error) {
        console.error('Erro ao buscar mensagens agendadas:', error);
        res.status(500).json({ success: false, error: 'Erro interno do servidor' });
    }
});

// POST: Agendar nova mensagem
app.post('/api/schedule', (req, res) => {
    try {
        const { recipient, message, scheduledTime } = req.body;

        // Validações básicas
        if (!recipient || !message || !scheduledTime) {
            return res.status(400).json({
                success: false,
                error: 'Destinatário, mensagem e horário são obrigatórios'
            });
        }

        // Valida se a data/hora é futura
        const scheduleDate = new Date(scheduledTime);
        const now = new Date();
        
        if (scheduleDate <= now) {
            return res.status(400).json({
                success: false,
                error: 'A data/hora deve ser futura'
            });
        }

        // Cria mensagem agendada
        const newMessage = addScheduledMessage(recipient, message, scheduledTime);

        console.log(`📅 Nova mensagem agendada criada: ${recipient} - ${scheduledTime}`);

        res.json({
            success: true,
            message: 'Mensagem agendada com sucesso!',
            scheduled: newMessage
        });

    } catch (error) {
        console.error('Erro ao agendar mensagem:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// DELETE: Deletar mensagem agendada
app.delete('/api/scheduled/:id', (req, res) => {
    try {
        const { id } = req.params;

        const deleted = deleteScheduledMessage(id);

        if (deleted) {
            console.log(`📅 Mensagem agendada deletada: ${id}`);
            res.json({
                success: true,
                message: 'Mensagem agendada deletada com sucesso!'
            });
        } else {
            res.status(404).json({
                success: false,
                error: 'Mensagem agendada não encontrada'
            });
        }

    } catch (error) {
        console.error('Erro ao deletar mensagem agendada:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor'
        });
    }
});

// Endpoint para checar o status inicial
app.get('/api/status', (req, res) => {
    res.json({ ready: isClientReady });
});

// Endpoint para reconectar o WhatsApp
app.post('/api/reconnect', async (req, res) => {
    try {
        console.log('🔄 Tentando reconectar WhatsApp...');
        
        if (isClientReady) {
            console.log('⚠️ Cliente já está conectado');
            return res.json({ success: true, message: 'WhatsApp já está conectado!' });
        }
        
        // Reinicializa o cliente
        io.emit('status', 'connecting');
        client.initialize();
        
        res.json({ success: true, message: 'Tentativa de reconexão iniciada!' });
        
    } catch (error) {
        console.error('❌ Erro ao tentar reconectar:', error);
        res.status(500).json({ 
            success: false, 
            error: `Erro na reconexão: ${error.message}` 
        });
    }
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

// Endpoint para enviar mensagens - ATUALIZADO com tracking
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

    const startTime = Date.now();
    
    try {
        await client.sendMessage(chatId, message);
        const responseTime = (Date.now() - startTime) / 1000; // em segundos
        
        // 📊 REGISTRA MENSAGEM ENVIADA COM SUCESSO
        logMessage(to, true, responseTime);
        
        console.log(`✅ Mensagem enviada com sucesso para ${to} em ${responseTime}s`);
        res.json({ success: true, message: 'Mensagem enviada com sucesso!' });
    } catch (error) {
        const responseTime = (Date.now() - startTime) / 1000;
        
        // 📊 REGISTRA MENSAGEM COM FALHA
        logMessage(to, false, responseTime);
        
        console.error('❌ Erro ao enviar mensagem:', error);
        res.status(500).json({ success: false, error: 'Falha ao enviar mensagem.' });
    }
});

server.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
}); 