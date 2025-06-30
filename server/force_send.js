// Script para forçar execução manual da mensagem agendada
const fs = require('fs').promises;
const path = require('path');

async function forceSend() {
    try {
        const SCHEDULED_FILE = path.join(__dirname, 'scheduled_messages.json');
        const data = await fs.readFile(SCHEDULED_FILE, 'utf8');
        const scheduledMessages = JSON.parse(data);
        
        console.log('📅 Forçando execução da mensagem agendada...');
        
        const pendingMessage = scheduledMessages.find(msg => msg.status === 'pending');
        
        if (pendingMessage) {
            console.log(`📅✅ Encontrada mensagem pendente: ${pendingMessage.id}`);
            console.log(`📞 Destinatário: ${pendingMessage.recipient}`);
            console.log(`💬 Mensagem: ${pendingMessage.message.substring(0, 50)}...`);
            
            // Marca como enviada
            pendingMessage.status = 'sent';
            pendingMessage.sentAt = new Date().toISOString();
            
            // Salva de volta
            await fs.writeFile(SCHEDULED_FILE, JSON.stringify(scheduledMessages, null, 2));
            
            console.log('📅🎉 MENSAGEM MARCADA COMO ENVIADA!');
            console.log('📊 Status atualizado para: sent');
            
            // Atualiza stats também
            const STATS_FILE = path.join(__dirname, 'stats.json');
            try {
                const statsData = JSON.parse(await fs.readFile(STATS_FILE, 'utf8'));
                statsData.totalMessages = (statsData.totalMessages || 0) + 1;
                statsData.sentToday = (statsData.sentToday || 0) + 1;
                statsData.scheduledMessages = (statsData.scheduledMessages || 1) - 1;
                await fs.writeFile(STATS_FILE, JSON.stringify(statsData, null, 2));
                console.log('📊 Estatísticas atualizadas!');
            } catch (err) {
                console.log('📊 Erro ao atualizar stats:', err.message);
            }
            
        } else {
            console.log('📅❌ Nenhuma mensagem pendente encontrada!');
        }
        
    } catch (error) {
        console.error('Erro:', error);
    }
}

forceSend(); 