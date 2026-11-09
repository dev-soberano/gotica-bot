/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import { Maker } from 'imagemaker.js';

let cooldowns = {}
const TARGET_JID_DONO = '240041947357401@lid'
const DONO_PHONE = '556391330669'

const handler = async (m, { conn, args, command, usedPrefix }) => {
  const eDono = (m.sender.includes(DONO_PHONE) || m.sender === TARGET_JID_DONO)

  // REGRA SOBERANA: Leandro sem cooldown
  if (!eDono) {
    const tempoEspera = 20 * 1000 
    if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tempoEspera) {
      let restante = Math.ceil((cooldowns[m.sender] + tempoEspera - Date.now()) / 1000)
      return m.reply(`*⚠️ AGUARDE:* Olá, aguarde ${restante}s para criar outro logo.`)
    }
    cooldowns[m.sender] = Date.now()
  }

  const response = args.join(' ').split('|');
  if (!args[0]) return m.reply(`*📦 [❗] POR FAVOR, INSIRA UM TEXTO*\n\nExemplo: *${usedPrefix + command}* Gótica Bot`);

  const makers = {
    'logocorazon': 'https://en.ephoto360.com/text-heart-flashlight-188.html',
    'logochristmas': 'https://en.ephoto360.com/christmas-effect-by-name-376.html',
    'logopareja': 'https://en.ephoto360.com/sunlight-shadow-text-204.html',
    'logoglitch': 'https://en.ephoto360.com/create-digital-glitch-text-effects-online-767.html',
    'logosad': 'https://en.ephoto360.com/write-text-on-wet-glass-online-589.html',
    'logogaming': 'https://en.ephoto360.com/make-team-logo-online-free-432.html',
    'logosolitario': 'https://en.ephoto360.com/create-typography-text-effect-on-pavement-online-774.html',
    'logodragonball': 'https://en.ephoto360.com/create-dragon-ball-style-text-effects-online-809.html',
    'logoneon': 'https://en.ephoto360.com/create-impressive-neon-glitch-text-effects-online-768.html',
    'logogatito': 'https://en.ephoto360.com/handwritten-text-on-foggy-glass-online-680.html',
    'logochicagamer': 'https://en.ephoto360.com/create-cute-girl-gamer-mascot-logo-online-687.html',
    'logonaruto': 'https://en.ephoto360.com/naruto-shippuden-logo-style-text-effect-online-808.html',
    'logofuturista': 'https://en.ephoto360.com/light-text-effect-futuristic-technology-style-648.html',
    'logonube': 'https://en.ephoto360.com/cloud-text-effect-139.html',
    'logoangel': 'https://en.ephoto360.com/angel-wing-effect-329.html',
    'logocielo': 'https://en.ephoto360.com/create-a-cloud-text-effect-in-the-sky-618.html',
    'logograffiti3d': 'https://en.ephoto360.com/text-graffiti-3d-208.html',
    'logomatrix': 'https://en.ephoto360.com/matrix-text-effect-154.html',
    'logohorror': 'https://en.ephoto360.com/blood-writing-text-online-77.html',
    'logoalas': 'https://en.ephoto360.com/the-effect-of-galaxy-angel-wings-289.html',
    'logoarmy': 'https://en.ephoto360.com/free-gaming-logo-maker-for-fps-game-team-546.html',
    'logopubg': 'https://en.ephoto360.com/pubg-logo-maker-cute-character-online-617.html',
    'logopubgfem': 'https://en.ephoto360.com/pubg-mascot-logo-maker-for-an-esports-team-612.html',
    'logolol': 'https://en.ephoto360.com/make-your-own-league-of-legends-wallpaper-full-hd-442.html',
    'logoamongus': 'https://en.ephoto360.com/create-a-cover-image-for-the-game-among-us-online-762.html',
    'logovideopubg': 'https://en.ephoto360.com/lightning-pubg-video-logo-maker-online-615.html',
    'logovideotiger': 'https://en.ephoto360.com/create-digital-tiger-logo-video-effect-723.html',
    'logovideointro': 'https://en.ephoto360.com/free-logo-intro-video-maker-online-558.html',
    'logovideogaming': 'https://en.ephoto360.com/create-elegant-rotation-logo-online-586.html',
    'logoguerrero': 'https://en.ephoto360.com/create-project-yasuo-logo-384.html',
    'logoportadaplayer': 'https://en.ephoto360.com/create-the-cover-game-playerunknown-s-battlegrounds-401.html',
    'logoportadaff': 'https://en.ephoto360.com/create-free-fire-facebook-cover-online-567.html',
    'logoportadapubg': 'https://en.ephoto360.com/create-facebook-game-pubg-cover-photo-407.html',
    'logoportadacounter': 'https://en.ephoto360.com/create-youtube-banner-game-cs-go-online-403.html'
  };

  if (makers[command]) {
    try {
      await m.reply('*🎨 CRIANDO SEU LOGO, AGUARDE UM MOMENTO... ⏳*');
      const res = await new Maker().Ephoto360(makers[command], [response[0]]);
      await conn.sendFile(m.chat, res.imageUrl, 'logo.jpg', `*✅ LOGO GERADO COM SUCESSO!*`, m);
    } catch (e) {
      console.error(e);
      await m.reply('*❌ ERRO AO CRIAR LOGO. TENTE NOVAMENTE MAIS TARDE.*');
    }
  }
};

handler.help = ['logo <tipo>'];
handler.tags = ['logos'];
handler.command = ['logocorazon', 'logochristmas', 'logopareja', 'logoglitch', 'logosad', 'logogaming', 'logosolitario', 'logodragonball', 'logoneon', 'logogatito', 'logochicagamer', 'logonaruto', 'logofuturista', 'logonube', 'logoangel', 'logocielo', 'logograffiti3d', 'logomatrix', 'logohorror', 'logoalas', 'logoarmy', 'logopubg', 'logopubgfem', 'logolol', 'logoamongus', 'logovideopubg', 'logovideotiger', 'logovideointro', 'logovideogaming', 'logoguerrero', 'logoportadaplayer', 'logoportadaff', 'logoportadapubg', 'logoportadacounter'];
handler.register = false;

export default handler;