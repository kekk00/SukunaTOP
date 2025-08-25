import fs from 'fs';
import path from 'path';
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
        browser: ['GiuseMD-V3', 'Safari', '1.0.0'],
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

startBot();

