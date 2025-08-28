import fs from 'fs';
import path from 'path';
// Importiamo il modulo express per creare un server
import express from 'express';
import { makeWASocket, useSingleFileAuthState, fetchLatestBaileysVersion, DisconnectReason } from '@whiskeysockets/baileys';
import { saveState, watchPlugins, handleMessage } from './handler.js';

const authFile = './Sessione/creds.json';

// Single file auth
const { state } = useSingleFileAuthState(authFile);

// Determina se stampare il QR (solo se non esiste la sessione)
const printQR = !fs.existsSync(authFile);

async function startBot() {
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        printQRInTerminal: printQR,
        auth: state,
        browser: ['『 𝐒𝐔𝐊�𝐍𝐀-𝐁𝐨𝐭 ⁶⁶⁶』', 'Safari', '1.0.0'],
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        syncFullHistory: true,
        version
    });

    sock.ev.on('creds.update', saveState);

    console.log('🤖 𝐒𝐔𝐊𝐔𝐍𝐀⁶⁶⁶-𝐁𝐨𝐭 avviato!');
    watchPlugins();

    sock.ev.on('messages.upsert', async ({ messages }) => {
        if (!messages || !messages[0].message || messages[0].key.fromMe) return;
        try {
            await handleMessage(sock, messages[0]);
        } catch (e) {
            console.log('❌ Errore nel gestire il messaggio:', e.message);
        }
    });

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            if (reason !== DisconnectReason.loggedOut) startBot();
        }
    });
}

// Avvia il bot
startBot();

// --- AVVIA SERVER EXPRESS SULLA PRIMA PORTA DISPONIBILE TRA 15 ---
const ports = [8000, 8001, 8002, 8003, 8004, 8005, 8006, 8007, 8008, 8009, 8010, 8011, 8012, 8013, 8014];

async function startServer() {
    const app = express();

    // Definisce una rotta GET per il path radice '/'
    app.get('/', (req, res) => {
        res.status(200).send('Bot is online!');
    });

    for (const port of ports) {
        try {
            await new Promise((resolve, reject) => {
                const server = app.listen(port, () => {
                    console.log(`✅ Server UptimeRobot in ascolto sulla porta ${port}`);
                    resolve();
                });
                server.on('error', (err) => {
                    reject(err);
                });
            });
            // Se un server si avvia con successo, usciamo dal ciclo
            break; 
        } catch (e) {
            console.log(`⚠️ La porta ${port} è già in uso, provo la prossima...`);
        }
    }
}

// Avvia la logica del server
startServer();
