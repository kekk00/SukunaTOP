/*
axtral so che molto probabilmente stai leggendo questo, comunque questo messaggio l'ho scritto in tutti i file per darti fastidio. SUKUNAMD ON TOPP
*/
import { createCanvas, loadImage } from 'canvas';
import { readDB } from '../handler.js';

export const command = ['topgruppi'];

// fallback avatar (immagine leggera)
const FALLBACK_IMG = 'https://telegra.ph/file/22b3e3d2a7b9f346e21b3.png';

function getMedaglia(i) {
  const medals = ['🥇','🥈','🥉','🏅','🏅'];
  return medals[i] || `🏅 ${i+1}`;
}

// roundRect compat (alcuni ambienti non hanno ctx.roundRect)
function drawRoundRect(ctx, x, y, w, h, r = 30) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

function ellipsize(ctx, text, maxWidth) {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let out = text;
  while (out.length && ctx.measureText(out + '…').width > maxWidth) {
    out = out.slice(0, -1);
  }
  return out + '…';
}

export async function run(sock, message) {
  try {
    const gpdb = readDB('gpdb.json');
    const all = Object.entries(gpdb || {});
    if (!all.length) {
      await sock.sendMessage(message.key.remoteJid, { text: 'Nessun dato sui gruppi al momento.' }, { quoted: message });
      return;
    }

    // top 5 gruppi per messaggi
    const top = all.sort((a, b) => (b[1]?.messages || 0) - (a[1]?.messages || 0)).slice(0, 5);

    // mappa subject -> jid (per provare a prendere la foto gruppo)
    let subjectToJid = {};
    try {
      const groups = await sock.groupFetchAllParticipating();
      for (const [jid, md] of Object.entries(groups || {})) {
        if (md?.subject) subjectToJid[md.subject] = jid;
      }
    } catch {
      // opzionale: ignoriamo se fallisce
    }

    // canvas 1080x1350 (4:5)
    const width = 1080;
    const height = 1350;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // sfondo
    const g = ctx.createLinearGradient(0, 0, 0, height);
    g.addColorStop(0, '#232526');
    g.addColorStop(0.5, '#414345');
    g.addColorStop(1, '#232526');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);

    // titolo
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 70px Sans';
    ctx.textAlign = 'center';
    ctx.fillText('👥 Top Gruppi 👥', width / 2, 100);

    const cardH = 180;
    const startY = 180;
    const spacing = 210;

    for (let i = 0; i < top.length; i++) {
      const [subjectOrKey, data] = top[i];
      const name = String(subjectOrKey);
      const messages = data?.messages ?? 0;
      const members = data?.members ?? '-';

      const groupJid = subjectToJid[name]; // se esiste
      let ppic = FALLBACK_IMG;
      if (groupJid) {
        try {
          ppic = await sock.profilePictureUrl(groupJid, 'image');
        } catch {}
      }

      const y = startY + i * spacing;

      // card
      ctx.fillStyle = 'rgba(255,255,255,0.10)';
      drawRoundRect(ctx, 60, y, width - 120, cardH, 40);
      ctx.fill();

      // medaglia
      ctx.fillStyle = '#fff';
      ctx.font = '50px Sans';
      ctx.textAlign = 'left';
      ctx.fillText(getMedaglia(i), 90, y + 110);

      // avatar rotondo
      try {
        const img = await loadImage(ppic);
        const imgSize = 120;
        ctx.save();
        ctx.beginPath();
        ctx.arc(230 + imgSize / 2, y + cardH / 2, imgSize / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
        ctx.drawImage(img, 230, y + 30, imgSize, imgSize);
        ctx.restore();
      } catch {
        // se fallisce, metti un cerchio pieno
        ctx.save();
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.beginPath();
        ctx.arc(230 + 60, y + 90, 60, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // testo
      ctx.fillStyle = '#fff';
      ctx.textAlign = 'left';
      ctx.font = 'bold 40px Sans';
      const nameMax = width - 120 - 380; // spazio dal 380 al bordo destro della card
      const safeName = ellipsize(ctx, name, nameMax);
      ctx.fillText(safeName, 380, y + 70);

      ctx.fillStyle = '#ddd';
      ctx.font = '30px Sans';
      ctx.fillText(`✉️ ${messages} messaggi`, 380, y + 115);
      ctx.fillText(`👥 ${members} membri`, 380, y + 155);
    }

    // footer
    ctx.fillStyle = '#aaa';
    ctx.font = '26px Sans';
    ctx.textAlign = 'center';
    ctx.fillText('© SukunaTOP', width / 2, height - 40);

    // JPEG → migliore compatibilità iOS
    const buffer = canvas.toBuffer('image/jpeg', { quality: 0.9, progressive: true });

    const buttons = [
      { buttonId: '!topusers', buttonText: { displayText: '👤 Top Users' }, type: 1 },
      { buttonId: '!profilo',  buttonText: { displayText: '🌟 Info Utente' }, type: 1 }
    ];

    await sock.sendMessage(
      message.key.remoteJid,
      {
        image: buffer,
        caption: '👥 Top 5 gruppi più attivi',
        footer: '𝐒𝐔𝐊𝐔𝐍𝐀⁶⁶⁶-𝐁𝐨𝐭',
        buttons,
        headerType: 4
      },
      { quoted: message }
    );
  } catch (e) {
    console.error('Errore in !topgruppi:', e);
    try {
      await sock.sendMessage(message.key.remoteJid, { text: '⚠️ Errore generando la Top Gruppi.' }, { quoted: message });
    } catch {}
  }
}

