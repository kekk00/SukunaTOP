/*
axtral so che molto probabilmente stai leggendo questo, comunque questo messaggio l'ho scritto in tutti i file per darti fastidio. SUKUNAMD ON TOPP
*/




import fs from 'fs';
import path from 'path';
import chalk from 'chalk';



const DB_FOLDER = './db';
const PLUGIN_FOLDER = './plugins';
let plugins = {};

// --- CREAZIONE CARTELLE ---
if (!fs.existsSync(DB_FOLDER)) fs.mkdirSync(DB_FOLDER, { recursive: true });
if (!fs.existsSync('./Sessione')) fs.mkdirSync('./Sessione');
if (!fs.existsSync(PLUGIN_FOLDER)) fs.mkdirSync(PLUGIN_FOLDER);

// -------------------- DATABASE HELPERS --------------------
export function readDB(file) {
    const dbPath = path.join(DB_FOLDER, file);
    if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, '{}');
    try {
        const data = fs.readFileSync(dbPath, 'utf-8');
        return data.trim() ? JSON.parse(data) : {};
    } catch (e) {
        console.log(`⚠️ DB ${file} corrotto o vuoto. Rigenerato.`);
        fs.writeFileSync(dbPath, '{}');
        return {};
    }
}

export function writeDB(file, data) {
    const dbPath = path.join(DB_FOLDER, file);
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
    console.log(chalk.blueBright(`💾 DB ${file} aggiornato!`));
}

// -------------------- AUTH --------------------
export function saveState(state) {
    const filePath = path.join('./Sessione', 'creds.json');
    fs.writeFileSync(filePath, JSON.stringify(state, null, 2));
}

// -------------------- PLUGINS --------------------
export async function loadPlugins() {
    const files = fs.readdirSync(PLUGIN_FOLDER).filter(f => f.endsWith('.js'));
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
    fs.watch(PLUGIN_FOLDER, { recursive: false }, () => loadPlugins());
    loadPlugins();
}

// -------------------- AGGIORNA DB --------------------
export async function updateDB(sock, message) {
    try {
        if (!message.message || (!message.message.conversation && !message.message.buttonsResponseMessage)) return;

        const gpdb = readDB('gpdb.json');
        const usersdb = readDB('usersdb.json');
        const userspos = readDB('userspos.json');

        const sender = message.pushName || message.key.participant?.split('@')[0];
        const chatId = message.key.remoteJid;

        // --- UTENTE ---
        if (!usersdb[sender]) usersdb[sender] = { messages: 0 };
        usersdb[sender].messages += 1;

        // --- POSIZIONE UTENTI ---
        Object.entries(usersdb)
            .sort((a,b)=>b[1].messages - a[1].messages)
            .forEach(([name], index)=> userspos[name]=index+1);

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

        writeDB('usersdb.json', usersdb);
        writeDB('userspos.json', userspos);
        writeDB('gpdb.json', gpdb);

        console.log(chalk.yellow(`📝 Messaggio da ${sender} aggiornato in ${chatId}`));
    } catch(e) {
        console.log('⚠️ Errore aggiornando DB:', e.message);
    }
}

// -------------------- HANDLE MESSAGGI --------------------
export async function handleMessage(sock, message) {
    try {
        await updateDB(sock, message);

        let text;
        if (message.message?.conversation) text = message.message.conversation;
        else if (message.message?.buttonsResponseMessage?.selectedButtonId) text = message.message.buttonsResponseMessage.selectedButtonId;
        else return;

        if (!text.startsWith('!')) return;

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
