// index.js (Versão com Alerta por E-mail)

// 1. IMPORTAÇÕES E CONFIGURAÇÃO DE SEGURANÇA
// Carrega as variáveis do arquivo .env (Usuário e Senha)
require('dotenv').config(); 
const axios = require('axios');
const cron = require('node-cron');
const nodemailer = require('nodemailer'); // Importa o Nodemailer
const { API_CONFIGS } = require('./config'); 

// 2. CONFIGURAÇÃO DO TRANSPORTADOR DE E-MAIL
const transporter = nodemailer.createTransport({
    // Estamos usando Gmail aqui como exemplo.
    service: 'gmail', 
    auth: {
        user: process.env.EMAIL_USER, // Lendo do arquivo .env
        pass: process.env.EMAIL_PASS  // Lendo do arquivo .env
    }
});


// --- Módulo de Alerta (AGORA ENVIA E-MAIL) ---
async function sendAlert(apiName, status, latency) {
    const timestamp = new Date().toISOString();
    const subject = `🚨 ALERTA CRÍTICO: FALHA NA API ${apiName} (${status})`;
    const body = `
        O monitor de APIs detectou uma falha de serviço.
        
        API: ${apiName}
        Status HTTP Retornado: ${status} (Esperado: 200)
        Latência: ${latency}ms
        Horário da Falha: ${timestamp}
        
        Ação necessária: Verificar o serviço imediatamente no painel de controle.
    `;

    // Lógica de envio de e-mail
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.ALERT_RECIPIENT, // Lendo do arquivo .env
            subject: subject,
            text: body
        });
        console.error(`\n🚨 ALERTA: E-mail de falha enviado para ${process.env.ALERT_RECIPIENT}`);
    } catch (mailError) {
        console.error(`\n🚨 ALERTA: FALHA NO ENVIO DE E-MAIL! Verifique as credenciais no .env.`);
        console.error(`Erro:`, mailError.message);
    }
}


// --- Módulo de Teste de API (Não mudou) ---
async function checkApiHealth(api) {
    const startTime = Date.now();
    let status = null;

    try {
        const response = await axios({
            method: api.method,
            url: api.url,
            timeout: api.timeout || 10000,
        });

        status = response.status;
        const latency = Date.now() - startTime;

        // Verifica se o status retornado é diferente do status esperado
        if (status !== api.expectedStatus) {
            await sendAlert(api.name, status, latency); // Dispara alerta real
            return;
        }
        
        console.log(`✅ Sucesso | ${api.name} | Status: ${status} | Latência: ${latency}ms`);
        
    } catch (error) {
        const latency = Date.now() - startTime;
        status = error.response ? error.response.status : 'ERRO DE CONEXÃO/TIMEOUT';
        
        // Verifica se o erro é o esperado (ex: 404 simulado)
        if (status === api.expectedStatus) {
             console.log(`✅ Sucesso (Erro Esperado) | ${api.name} | Status: ${status} | Latência: ${latency}ms`);
        } else {
             // Se o status for diferente do esperado (falha inesperada), envia alerta
             await sendAlert(api.name, status, latency); 
        }
    }
}

// --- Módulo Principal de Execução ---
async function runMonitor() {
    console.log(`\n--- Executando Monitoramento em ${new Date().toLocaleTimeString()} ---`);
    for (const api of API_CONFIGS) {
        await checkApiHealth(api);
    }
}

// --- Módulo de Agendamento (Node-Cron) ---
function startScheduler() {
    const cronTime = '*/1 * * * *'; 
    console.log(`\nMonitoramento agendado para rodar a cada 1 minuto (${cronTime}).`);

    cron.schedule(cronTime, () => {
        runMonitor();
    });

    // Roda a primeira vez imediatamente
    runMonitor(); 
}

// Inicia o serviço
startScheduler();