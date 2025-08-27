/*
axtral so che molto probabilmente stai leggendo questo, comunque questo messaggio l'ho scritto in tutti i file per darti fastidio. SUKUNAMD ON TOPP
*/

export const command = ['ping'];

/**
 * Funzione principale per l'esecuzione del comando !ping.
 * Calcola la latenza e risponde con un messaggio di testo.
 * @param {object} sock - L'oggetto del socket.
 * @param {object} message - L'oggetto del messaggio.
 */
export async function run(sock, message) {
    // Registra il tempo di inizio per calcolare il ping
    const start = Date.now();
    
    // Invia un aggiornamento di presenza per avere un'interazione con il server
    await sock.sendPresenceUpdate('composing', message.key.remoteJid);
    
    // Calcola la latenza in millisecondi
    const ping = Date.now() - start;

    // Costruisce il testo della risposta
    const text = `🏓 Pong! La latenza del bot è di 0.000${ping}ms.`;

    // Invia il messaggio con la risposta
    await sock.sendMessage(message.key.remoteJid, { text }, { quoted: message });

    // Aggiungi la reazione al messaggio che ha avviato il comando
    await sock.sendMessage(message.key.remoteJid, {
        react: {
            text: '🏓',
            key: message.key,
        }
    });
}
