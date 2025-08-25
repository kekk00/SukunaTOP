import { createCanvas, loadImage } from 'canvas';
import fs from 'fs';
import { readDB } from '../handler.js';

function getMedaglia(pos) {
  const medals = ['🥇','🥈','🥉','🏅','🏅','🏅','🏅','🏅','🏅','🏅'];
  return medals[pos] || '🏅';
}

export const command = ['topusers'];

export async function run(sock, message, args) {
  const usersdb = readDB('usersdb.json');

  const sorted = Object.entries(usersdb)
    .filter(([jid]) => !jid.endsWith('@g.us') && !jid.endsWith('@newsletter'))
    .sort((a,b)=>b[1].messages - a[1].messages)
    .slice(0, 7); // Mostra solo 7 utenti per 4:5

  const width = 1080;
  const height = 1350;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0,0,0,height);
  gradient.addColorStop(0, '#0f2027');
  gradient.addColorStop(0.5, '#203a43');
  gradient.addColorStop(1, '#2c5364');
  ctx.fillStyle = gradient;
  ctx.fillRect(0,0,width,height);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 70px Sans';
  ctx.textAlign = 'center';
  ctx.fillText('🏆 Top Utenti Globali 🏆', width/2, 100);

  const cardHeight = 130;
  const startY = 180;
  const spacing = 150;

  for (let i = 0; i < sorted.length; i++) {
    const [jid, info] = sorted[i];
    let name;
    try {
      name = await sock.getName(jid); // prende nome
    } catch {
      name = jid.split('@')[0];
    }

    let profilePicUrl;
    try {
      profilePicUrl = await sock.profilePictureUrl(jid);
    } catch {
      profilePicUrl = 'https://telegra.ph/file/22b3e3d2a7b9f346e21b3.png';
    }

    const y = startY + i * spacing;

    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.roundRect(60, y, width - 120, cardHeight, 30);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.font = '46px Sans';
    ctx.textAlign = 'left';
    ctx.fillText(getMedaglia(i), 90, y + 85);

    try {
      const img = await loadImage(profilePicUrl);
      const imgSize = 100;
      ctx.save();
      ctx.beginPath();
      ctx.arc(200 + imgSize / 2, y + cardHeight / 2, imgSize / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(img, 200, y + 15, imgSize, imgSize);
      ctx.restore();
    } catch (e) {
      console.error('Errore caricando immagine profilo:', e);
    }

    ctx.fillStyle = '#fff';
    ctx.font = '38px Sans';
    ctx.textAlign = 'left';
    ctx.fillText(name, 340, y + 60);

    ctx.fillStyle = '#ddd';
    ctx.font = '28px Sans';
    ctx.fillText(`✉️ ${info.messages} messaggi`, 340, y + 100);
  }

  ctx.fillStyle = '#aaa';
  ctx.font = '26px Sans';
  ctx.textAlign = 'center';
  ctx.fillText('© SukunaTOP', width/2, height - 40);

  const buffer = canvas.toBuffer('image/jpeg'); // jpeg compatibile Android/iPhone
  fs.writeFileSync('topusers_global.jpg', buffer);

  // Bottoni
  const buttons = [
    { buttonId: '!topgruppi', buttonText: { displayText: '👥️ Top Gruppi' }, type: 1 },
    { buttonId: '!profilo', buttonText: { displayText: '🌟 Info Utente' }, type: 1 },
    { buttonId: '!database', buttonText: { displayText: '🔰 Database' }, type: 1 }
  ];

  await sock.sendMessage(
    message.key.remoteJid,
    { 
      image: buffer, 
      caption: `🏆 Top 7 utenti più attivi globalmente`, 
      footer: 'Scegli un comando qui sotto:',
      buttons,
      headerType: 4
    },
    { quoted: message }
  );
}

