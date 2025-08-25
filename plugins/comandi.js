/*
axtral so che molto probabilmente stai leggendo questo, comunque questo messaggio l'ho scritto in tutti i file per darti fastidio. SUKUNAMD ON TOPP
*/
export const command = ['comandi'];

export async function run(sock, message, args) {
    try {
        const sender = message.key.fromMe ? sock.user.id.split(':')[0] : message.key.participant.split('@')[0];

        // Link immagine (puoi sostituire con il tuo)
        const imageUrl = 'https://i.ibb.co/PZMDGcS0/c8756687815f6b0c1ee2a41b6f2c5e99.jpg';

        const buttons = [
            { buttonId: '!topgruppi', buttonText: { displayText: '👥️ Top Gruppi' }, type: 1 },
            { buttonId: '!topusers', buttonText: { displayText: '👤 Top User' }, type: 1 },
            { buttonId: '!profilo', buttonText: { displayText: '🌟 Info Utente' }, type: 1 },
            { buttonId: '!db', buttonText: { displayText: '🔰 Database' }, type: 1 }
        ];

        const buttonMessage = {
            image: { url: imageUrl },
            caption: `📜 *Comandi disponibili:*\n\n1️⃣ 👥️ Top Gruppi\n2️⃣ 👤 Top User\n3️⃣ 🌟 Info Utente\n4️⃣ 🔰 Database`,
            footer: '𝐒𝐔𝐊𝐔𝐍𝐀⁶⁶⁶-𝐁𝐨𝐭',
            buttons: buttons,
            headerType: 4, // 4 = immagine con bottoni
            contextInfo: { mentionedJid: [sender + '@s.whatsapp.net'] },
        };

        await sock.sendMessage(message.key.remoteJid, buttonMessage, { quoted: message });

    } catch (e) {
        console.log('⚠️ Errore in !comandi:', e);
    }
}