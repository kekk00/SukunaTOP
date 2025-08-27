/*
axtral so che molto probabilmente stai leggendo questo, comunque questo messaggio l'ho scritto in tutti i file per darti fastidio. SUKUNAMD ON TOPP
*/
import { readDB } from '../handler.js';
import { createCanvas, loadImage } from 'canvas';

export const command = ['infogruppo'];

export async function run(sock, message, args) {
    // Ottieni il JID del gruppo
    const groupJid = message.key.remoteJid;
    if (!groupJid.endsWith('@g.us')) {
        return sock.sendMessage(groupJid, { text: '❌ Questo comando funziona solo nei gruppi.' }, { quoted: message });
    }

    const usersdb = await readDB('usersdb.json');

    // info del gruppo
    const metadata = await sock.groupMetadata(groupJid);
    const groupName = metadata.subject || 'Gruppo senza nome';
    const membersCount = metadata.participants?.length || 0;

    // calcola messaggi totali del gruppo
    let totalMessages = 0;
    // Iteriamo solo sui partecipanti del gruppo per calcolare i messaggi
    for (const participant of metadata.participants) {
        const userJid = participant.id;
        if (usersdb[userJid]) {
            totalMessages += usersdb[userJid].messages || 0;
        }
    }

    // foto gruppo (fallback se non c'è)
    let groupPicUrl;
    try {
        groupPicUrl = await sock.profilePictureUrl(groupJid, 'image');
    } catch {
        groupPicUrl = 'https://telegra.ph/file/22b3e3d2a7b9f346e21b3.png';
    }

    const backgroundUrl = 'https://i.ibb.co/PZMDGcS0/c8756687815f6b0c1ee2a41b6f2c5e99.jpg';

    const width = 1280;
    const height = 720;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // sfondo
    const bg = await loadImage(backgroundUrl);
    ctx.drawImage(bg, 0, 0, width, height);

    // rettangolo nero al centro
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

    // avatar gruppo
    const avatar = await loadImage(groupPicUrl);
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

    // funzione per adattare font al rettangolo
    function fitText(text, maxWidth, startFontSize) {
        let fontSize = startFontSize;
        do {
            ctx.font = `bold ${fontSize}px Sans`;
            if (ctx.measureText(text).width <= maxWidth) break;
            fontSize -= 4;
        } while (fontSize > 24);
        return fontSize;
    }

    // titolo gruppo con adattamento
    const textX = avatarX + avatarSize + 50;
    const maxTextWidth = rectWidth - (avatarSize + 100);
    const fontSize = fitText(groupName, maxTextWidth, 64);

    ctx.font = `bold ${fontSize}px Sans`;
    ctx.fillStyle = 'white';
    ctx.fillText(groupName, textX, rectY + 130);

    // info gruppo
    ctx.font = '42px Sans';
    ctx.fillText(`👥 Membri: ${membersCount}`, textX, rectY + 200);
    ctx.fillText(`💌 Messaggi totali: ${totalMessages}`, textX, rectY + 260);

    // crediti
    ctx.font = 'italic 28px Sans';
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillText('Crediti a WhatsFight', 30, height - 40);

    const buffer = canvas.toBuffer('image/png');

    // testo normale
    let text = `🌟 Info Gruppo\n\n`;
    text += `👥 Nome: ${groupName}\n`;
    text += `👤 Membri: ${membersCount}\n`;
    text += `💌 Messaggi totali: ${totalMessages}\n`;

    const buttons = [
        { buttonId: '!topusers', buttonText: { displayText: '👤 Top User' }, type: 1 },
        { buttonId: '!profilo', buttonText: { displayText: '🌟 Info Utente' }, type: 1 }
    ];

    await sock.sendMessage(groupJid, {
        image: buffer,
        caption: text,
        buttons,
        headerType: 1
    }, { quoted: message });
}

