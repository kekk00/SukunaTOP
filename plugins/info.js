import { readDB } from '../handler.js';

export const command = ['profilo'];

export async function run(sock, message, args) {
    const usersdb = readDB('usersdb.json');

    const sender = message.key.participant || message.key.remoteJid;
    const userJid = sender.endsWith('@g.us') ? message.key.participant : sender;

    const user = usersdb[userJid] || { messages: 0 };

    // ordina per messaggi
    const sorted = Object.entries(usersdb)
        .sort((a, b) => b[1].messages - a[1].messages);

    const posizione = sorted.findIndex(([id]) => id === userJid) + 1;

    // recupera il nome dall rubrica
    const nome = sock.contacts?.[userJid]?.name
              || sock.contacts?.[userJid]?.notify
              || userJid.split('@')[0];

    let text = `🌟 Profilo Utente\n\n`;
    text += `👤 Nome: ${nome}\n`;
    text += `💌 Messaggi: ${user.messages}\n`;
    text += `🏆 Posizione: ${posizione || 'N/D'}\n`;

    const buttons = [
        { buttonId: '!topusers', buttonText: { displayText: '👤 Top User' }, type: 1 },
        { buttonId: '!topgruppi', buttonText: { displayText: '👥 Top Gruppi' }, type: 1 }
    ];

    await sock.sendMessage(message.key.remoteJid, {
        text,
        buttons,
        mentions: [userJid],
        headerType: 1
    }, { quoted: message });
}