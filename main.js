import { makeWASocket, useSingleFileAuthState } from '@whiskeysockets/baileys';
import qrcode from 'qrcode-terminal';
import fs from 'fs';
import { handleMessage, watchPlugins } from './handler.js';

const SESSION_FILE = './Sessione/creds.json';
if (!fs.existsSync('./Sessione')) fs.mkdirSync('./Sessione', { recursive: true });

const { state, saveState } = useSingleFileAuthState(SESSION_FILE);

async function startBot() {
    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false, // gestiamo il QR noi
    });

    await watchPlugins();

    sock.ev.on('connection.update', (update) => {
        const { qr, connection, lastDisconnect } = update;
        if (qr) {
            console.log('🔗 Scannerizza questo QR con WhatsApp:');
            qrcode.generate(qr, { small: true });
        }
        if (connection === 'open') console.log('✅ Bot connesso!');
        if (connection === 'close') console.log('❌ Connessione chiusa:', lastDisconnect?.error?.output?.statusCode);
    });

    sock.ev.on('creds.update', saveState);

    sock.ev.on('messages.upsert', async (m) => {
        try {
            const msg = m.messages[0];
            if (!msg.key.fromMe) {
                await handleMessage(sock, msg);
            }
        } catch (e) {
            console.error('⚠️ Errore interno handleMessage:', e);
        }
    });
}

startBot();

