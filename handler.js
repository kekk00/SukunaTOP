import fs from 'fs';
import path from 'path';
import chalk from 'chalk';
import schedule from 'node-schedule';

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
        return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
    } catch {
        console.log(`⚠️ DB ${file} vuoto o corrotto, ricreazione...`);
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
    fs.writeFileSync('./Sessione/creds.json', JSON.stringify(state, null, 2));
}

// -------------------- PLUGINS --------------------
export async function loadPlugins() {
    const files = fs.readdirSync(PLUGIN_FOLDER).filter(f => f.endsWith('.js'));
    plugins = {};
    for (let file of files) {
        delete import.meta.cache?.[file];
        const pl = await import(path.join(process.cwd(), PLUGIN_FOLDER, file));
        if (pl.command) pl.command.forEach(cmd => plugins[cmd.toLowerCase()] = pl);
    }
    console.log(chalk.green(`🔌 Plugin caricati: ${Object.keys(plugins).join(', ')}`));
}

export async function watchPlugins() {
    fs.watch(PLUGIN_FOLDER, { recursive: false }, () => loadPlugins());
    await loadPlugins();
}

// -------------------- AGGIORNA DB --------------------
export async function updateDB(sock, message) {
    if (!message.message || (!message.message.conversation && !message.message.buttonsResponseMessage)) return;

    const gpdb = readDB('gpdb.json');
    const usersdb = readDB('usersdb.json');
    const userspos = readDB('userspos.json');

    const sender = message.key.participant || message.key.remoteJid;
    const chatId = message.key.remoteJid;

    // Ignora utenti che terminano con @g.us o @newsletter
    if (!sender.endsWith('@g.us') && !sender.endsWith('@newsletter')) {
        if (!usersdb[sender]) usersdb[sender] = { messages: 0 };
        usersdb[sender].messages += 1;

        Object.entries(usersdb)
            .sort((a,b)=>b[1].messages - a[1].messages)
            .forEach(([name], index)=> userspos[name]=index+1);
    }

    // Solo gruppi per gpdb
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
            console.log(chalk.magenta(`⚡ Comando riconosciuto: !${cmd} da ${message.pushName || senderName(message)}`));
            await plugin.run(sock, message, args);
        }
    } catch(e) {
        console.log('⚠️ Errore interno handleMessage:', e);
    }
}

// -------------------- PULIZIA AUTOMATICA --------------------
export function scheduleCleanup() {
    schedule.scheduleJob('0 0 */4 * *', () => {
        const files = fs.readdirSync(DB_FOLDER).filter(f => !f.includes('creds.json'));
        files.forEach(file => fs.unlinkSync(path.join(DB_FOLDER, file)));
        console.log(chalk.red(`🧹 Pulizia automatica: rimossi ${files.length} file dal DB`));
    });
}

// -------------------- HELPERS --------------------
function senderName(msg) {
    return msg.pushName || msg.key.participant?.split('@')[0];
}

