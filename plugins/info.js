/*
axtral so che molto probabilmente stai leggendo questo, comunque questo messaggio l'ho scritto in tutti i file per darti fastidio. SUKUNAMD ON TOPP
*/
import { readDB } from '../handler.js';
import { createCanvas, loadImage } from 'canvas';

export const command = ['profilo','info'];

export async function run(sock, message, args) {
    // Legge il database in modo asincrono
    const usersdb = await readDB('usersdb.json');

    // Ottiene il JID del mittente
    const sender = message.key.participant || message.key.remoteJid;
    const userJid = sender.endsWith('@g.us') ? message.key.participant : sender;

    // Ottiene i dati dell'utente dal database usando il JID. Se l'utente non esiste, inizializza con 0 messaggi.
    const user = usersdb[userJid] || { messages: 0 };

    // Ordina gli utenti per messaggi per calcolare la posizione
    const sorted = Object.entries(usersdb)
        .filter(([jid]) => !jid.endsWith('@g.us') && !jid.endsWith('@newsletter'))
        .sort((a, b) => b[1].messages - a[1].messages);

    // Trova la posizione dell'utente nella classifica
    const posizione = sorted.findIndex(([id]) => id === userJid) + 1;

    // Ottiene il nome dell'utente. Prima cerca il nome nel database, poi nei contatti e infine usa il JID.
    const nome = user.name || sock.contacts?.[userJid]?.name
              || sock.contacts?.[userJid]?.notify
              || userJid.split('@')[0];

    // Ottiene l'URL dell'immagine del profilo.
    let profilePicUrl;
    try {
        profilePicUrl = await sock.profilePictureUrl(userJid, 'image');
    } catch {
        profilePicUrl = 'https://telegra.ph/file/22b3e3d2a7b9f346e21b3.png';
    }

    const backgroundUrl = 'https://i.ibb.co/PZMDGcS0/c8756687815f6b0c1ee2a41b6f2c5e99.jpg';

    const width = 1280;
    const height = 720;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const bg = await loadImage(backgroundUrl);
    ctx.drawImage(bg, 0, 0, width, height);

    const rectWidth = 900;
    const rectHeight = 400;
    const rectX = (width - rectWidth) / 2;
    const rectY = (height - rectHeight) / 2;
    const borderRadius = 30;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.beginPath();
    ctx.moveTo(rectX + borderRadius, rectY);
    ctx.lineTo(rectX + rectWidth - borderRadius, rectY);
    ctx.quadraticCurveTo(rectX + rectWidth, rectY, rectX + rectWidth, rectY + borderRadius);
    ctx.lineTo(rectX + rectWidth, rectY + rectHeight - borderRadius);
    ctx.quadraticCurveTo(rectX + rectWidth, rectY + rectHeight, rectX + rectWidth - borderRadius, rectY + rectHeight);
    ctx.lineTo(rectX + borderRadius, rectY + rectHeight);
    ctx.quadraticCurveTo(rectX, rectY + rectHeight, rectX, rectY + rectHeight - borderRadius);
    ctx.lineTo(rectX, rectY + borderRadius);
    ctx.quadraticCurveTo(rectX, rectY, rectX + borderRadius, rectY);
    ctx.closePath();
    ctx.fill();

    // avatar più grande
    const avatar = await loadImage(profilePicUrl);
    const avatarSize = 220;
    const avatarX = rectX + 50;
    const avatarY = rectY + (rectHeight - avatarSize) / 2;

    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize);
    ctx.restore();

    // testi più grandi
    ctx.fillStyle = 'white';
    ctx.font = 'bold 64px Sans';
    ctx.fillText(nome, avatarX + avatarSize + 50, rectY + 150);

    ctx.font = '42px Sans';
    ctx.fillText(`💌 Messaggi: ${user.messages}`, avatarX + avatarSize + 50, rectY + 220);
    ctx.fillText(`🏆 Posizione: ${posizione || 'N/D'}`, avatarX + avatarSize + 50, rectY + 280);

    ctx.font = 'italic 28px Sans';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillText('Crediti a WhatsFight', 30, height - 40);

    const buffer = canvas.toBuffer('image/png');

    let text = `🌟 Profilo Utente\n\n`;
    text += `👤 Nome: ${nome}\n`;
    text += `💌 Messaggi: ${user.messages}\n`;
    text += `🏆 Posizione: ${posizione || 'N/D'}\n`;

    const buttons = [
        { buttonId: '/topusers', buttonText: { displayText: '👤 Top User' }, type: 1 },
        { buttonId: '/topgruppi', buttonText: { displayText: '👥 Top Gruppi' }, type: 1 },
        { buttonId: '/infogruppo', buttonText: { displayText: '👥 Info Gruppo'}, type: 1 }
    ];

    // Invia il messaggio con l'immagine, la didascalia e tagga l'utente
    await sock.sendMessage(message.key.remoteJid, {
        image: buffer,
        caption: text,
        buttons,
        mentions: [userJid],
        headerType: 1
    }, { quoted: message });
}

