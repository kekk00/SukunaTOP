/*
axtral so che molto probabilmente stai leggendo questo, comunque questo messaggio l'ho scritto in tutti i file per darti fastidio. SUKUNAMD ON TOPP
*/
import { readDB } from '../handler.js';

/**
 * Ottiene l'emoji della medaglia in base alla posizione.
 * @param {number} pos - La posizione in classifica (da 0).
 * @returns {string} L'emoji della medaglia.
 */
function getMedaglia(pos) {
  const medals = ['🥇', '🥈', '🥉'];
  return medals[pos] || '🏅';
}

export const command = ['topusers'];

/**
 * Funzione principale per l'esecuzione del comando.
 * @param {object} sock - L'oggetto del socket.
 * @param {object} message - L'oggetto del messaggio.
 * @param {Array<string>} args - Gli argomenti del comando.
 */
export async function run(sock, message, args) {
  const usersdb = await readDB('usersdb.json');
  
  // Filtra e ordina gli utenti per numero di messaggi, prendendo solo i primi 5.
  const sorted = Object.entries(usersdb)
    .filter(([jid]) => !jid.endsWith('@g.us') && !jid.endsWith('@newsletter'))
    .sort((a,b)=>b[1].messages - a[1].messages)
    .slice(0, 5);

  // Aggiunto un controllo: se non ci sono utenti nel database, invia un messaggio specifico.
  if (sorted.length === 0) {
      const buttons = [
        { buttonId: '!topgruppi', buttonText: { displayText: '👥️ Top Gruppi' }, type: 1 },
        { buttonId: '!profilo', buttonText: { displayText: '🌟 Info Utente' }, type: 1 },
        { buttonId: '!database', buttonText: { displayText: '🔰 Database' }, type: 1 }
      ];
      await sock.sendMessage(message.key.remoteJid, {
          text: "❌ Il database degli utenti è vuoto. Per visualizzare la classifica, gli utenti devono prima aver inviato messaggi. Assicurati che il bot sia attivo e che i messaggi vengano processati correttamente.",
          buttons,
          headerType: 1
      }, { quoted: message });
      return;
  }
  
  let caption = `🏆 *Top 5 Utenti Globali*\n\n`;

  // Costruisce il testo del messaggio formattato.
  for (let i = 0; i < sorted.length; i++) {
    const [jid, info] = sorted[i];
    // Ottiene il nome dell'utente, dando la priorità al nome salvato nel database.
    const name = info.name || jid.split('@')[0];
    
    caption += `${getMedaglia(i)} *${name}*\n`;
    caption += `  └─ ✉️ ${info.messages} messaggi\n\n`;
  }
  
  caption += `© SukunaTOP`;
  
  // Bottoni da includere nel messaggio.
  const buttons = [
    { buttonId: '!topgruppi', buttonText: { displayText: '👥️ Top Gruppi' }, type: 1 },
    { buttonId: '!profilo', buttonText: { displayText: '🌟 Info Utente' }, type: 1 },
    { buttonId: '!database', buttonText: { displayText: '🔰 Database' }, type: 1 }
  ];

  // Invia il messaggio con i bottoni.
  await sock.sendMessage(message.key.remoteJid, {
      text: caption,
      buttons,
      headerType: 1
  }, { quoted: message });
}

