/*
axtral so che molto probabilmente stai leggendo questo, comunque questo messaggio l'ho scritto in tutti i file per darti fastidio. SUKUNAMD ON TOPP
*/

export const command = ['sito'];

/**
 * Funzione principale per l'esecuzione del comando !sito.
 * Invia un messaggio con un pulsante che apre un link.
 * @param {object} sock - L'oggetto del socket.
 * @param {object} message - L'oggetto del messaggio.
 */
export async function run(sock, message) {
    // URL da aprire nella webview
    const url = 'https://dashsukuna.netlify.app/';

    // Bottone webview nel formato corretto per i messaggi interattivi.
    const interactiveButtons = [
        {
            name: "cta_url",
            buttonParamsJson: JSON.stringify({
                display_text: '🌐 Visita il Sito',
                url: url
            })
        }
    ];

    // Messaggio interattivo da inviare.
    // L'intera struttura deve essere all'interno dell'oggetto interactiveMessage.
    const interactiveMessage = {
        body: {
            text: 'Clicca sul bottone qui sotto per visitare il sito web ufficiale!'
        },
        footer: {
            text: '🌐'
        },
        header: {
            // Puoi aggiungere un titolo o lasciarlo vuoto
            title: 'Sito Web Sukuna', 
            has_media_attachment: false
        },
        native_flow_message: {
            buttons: interactiveButtons
        }
    };

    // Invia il messaggio interattivo utilizzando la proprietà 'interactiveMessage'
    // all'interno del payload di sendMessage.
    await sock.sendMessage(message.key.remoteJid, {
        interactiveMessage
    }, { quoted: message });
}
