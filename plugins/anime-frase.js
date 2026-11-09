/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys';

let handler = async (m, { conn }) => {
    await m.react('⏳');

    let frases = [
        { p: '🦅 JIGORO KUWAJIMA', f: 'Você pode chorar, não tem problema. Só não desista! Acredite em si mesmo... você será recompensado sem dúvida.' },
        { p: '🌸 NEZUKO KAMADO', f: 'Não carregue esse peso sem razão, há coisas que estão fora do nosso controle. A felicidade só depende de você mesmo.' },
        { p: '🔥 KYOJURO RENGOKU', f: 'Vivam com orgulho e de cabeça erguida! Mantenha seu coração ardendo, não importa o que aconteça.' },
        { p: '👑 LELOUCH LAMPÉROUGE', f: 'Quando há maldade neste mundo que a justiça não pode vencer, você suparia suas mãos com o mal para derrotá-lo?' },
        { p: '⭐ NARUTO UZUMAKI', f: 'Eu jamais me rendo, e jamais volto atrás na minha palavra, esse é o meu Caminho Ninja!' },
        { p: '👁️ ITACHI UCHIHA', f: 'As pessoas vivem suas vidas seguindo o que aceitam como correto e verdadeiro. É assim que definem a realidade.' },
        { p: '⚡ KILLUA ZOLDYCK', f: 'Se eu ignorar um amigo que tenho capacidade de ajudar, não estaria traindo ele?' },
        { p: '💔 MAKIMA', f: 'Atos luxuriosos são mais prazerosos quanto melhor você conhece a outra pessoa.' },
        { p: '🍜 SAITAMA', f: 'Se você realmente quer ser forte, pare de se preocupar com o que os outros pensam de você.' },
        { p: '🌱 MIGHT GUY', f: 'Todo o esforço é inútil se você não acredita em si mesmo.' },
        { p: '♦️ TANJIRO KAMADO', f: 'A vida segue, você deve continuar mesmo tendo perdido alguém, não importa o quão forte seja o golpe.' },
        { p: '👱🏻 MELIODAS', f: 'Você pode mentir o quanto quiser, mas jamais poderá enganar o seu coração.' },
        { p: '🥷 KAKASHI HATAKE', f: 'No mundo ninja, aqueles que quebram as regras são lixo, mas aqueles que abandonam seus amigos são piores que lixo.' },
        { p: '🐉 SON GOKU', f: 'Se um perdedor faz muitos esforços, talvez possa superar os poderes de um guerreiro de elite.' },
        { p: '🏴‍☠️ MONKEY D. LUFFY', f: 'Se você não arrisca sua vida, não pode criar um futuro.' },
        { p: '🐼 GENMA SAOTOME', f: 'É muito fácil ferir os outros sem perceber. O importante não é o que os outros pensam, mas como você age.' },
        { p: '🉐 SON GOKU (GOKU)', f: 'Você é um ser incrível, deu o seu melhor e por isso eu te admiro. Espero que renasça como alguém bom.' },
        { p: '🥦 IZUKU MIDORIYA', f: 'Nem tudo é preto no branco, a maioria do mundo é cinza, por isso devemos estender a mão.' },
        { p: '🎸 HITORI GOTO', f: 'Os introvertidos sempre incomodam os outros; se esperamos num canto, nos criticam por não colaborar.' },
        { p: '👊 ROCK LEE', f: 'O poder de acreditar em si mesmo pode ser o poder para mudar o destino.' },
        { p: '🏺 GAARA', f: 'Só porque alguém é importante para você, não significa necessariamente que essa pessoa seja boa.' },
        { p: '🎭 L (LAWLIET)', f: 'Não é que eu seja antissocial ou solitário; é que eu conheço a estupidez humana e não quero me contagiar.' }
    ];

    const e = frases[Math.floor(Math.random() * frases.length)];
    
    let textoPrincipal = `🌙ᩚ⃟꙰⟡˖ *𝐅𝐑𝐀𝐒𝐄 𝐃𝐄 𝐀𝐍𝐈𝐌𝐄* 🌙⃟✿˚\n\n*${e.p}* diz:\n\n_"${e.f}"_\n\n*Gotica bot* 💋`.trim();

    try {
        const interactiveMessage = {
            body: { text: textoPrincipal },
            footer: { text: "Clique no botão abaixo para entrar no canal" },
            nativeFlowMessage: {
                buttons: [
                    {
                        name: "cta_url",
                        buttonParamsJson: JSON.stringify({
                            display_text: "𝖢𝖺𝗇𝖺𝗅 𝖽𝖺 𝖦𝗈́𝗍𝗂𝖼𝖺 💋",
                            url: "https://whatsapp.com/channel/0029Vb7PsjVA89Md7LCwWN1u"
                        })
                    }
                ]
            }
        };

        let msgi = generateWAMessageFromContent(m.chat, { 
            viewOnceMessage: { message: { interactiveMessage } } 
        }, { userJid: conn.user.id, quoted: m });

        await conn.relayMessage(m.chat, msgi.message, { messageId: msgi.key.id });
        await m.react('🌟');

    } catch (err) {
        await m.react('❌');
        conn.reply(m.chat, textoPrincipal, m);
    }
}

handler.help = ['fraseanime'];
handler.tags = ['anime'];
handler.command = ['fraseanime', 'frase'];

handler.cooldown = m => (m.sender.split`@`[0] === '556391330669' ? 0 : 5000);

export default handler;