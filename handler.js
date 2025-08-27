/*
axtral so che molto probabilmente stai leggendo questo, comunque questo messaggio l'ho scritto in tutti i file per darti fastidio. SUKUNAMD ON TOPP
*/

import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import chalk from 'chalk';

const DB_FOLDER = './db';
const PLUGIN_FOLDER = './plugins';
let plugins = {};

// --- CREAZIONE CARTELLE ---
if (!fsSync.existsSync(DB_FOLDER)) fsSync.mkdirSync(DB_FOLDER, { recursive: true });
if (!fsSync.existsSync('./Sessione')) fsSync.mkdirSync('./Sessione');
if (!fsSync.existsSync(PLUGIN_FOLDER)) fsSync.mkdirSync(PLUGIN_FOLDER);

// -------------------- DATABASE HELPERS --------------------
export async function readDB(file) {
    const dbPath = path.join(DB_FOLDER, file);
    try {
        if (!fsSync.existsSync(dbPath)) {
            await fs.writeFile(dbPath, '{}');
        }
        const data = await fs.readFile(dbPath, 'utf-8');
        return data.trim() ? JSON.parse(data) : {};
    } catch (e) {
        console.log(`⚠️ DB ${file} corrotto o vuoto. Rigenerato.`);
        await fs.writeFile(dbPath, '{}');
        return {};
    }
}

export async function writeDB(file, data) {
    const dbPath = path.join(DB_FOLDER, file);
    await fs.writeFile(dbPath, JSON.stringify(data, null, 2));
    console.log(chalk.blueBright(`💾 DB ${file} aggiornato!`));
}

// -------------------- AUTH --------------------
export function saveState(state) {
    const filePath = path.join('./Sessione', 'creds.json');
    fsSync.writeFileSync(filePath, JSON.stringify(state, null, 2));
}

// -------------------- PLUGINS --------------------
export async function loadPlugins() {
    const files = fsSync.readdirSync(PLUGIN_FOLDER).filter(f => f.endsWith('.js'));
    plugins = {};
    for (let file of files) {
        const pl = await import(path.join(process.cwd(), PLUGIN_FOLDER, file));
        if (pl.command) {
            pl.command.forEach(cmd => plugins[cmd.toLowerCase()] = pl);
        }
    }
    console.log(chalk.green(`🔌 Plugin caricati: ${Object.keys(plugins).join(', ')}`));
}

export function watchPlugins() {
    fsSync.watch(PLUGIN_FOLDER, { recursive: false }, () => loadPlugins());
    loadPlugins();
}

// -------------------- AGGIORNA DB --------------------
export async function updateDB(sock, message) {
    try {
        if (!message.message || (!message.message.conversation && !message.message.buttonsResponseMessage)) return;

        const usersdb = await readDB('usersdb.json');
        const userspos = await readDB('userspos.json');
        const gpdb = await readDB('gpdb.json');

        const senderJid = message.key.participant || message.key.remoteJid;
        const senderName = message.pushName || senderJid.split('@')[0];
        const chatId = message.key.remoteJid;

        // --- UTENTE ---
        // Usa il JID come chiave e salva il nome e i messaggi
        if (!usersdb[senderJid]) usersdb[senderJid] = { name: senderName, messages: 0 };
        usersdb[senderJid].messages += 1;
        // Aggiorna anche il nome in caso sia cambiato
        usersdb[senderJid].name = senderName;

        // --- POSIZIONE UTENTI ---
        Object.entries(usersdb)
            .filter(([jid]) => !jid.endsWith('@g.us') && !jid.endsWith('@newsletter'))
            .sort((a,b)=>b[1].messages - a[1].messages)
            .forEach(([jid], index)=> userspos[jid] = index+1);

        // --- GRUPPO ---
        if (chatId.endsWith('@g.us')) {
            let groupName = chatId;
            let membersCount = '-';
            try {
                const metadata = await sock.groupMetadata(chatId);
                groupName = metadata.subject || chatId;
                membersCount = metadata.participants.length;
            } catch(e) {
                console.log('⚠️ Non è stato possibile recuperare i membri del gruppo:', chatId);
            }

            if (!gpdb[groupName]) gpdb[groupName] = { members: membersCount, messages: 0 };
            else gpdb[groupName].members = membersCount;
            gpdb[groupName].messages += 1;
        }

        await writeDB('usersdb.json', usersdb);
        await writeDB('userspos.json', userspos);
        await writeDB('gpdb.json', gpdb);

        console.log(chalk.yellow(`📝 Messaggio da ${senderName} (${senderJid}) aggiornato in ${chatId}`));
    } catch(e) {
        console.log('⚠️ Errore aggiornando DB:', e.message);
    }
}

// -------------------- HANDLE MESSAGGI --------------------
export async function handleMessage(sock, message) {
    try {
        let text;
        if (message.message?.conversation) text = message.message.conversation;
        else if (message.message?.buttonsResponseMessage?.selectedButtonId) text = message.message.buttonsResponseMessage.selectedButtonId;
        else return;

        if (!text.startsWith('!')) {
            // Se non è un comando, aggiorna comunque il DB con le info del messaggio
            await updateDB(sock, message);
            return;
        }

        const [cmd, ...args] = text.slice(1).split(' ');
        const plugin = plugins[cmd.toLowerCase()];

        if (plugin?.run) {
            console.log(chalk.magenta(`⚡ Comando riconosciuto: !${cmd} da ${message.pushName || message.key.participant}`));
            await plugin.run(sock, message, args);
        }
    } catch(e) {
        console.log('⚠️ Errore interno handleMessage:', e.message);
    }
}

