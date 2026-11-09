/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import axios from "axios";

let handler = async (m, { conn, text, usedPrefix, command }) => {
  // Para que serve: Gera imagens com Flux (SpiderX) ou AWS como backup.
  // Como usar: .flux um passarinho voando
  // Público: Membros, Admins e Soberano (Sem cooldown para o Leandro).

  if (!text) return conn.reply(m.chat, `*┇┆🔍 O que deseja desenhar?*\n\nExemplo: *${usedPrefix + command} um passarinho voando no pôr do sol*`, m)
  
  await m.react('🎨')

  try {
    // 1️⃣ PRIMEIRA OPÇÃO: Spider X (Prioridade do Soberano)
    const spiderKey = "txsOVBIevZekrQ6MC2bV"
    const spiderUrl = `https://api.spiderx.com.br/api/ai/flux?text=${encodeURIComponent(text)}&api_key=${spiderKey}`
    
    const response = await axios.get(spiderUrl, { timeout: 10000 }) // Timeout de 10s pra não travar se estiver em manutenção
    
    if (response.data && response.data.success && response.data.image) {
      await m.react('✅')
      return await conn.sendMessage(m.chat, {
          image: { url: response.data.image },
          caption: `*✨ Resultado Flux (SpiderX):* "${text}"\n\n*✦ Gótica Bot*`,
          mimetype: 'image/jpeg'
      }, { quoted: m })
    } else {
      throw new Error("SpiderX Offline ou Manutenção")
    }

  } catch (error) {
    console.log("SpiderX falhou, tentando Backup 01 (AWS)...")
    
    try {
      // 2️⃣ SEGUNDA OPÇÃO (BACKUP): AWS Amazon
      const awsUrl = `https://1yjs1yldj7.execute-api.us-east-1.amazonaws.com/default/ai_image?prompt=${encodeURIComponent(text)}&aspect_ratio=2:3`
      const resAws = await axios.get(awsUrl, {
          headers: { "user-agent": "Postify/1.0.0" }
      })

      if (resAws.data && resAws.data.image_link) {
          await m.react('✅')
          return await conn.sendMessage(m.chat, {
              image: { url: resAws.data.image_link },
              caption: `*✨ Resultado Flux:* "${text}"\n\n*✦ Gótica Bot*`,
              mimetype: 'image/jpeg'
          }, { quoted: m })
      } else {
          throw new Error("AWS Falhou")
      }

    } catch (e) {
      console.log("AWS falhou também.")
      await m.react('❌')
      conn.reply(m.chat, "*┇┆⚠️ Erro:* Soberano, tanto a SpiderX quanto a AWS estão indisponíveis no momento.", m)
    }
  }
};

handler.help = ["flux"];
handler.tags = ["ai"];
handler.command = ["flux", "fazer"];

export default handler;