// Script de teste para verificar o sistema de agendamento
const fs = require('fs').promises;
const path = require('path');

// Carrega a mensagem agendada
async function testScheduler() {
    try {
        const SCHEDULED_FILE = path.join(__dirname, 'scheduled_messages.json');
        const data = await fs.readFile(SCHEDULED_FILE, 'utf8');
        const scheduledMessages = JSON.parse(data);
        
        console.log('📅 Mensagens carregadas:', scheduledMessages.length);
        
        const now = new Date();
        console.log(`📅🔍 Horário atual: ${now.toISOString()} (${now.toLocaleString('pt-BR')})`);
        
        scheduledMessages.forEach(msg => {
            const scheduleTime = new Date(msg.scheduledTime);
            const isReady = msg.status === 'pending' && scheduleTime <= now;
            
            console.log(`📅⏰ Mensagem ${msg.id}:`);
            console.log(`  - Status: ${msg.status}`);
            console.log(`  - Agendada para: ${scheduleTime.toISOString()} (${scheduleTime.toLocaleString('pt-BR')})`);
            console.log(`  - Deve executar: ${isReady ? 'SIM ✅' : 'NÃO ❌'}`);
            console.log(`  - Diferença: ${(now.getTime() - scheduleTime.getTime()) / 1000}s`);
        });
        
    } catch (error) {
        console.error('Erro:', error);
    }
}

testScheduler(); 