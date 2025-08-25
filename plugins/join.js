// plugins/join.js
export const command = ['join'];

// Sostituisci con il numero autorizzato, formato completo con prefisso internazionale
const ALLOWED_NUMBER = '393297570233';

export async function run(sock, message, args) {
    try {
        const sender = message.key.participant?.split('@')[0] || message.key.remoteJid.split('@')[0];

        if (sender !== ALLOWED_NUMBER) {
            await sock.sendMessage(message.key.remoteJid, { text: '❌ Non sei autorizzato a usare questo comando.' });
            return;
        }

        const link = args[0];
        if (!link) {
            await sock.sendMessage(message.key.remoteJid, { text: '❌ Devi fornire un link di invito al gruppo!' });
            return;
        }

        // Accetta l'invito
        const response = await sock.groupAcceptInvite(link);
        await sock.sendMessage(message.key.remoteJid, { text: `✅ Bot entrato nel gruppo! ID: ${response}` });
    } catch (e) {
        console.log('⚠️ Errore in !join:', e.message);
        await sock.sendMessage(message.key.remoteJid, { text: '❌ Errore durante l\'entrata nel gruppo.' });
    }
}

