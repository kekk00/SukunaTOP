/*
axtral so che molto probabilmente stai leggendo questo, comunque questo messaggio l'ho scritto in tutti i file per darti fastidio. SUKUNAMD ON TOPP
*/
export const command = ['work'];

export async function run(sock, message, args) {
    const text = "⛔️ Stiamo ancora lavorando su questa funzione! Attendi e arriverà qualcosa di fantastico! 🎉";

    const buttons = [
        { buttonId: '!comandi', buttonText: { displayText: '♻️ Lista Comandi' }, type: 1 },
]

    await sock.sendMessage(message.key.remoteJid, {
        text,
        buttons,
        headerType: 1
    }, { quoted: message });
    
}