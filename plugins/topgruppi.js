/*
axtral so che molto probabilmente stai leggendo questo, comunque questo messaggio l'ho scritto in tutti i file per darti fastidio. SUKUNAMD ON TOPP
*/

import { readDB } from '../handler.js';

export const command = ['topgruppi'];

/**
 * Ottiene l'emoji della medaglia in base alla posizione.
 * @param {number} pos - La posizione in classifica (da 0).
 * @returns {string} L'emoji della medaglia.
 */
function getMedaglia(pos) {
    const medals = ['🥇', '🥈', '🥉'];
    return medals[pos] || `🏅`;
}

/**
 * Funzione principale per l'esecuzione del comando.
 * @param {object} sock - L'oggetto del socket.
 * @param {object} message - L'oggetto del messaggio.
 */
export async function run(sock, message) {
    const from = message.key.remoteJid;
    try {
        // Legge il database in modo asincrono
        const gpdb = await readDB('gpdb.json');
        const all = Object.entries(gpdb || {});
        
        if (!all.length) {
            await sock.sendMessage(from, { text: 'Nessun dato sui gruppi al momento.' }, { quoted: message });
            return;
        }

        // Top 5 gruppi per messaggi
        const top = all.sort((a, b) => (b[1]?.messages || 0) - (a[1]?.messages || 0)).slice(0, 5);

        let caption = `🏆 *Top 5 Gruppi più attivi*\n\n`;

        for (let i = 0; i < top.length; i++) {
            const [jid, data] = top[i];
            const name = data?.subject || jid;
            const messages = data?.messages || 0;
            const members = data?.members || '-';
            
            caption += `${getMedaglia(i)} *${name}*\n`;
            caption += `  └─ ✉️ ${messages} messaggi\n`;
            caption += `  └─ 👥 ${members} membri\n\n`;
        }
        
        caption += `© SukunaTOP`;

        // Bottoni
        const buttons = [
            { buttonId: '!topusers', buttonText: { displayText: '👤 Top Users' }, type: 1 },
            { buttonId: '!info', buttonText: { displayText: '🌟 Info Utente' }, type: 1 }
        ];

        // Invio finale
        await sock.sendMessage(from, {
            text: caption,
            buttons,
            headerType: 1
        }, { quoted: message });

    } catch (e) {
        console.error('Errore !topgruppi:', e);
        try { await sock.sendMessage(from, { text: '⚠️ Errore generando la Top Gruppi.' }, { quoted: message }) } catch {}
    }
}

