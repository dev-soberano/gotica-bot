/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys'

let handler = async (m, { conn, usedPrefix, command }) => {
  
  const fics = [
    "Ele a encurralou contra a parede fria, a sombra de seu corpo cobrindo qualquer saída. 'Você achou mesmo que poderia fugir de mim?', sussurrou ele, os olhos brilhando com uma obsessão perigosa. 'Nesse castelo, as únicas regras que existem são as minhas.' 🖤",
    "O cheiro de chuva e couro o denunciava antes mesmo de ele aparecer. 'Você é minha ruína', ele disse, apertando o pescoço dela com uma delicadeza mortal. 'E eu estou disposto a queimar o mundo inteiro só para garantir que ninguém mais te toque.' 💋",
    "Entre as sombras da biblioteca, ele a observava. Não era amor, era algo mais sombrio, algo que consumia a alma. 'Diga que me odeia', ele desafiou, aproximando os lábios de seu ouvido. 'Mas diga enquanto implora para que eu não te solte.' ✨",
    "Ele era o vilão da história de todos, mas por ela, ele seria o monstro que mataria qualquer um. 'Suas lágrimas são o meu vinho preferido', ele sorriu de forma cruel, limpando o rosto dela com o polegar. 'Agora, curve-se perante o seu rei.' 💫",
    "A faca brilhava sob a luz da lua, mas o perigo real estava no olhar de posse dele. 'O amor é para os fracos', ele rosnou, prendendo-a em seus braços de ferro. 'O que temos é uma obsessão que nem a morte pode separar.' 🌙",
    "Ele trancou a porta e jogou a chave pela janela. 'O mundo lá fora não existe mais para você', ele afirmou, aproximando-se com passos predatórios. 'Sua única liberdade agora é escolher como vai me obedecer.' 🖤",
    "'Você é um pecado que eu faço questão de cometer todas as noites', ele murmurou, traçando o contorno dos lábios dela com uma arma fria. 'Não reze por salvação, querida. Eu sou o seu inferno particular.' 💋",
    "A escuridão do quarto era iluminada apenas pelo brilho dos olhos dele. 'Eu te segui por meses, estudei cada passo seu. Você nunca esteve sozinha', ele confessou com um sorriso sombrio. 'Você sempre foi minha, só não sabia disso ainda.' ✨",
    "Ele a puxou pelo cabelo, obrigando-a a olhar para o caos que ele havia causado. 'Tudo isso foi por você', ele gritou sob a chuva. 'Se eu não puder te ter, ninguém mais terá um chão para pisar.' 💫",
    "O silêncio foi quebrado pelo som das algemas. 'Isso não é um castigo', ele disse, beijando a testa dela com uma ternura assustadora. 'É apenas a garantia de que você estará exatamente onde eu te deixei quando eu voltar.' 🖤",
    "'Eu não sou o seu herói, pequena flor', ele riu, as mãos manchadas de sangue. 'Eu sou o monstro que devorou o herói para ficar com a princesa. E eu não pretendo te devolver.' 🌙",
    "Ele apertou a cintura dela com força suficiente para deixar marcas. 'Essas manchas roxas são a minha assinatura', ele declarou com a voz rouca. 'Para que cada vez que você se olhe no espelho, lembre-se de quem é o seu dono.' 💋",
    "'Você pode gritar o quanto quiser, as paredes deste porão são grossas', ele explicou calmamente enquanto servia uma taça de vinho. 'Mas eu preferia que você usasse essa voz para gemer o meu nome.' ✨",
    "Ele a observava dormir através das câmeras. 'Tão inocente', pensou ele, acariciando a tela. 'Ela ainda acha que o destino a trouxe até mim, quando fui eu quem cercou todas as outras rotas.' 💫",
    "'Se você tentar escapar de novo, eu vou quebrar cada uma das suas esperanças até que a única coisa que reste seja eu', ele ameaçou, o olhar carregado de uma fúria possessiva. 'Entendido, meu anjo sombrio?' 🖤",
    "O toque dele era fogo e gelo. 'Eu destruí sua vida perfeita para construir uma nova ao meu redor', ele admitiu sem remorso. 'Você é o meu troféu de guerra, e eu pretendo te exibir nas sombras.' 🌙",
    "'O medo nos seus olhos me dá mais prazer do que qualquer beijo', ele sussurrou, prendendo as mãos dela acima da cabeça. 'Não pare de tremer. Eu quero sentir que você sabe exatamente quem eu sou.' 💋",
    "Ele limpou uma lágrima do rosto dela com a ponta de uma adaga. 'Você é linda quando está quebrada', ele admirou. 'Vou passar o resto da eternidade juntando os seus pedaços, desde que você pertença só a mim.' ✨",
    "'Eu matei por você, eu morreria por você, mas o mais importante: eu vou viver para te controlar', ele afirmou, trancando o colar de prata no pescoço dela. 'Agora você tem o meu selo.' 💫",
    "Ele se ajoelhou e forçou-a a fazer o mesmo. 'Neste quarto, eu sou o seu Deus', ele decretou, as mãos subindo pelas coxas dela. 'E a sua única religião será me satisfazer.' 🖤"
  ]

  const imagens = [
    'https://files.catbox.moe/q7fya6.jpg',
    'https://files.catbox.moe/l8rs8y.jpg',
    'https://files.catbox.moe/tb07kf.jpg'
  ]

  const trecho = fics[Math.floor(Math.random() * fics.length)]
  const imagem = imagens[Math.floor(Math.random() * imagens.length)]

  const media = await prepareWAMessageMedia({ image: { url: imagem } }, { upload: conn.waUploadToServer })

  const msg = generateWAMessageFromContent(m.chat, {
    viewOnceMessage: {
      message: {
        interactiveMessage: {
          body: { text: `꒷꒦꒷〘 𝓓𝓐𝓡𝓒 𝓡𝓞𝓜𝓐𝓝𝓒𝓔 〙꒷꒦꒷\n\n${trecho}\n\n╰─⭑꒷꒦꒷〘 🖤 〙꒷꒦꒷⭑─╯` },
          footer: { text: "Gótica Bot • Obsessão & Sombras" },
          header: {
            hasMediaAttachment: true,
            imageMessage: media.imageMessage
          },
          nativeFlowMessage: {
            buttons: [
              {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                  display_text: "💋 Gerar Outra",
                  id: `${usedPrefix}${command}`
                })
              }
            ]
          }
        }
      }
    }
  }, { quoted: m })

  await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id })
}

handler.help = ['fic']
handler.tags = ['fun']
handler.command = ['fic', 'darkromance', 'fanfic']

export default handler