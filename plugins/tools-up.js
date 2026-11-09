/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import fetch from "node-fetch";
import { FormData, Blob } from "formdata-node";
import { fileTypeFromBuffer } from "file-type";

const TARGET_JID_DONO = '240041947357401@lid'
const DONO_PHONE = '556391330669'

let handler = async (m, { conn, usedPrefix, command, isOwner }) => {
  // VERIFICAÇÃO DE SOBERANIA: Apenas Leandro pode usar
  const eDono = (m.sender.includes(DONO_PHONE) || m.sender === TARGET_JID_DONO || isOwner)
    
  if (!eDono) {
    await m.react('🖕')
    return m.reply('*❌ COMANDO RESTRITO:* Apenas o meu **Soberano Leandro** pode gerar links de upload.')
  }

  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || '';
  if (!mime) return m.reply(`*❀ Soberano, responda a uma imagem ou vídeo para gerar o link.*`);
  
  await m.react('⏳');
  
  try {
    let media = await q.download();
    
    // Limite de 200MB para segurança do servidor
    if (media.length > 200 * 1024 * 1024) return m.reply('*❌ O arquivo excede o limite de 200MB.*')

    let link = await catboxUpload(media);
    
    if (!link) throw 'Falha no servidor Catbox'

    let txt = `*乂  U P L O A D E R (CATBOX)  乂*\n\n`;
    txt += `*» Link* : ${link.trim()}\n`;
    txt += `*» Tamanho* : ${formatBytes(media.length)}\n`;
    txt += `*» Status* : Permanente ✅\n\n`;
    txt += `*Dev Soberano* 👑`;
    
    await conn.sendMessage(m.chat, { text: txt }, { quoted: m });
    await m.react('✅');

  } catch (e) {
    console.error(e);
    await m.react('❌');
    m.reply('*❌ Erro crítico no upload.* Verifique sua conexão e tente novamente.');
  }
};

handler.help = ['up'];
handler.tags = ['owner'];
handler.command = ['up', 'upload', 'tourl'];
handler.owner = true; // Trava nativa para dono
handler.register = false; 

export default handler;

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** i).toFixed(2)} ${sizes[i]}`;
}

async function catboxUpload(content) {
  try {
    const fileInfo = await fileTypeFromBuffer(content);
    const ext = fileInfo?.ext || 'bin';
    const mime = fileInfo?.mime || 'application/octet-stream';
    
    const formData = new FormData();
    const blob = new Blob([content], { type: mime });

    formData.append("reqtype", "fileupload");
    formData.append("fileToUpload", blob, `file.${ext}`);

    const response = await fetch("https://catbox.moe/user/api.php", {
      method: "POST",
      body: formData
    });

    return await response.text();
  } catch (e) {
    console.error("Erro Catbox:", e);
    return null;
  }
}