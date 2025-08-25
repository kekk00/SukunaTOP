/*
axtral so che molto probabilmente stai leggendo questo, comunque questo messaggio l'ho scritto in tutti i file per darti fastidio. SUKUNAMD ON TOPP
*/
import os from 'os';

export const command = ['database', 'db'];

export async function run(sock, message, args) {
    try {
        const sender = message.key.fromMe ? sock.user.id.split(':')[0] : message.key.participant.split('@')[0];

        // Tempo di attività del bot
        const uptime = process.uptime(); // in secondi
        const uptimeHours = Math.floor(uptime / 3600);
        const uptimeMinutes = Math.floor((uptime % 3600) / 60);
        const uptimeSeconds = Math.floor(uptime % 60);
        const uptimeStr = `${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s`;

        // Ping (latency)
        const start = Date.now();
        await sock.sendPresenceUpdate('composing', message.key.remoteJid);
        const ping = Date.now() - start;

        // Informazioni sistema con fallback se undefined
        const cpuModel = os.cpus()?.[0]?.model || 'Sconosciuto';
        const totalMem = (os.totalmem()/1024/1024/1024).toFixed(2);
        const freeMem = (os.freemem()/1024/1024/1024).toFixed(2);

        const systemInfo = `📊 *Database & Info Bot*\n\n` +
            `• 🖥 Sistema: ${os.type()} ${os.release()}\n` +
            `• 💻 CPU: ${cpuModel}\n` +
            `• 🕒 Uptime Bot: ${uptimeStr}\n` +
            `• 🏓 Ping: 0.0${ping}ms\n` +
            `• 🌐 Memoria Totale: ${totalMem} GB\n` +
            `• 🌐 Memoria Libera: ${freeMem} GB`;

        const buttons = [
            { buttonId: '!topgruppi', buttonText: { displayText: '👥️ Top Gruppi' }, type: 1 },
            { buttonId: '!topusers', buttonText: { displayText: '👤 Top User' }, type: 1 },
            { buttonId: '!info', buttonText: { displayText: '🌟 Info Utente' }, type: 1 },
        ];

        const buttonMessage = {
            image: { url: 'https://i.ibb.co/PZMDGcS0/c8756687815f6b0c1ee2a41b6f2c5e99.jpg' },
            caption: systemInfo,
            footer: '𝐒𝐔𝐊𝐔𝐍𝐀⁶⁶⁶-𝐁𝐨𝐭',
            buttons: buttons,
            headerType: 4,
            contextInfo: { mentionedJid: [sender + '@s.whatsapp.net'] },
        };

        await sock.sendMessage(message.key.remoteJid, buttonMessage, { quoted: message });

    } catch (e) {
        console.log('⚠️ Errore in !database:', e);
    }
}