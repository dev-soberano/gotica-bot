/**
═════╝ ╚═════╝    ╚═╝      ╚═════╝  ╚═════╝ ╚═╝  ╚═╝
 *
 * @project Gótica Bot - Definição dos Menus
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 *
 * O menu principal é limpo: só o texto de infos do bot + vídeo.
 * As opções ficam TODAS no botão de lista nativa "OPÇÕES".
 */

import { cabecalhoMenu, cabecalhoSubmenu } from './molduras.js'

import { MENU_CATEGORIAS_REAIS } from './menu-categorias.js'

export const MENU_PREFIX = 'menu:'

/**
 * Categorias do menu.
 * Aparecem como linhas da lista nativa quando o usuário toca no botão.
 */
export const MENU_CATEGORIES = MENU_CATEGORIAS_REAIS

const CATEGORIAS_LEGADO = [
    {
        id: 'menubrincadeiras',
        emoji: '🎭',
        label: 'Menu Brincadeiras',
        description: 'Comandos de brincadeiras.',
        items: [
            { cmd: '8ball', label: '8 Ball', desc: 'Bola de previsão.' },
            { cmd: 'darcu', label: 'Sortear CU', desc: 'Sorteia alguém.' },
            { cmd: 'forca', label: 'Forca', desc: 'Jogo da forca.' },
            { cmd: 'velha', label: 'Jogo da Velha', desc: 'Tabuleiro clássico.' },
            { cmd: 'anagrama', label: 'Anagrama', desc: 'Jogo de anagramas.' },
            { cmd: 'enigma', label: 'Enigma', desc: 'Jogo de enigma.' },
            { cmd: 'quizanimais', label: 'Quiz Animais', desc: 'Quiz de animais.' },
            { cmd: 'quizfutebol', label: 'Quiz Futebol', desc: 'Quiz de futebol.' },
            { cmd: 'gartic', label: 'Gartic', desc: 'Desenho adivinhado.' },
            { cmd: 'whatmusic', label: 'What Music', desc: 'Adivinhe a música.' },
            { cmd: 'sorteio', label: 'Sorteio', desc: 'Sorteia membros.' },
            { cmd: 'fic', label: 'Fanfic', desc: 'Cria uma fanfic.' },
            { cmd: 'akinator', label: 'Akinator', desc: 'Descubra o personagem.' }
        ]
    },
    {
        id: 'menulogos',
        emoji: '🖌️',
        label: 'Menu Logos',
        description: 'Logos e efeitos.',
        items: [
            { cmd: 'logo', label: 'Logo', desc: 'Logo com texto.' },
            { cmd: 'logoneon', label: 'Logo Neon', desc: 'Estilo neon.' },
            { cmd: 'logomatrix', label: 'Logo Matrix', desc: 'Estilo matrix.' },
            { cmd: 'logoglitch', label: 'Logo Glitch', desc: 'Estilo glitch.' },
            { cmd: 'logosad', label: 'Logo Sad', desc: 'Estilo triste.' },
            { cmd: 'logodragonball', label: 'Logo Dragon Ball', desc: 'Tema Dragon Ball.' },
            { cmd: 'logopubg', label: 'Logo PUBG', desc: 'Tema PUBG.' },
            { cmd: 'logolol', label: 'Logo LOL', desc: 'Tema League of Legends.' },
            { cmd: 'logohorror', label: 'Logo Horror', desc: 'Estilo de terror.' },
            { cmd: 'logomaker', label: 'Logo Maker', desc: 'Criador de logos.' }
        ]
    },
    {
        id: 'menurpg',
        emoji: '🐉',
        label: 'Menu RPG',
        description: 'Comandos de RPG.',
        items: [
            { cmd: 'nivel', label: 'Level', desc: 'XP, nível e patente.' },
            { cmd: 'level', label: 'Patente', desc: 'Seu level atual.' },
            { cmd: 'ranklevel', label: 'Ranking', desc: 'Ranking do grupo.' },
            { cmd: 'rankglobal', label: 'Ranking Global', desc: 'Ranking geral.' },
            { cmd: 'rankxp', label: 'Ranking XP', desc: 'Ranking por XP.' },
            { cmd: 'addtag', label: 'Add Tag', desc: 'Aplique uma tag.' },
            { cmd: 'removetag', label: 'Del Tag', desc: 'Remova sua tag.' },
            { cmd: 'listatags', label: 'Lista de Tags', desc: 'Tags disponíveis.' },
            { cmd: 'minhastag', label: 'Minhas Tags', desc: 'Suas tags.' },
            { cmd: 'trabalhar', label: 'Trabalhar', desc: 'Ganhe coins.' },
            { cmd: 'apostar', label: 'Apostar', desc: 'Aposte coins.' },
            { cmd: 'casino', label: 'Cassino', desc: 'Jogar no cassino.' },
            { cmd: 'slot', label: 'Slot', desc: 'Caça-níquel.' },
            { cmd: 'ruleta', label: 'Roleta', desc: 'Roleta da fortuna.' },
            { cmd: 'roubar', label: 'Roubar', desc: 'Roubar coins.' },
            { cmd: 'loja', label: 'Loja', desc: 'Compre itens.' },
            { cmd: 'inventario', label: 'Inventário', desc: 'Seus itens.' },
            { cmd: 'cofre', label: 'Cofre', desc: 'Recompensa diária.' },
            { cmd: 'registrarcidade', label: 'Registrar Cidade', desc: 'Comece na cidade.' },
            { cmd: 'perfilcidade', label: 'Perfil da Cidade', desc: 'Seu personagem.' },
            { cmd: 'cidadebanco', label: 'Banco da Cidade', desc: 'Operações bancárias.' },
            { cmd: 'crimecidade', label: 'Crime', desc: 'Cometa um crime.' },
            { cmd: 'hospitalcidade', label: 'Hospital', desc: 'Trate-se.' }
        ]
    },
    {
        id: 'menuadm',
        emoji: '⚙️',
        label: 'Menu ADM',
        description: 'Comandos de administração.',
        items: [
            { cmd: 'promover', label: 'Promover', desc: 'Dê admin a um membro.' },
            { cmd: 'rebaixar', label: 'Rebaixar', desc: 'Tire admin de um membro.' },
            { cmd: 'ban', label: 'Ban', desc: 'Banir um membro.' },
            { cmd: 'hidetag', label: 'HideTag', desc: 'Marcar todos.' },
            { cmd: 'link', label: 'Link do Grupo', desc: 'Link de convite.' },
            { cmd: 'revlinkgp', label: 'Resetar Link', desc: 'Gera um novo link.' },
            { cmd: 'infogrupo', label: 'Info do Grupo', desc: 'Dados do grupo.' },
            { cmd: 'statusgp', label: 'Status Grupo', desc: 'Status completo.' },
            { cmd: 'admins', label: 'Admins', desc: 'Lista de admins.' },
            { cmd: 'fixname', label: 'Renomear Grupo', desc: 'Muda o nome do grupo.' },
            { cmd: 'mudardesc', label: 'Mudar Descrição', desc: 'Muda a descrição.' },
            { cmd: 'antitoxic', label: 'Anti-Tóxico', desc: 'Bloqueie palavrões.' },
            { cmd: 'addpalavrao', label: 'Add Palavrão', desc: 'Adicionar palavra proibida (dono).' },
            { cmd: 'delpalavrao', label: 'Del Palavrão', desc: 'Remova palavra proibida (dono).' },
            { cmd: 'antiflood', label: 'Anti-Flood', desc: 'Proteja de spam rápido.' },
            { cmd: 'antispam', label: 'Anti-Spam', desc: 'Anti-spam do grupo.' },
            { cmd: 'antilinkhard', label: 'Anti-Link Rígido', desc: 'Bloqueie qualquer link.' },
            { cmd: 'soadm', label: 'Só Admin', desc: 'Restrinja aos admins.' },
            { cmd: 'mutar', label: 'Mute', desc: 'Silenciar o grupo.' },
            { cmd: 'sorteio', label: 'Sorteio', desc: 'Sorteie membros.' },
            { cmd: 'recrutar', label: 'Recrutar', desc: 'Convide alguém.' },
            { cmd: 'puxararquivo', label: 'Puxar Arquivo', desc: 'Envia arquivo ao grupo.' },
            { cmd: 'addperm', label: 'Add Permissão', desc: 'Dê permissão.' },
            { cmd: 'rmperm', label: 'Del Permissão', desc: 'Revogue permissão.' },
            { cmd: 'listperm', label: 'Lista de Permissões', desc: 'Permissões do grupo.' },
            { cmd: 'donogp', label: 'Assumir Grupo', desc: 'Torne-se dono do grupo.' }
        ]
    },
    {
        id: 'menudono',
        emoji: '👑',
        label: 'Menu Dono',
        description: 'Comandos restritos do dono.',
        items: [
            { cmd: 'dono', label: 'Donos', desc: 'Donos cadastrados.' },
            { cmd: 'meusdados', label: 'Meus Dados', desc: 'Seus dados de identificação.' },
            { cmd: 'setdono', label: 'Set Dono', desc: 'Defina um dono (1-6).' },
            { cmd: 'rmdono', label: 'Del Dono', desc: 'Remova um dono.' },
            { cmd: 'on', label: 'Ligar Bot', desc: 'Ativar o bot.' },
            { cmd: 'off', label: 'Desligar Bot', desc: 'Desativar o bot.' },
            { cmd: 'reiniciar', label: 'Reiniciar', desc: 'Reiniciar o bot.' },
            { cmd: 'prefixo', label: 'Prefixo', desc: 'Alterar o prefixo.' },
            { cmd: 'addmod', label: 'Add Moderador', desc: 'Adicionar moderador.' },
            { cmd: 'rmmod', label: 'Del Moderador', desc: 'Remover moderador.' },
            { cmd: 'listmod', label: 'Lista de Mods', desc: 'Moderadores cadastrados.' },
            { cmd: 'modmode', label: 'Modo Moderador', desc: 'Ativa o modo moderador.' },
            { cmd: 'addvip', label: 'Add VIP', desc: 'Promover a VIP.' },
            { cmd: 'delvip', label: 'Del VIP', desc: 'Remover VIP.' },
            { cmd: 'viplist', label: 'Lista de VIPs', desc: 'VIPs cadastrados.' },
            { cmd: 'dardinheiro', label: 'Add Coins', desc: 'Adicionar coins.' },
            { cmd: 'addxp', label: 'Add XP', desc: 'Adicionar XP.' },
            { cmd: 'rgcmd', label: 'Add Cmd', desc: 'Crie um comando.' },
            { cmd: 'delcmd', label: 'Del Cmd', desc: 'Remova um comando.' },
            { cmd: 'listcmd', label: 'Lista de Cmds', desc: 'Comandos personalizados.' },
            { cmd: 'noprefix', label: 'Add NoPrefix', desc: 'Comando sem prefixo.' },
            { cmd: 'delsession', label: 'Del Session', desc: 'Apagar sessão.' },
            { cmd: 'addrepo', label: 'Add Repo', desc: 'Adicionar repositório.' },
            { cmd: 'listrepo', label: 'Lista de Repos', desc: 'Repositórios.' },
            { cmd: 'editchave', label: 'Editar Chave PIX', desc: 'Mudar a chave PIX.' },
            { cmd: 'seradm', label: 'Auto Admin', desc: 'Promoção automática.' },
            { cmd: 'listagrupos', label: 'Lista de Grupos', desc: 'Grupos do bot.' },
            { cmd: 'aviso', label: 'Aviso', desc: 'Enviar aviso aos grupos.' },
            { cmd: 'cancelbc', label: 'Cancelar Aviso', desc: 'Cancelar avisos.' }
        ]
    },
    {
        id: 'menu18',
        emoji: '🔞',
        label: 'Menu 18+',
        description: 'Conteúdo adulto +18.',
        items: [
            { cmd: 'menu+18', label: 'Ver Tudo', desc: 'Lista completa.' },
            { cmd: 'figuanime', label: 'Figurinhas', desc: 'Figurinhas sensíveis.' },
            { cmd: 'modelos', label: 'Modelos', desc: 'Modelos adultas.' },
            { cmd: 'pack', label: 'Packs', desc: 'Pacotes de vídeos.' },
            { cmd: 'atriz', label: 'Perfis', desc: 'Perfis de personagens.' }
        ]
    },
    {
        id: 'menuferramentas',
        emoji: '🛠️',
        label: 'Menu Ferramentas',
        description: 'Utilidades e conversores.',
        items: [
            { cmd: 'calculadora', label: 'Calculadora', desc: 'Calcule expressões.' },
            { cmd: 'traduzir', label: 'Traduzir', desc: 'Traduza textos.' },
            { cmd: 'comprimir', label: 'Comprimir', desc: 'Comprimir mídia.' },
            { cmd: 'horario', label: 'Horário', desc: 'Horário mundial.' },
            { cmd: 'wikipedia', label: 'Wikipedia', desc: 'Pesquisar na Wikipédia.' },
            { cmd: 'qrcode', label: 'QR Code', desc: 'Gerar QR Code.' },
            { cmd: 'print', label: 'Screenshot', desc: 'Screenshot de sites.' },
            { cmd: 'todoc', label: 'ToDoc', desc: 'Criar documento.' },
            { cmd: 'ip', label: 'Rastrear IP', desc: 'Informações de IP.' },
            { cmd: 'encurtalink', label: 'Encurtar Link', desc: 'Encurtar URLs.' },
            { cmd: 'vozes', label: 'Vozes', desc: 'Efeitos de voz.' },
            { cmd: 'reversevid', label: 'Reverse Vid', desc: 'Inverter vídeo.' },
            { cmd: 'videolento', label: 'Vídeo Lento', desc: 'Câmera lenta.' },
            { cmd: 'videorapido', label: 'Vídeo Rápido', desc: 'Vídeo acelerado.' },
            { cmd: 'audiolento', label: 'Áudio Lento', desc: 'Áudio lento.' },
            { cmd: 'audiorapido', label: 'Áudio Rápido', desc: 'Áudio acelerado.' },
            { cmd: 'getinfo', label: 'Get Info', desc: 'Infos de número.' },
            { cmd: 'getsite', label: 'Get Site', desc: 'Infos de site.' },
            { cmd: 'getquoted', label: 'Get Quoted', desc: 'Texto citado.' },
            { cmd: 'chance', label: 'Chance', desc: 'Porcentagem aleatória.' },
            { cmd: 'conselhos', label: 'Conselhos', desc: 'Conselho do dia.' },
            { cmd: 'curiosidades', label: 'Curiosidades', desc: 'Curiosidade aleatória.' },
            { cmd: 'signo', label: 'Signo', desc: 'Signo do dia.' }
        ]
    },
    {
        id: 'menusticker',
        emoji: '🎨',
        label: 'Menu Stickers',
        description: 'Stickers e figurinhas.',
        items: [
            { cmd: 'sticker', label: 'Sticker', desc: 'Criar sticker.' },
            { cmd: 'fig', label: 'Figurinha', desc: 'Figurinha aleatória.' },
            { cmd: 'ttp', label: 'TTP', desc: 'Texto para figurinha.' },
            { cmd: 'attp', label: 'ATTP', desc: 'Animação para figurinha.' },
            { cmd: 'emojimix', label: 'Emoji Mix', desc: 'Misturar emojis.' },
            { cmd: 'qc', label: 'QC', desc: 'Criar citação.' },
            { cmd: 'toimg', label: 'ToImg', desc: 'Converter para imagem.' },
            { cmd: 'togif', label: 'ToGif', desc: 'Converter para GIF.' },
            { cmd: 'tomp3', label: 'ToMp3', desc: 'Converter para MP3.' },
            { cmd: 'tomp4', label: 'ToMp4', desc: 'Converter para MP4.' },
            { cmd: 'renomear', label: 'Renomear', desc: 'Renomear sticker.' },
            { cmd: 'take', label: 'Take/WM', desc: "Marca d'água." },
            { cmd: 'pfp', label: 'PFP', desc: 'Foto de perfil.' },
            { cmd: 'listfig', label: 'Banco de Fig', desc: 'Figurinhas salvas.' },
            { cmd: 'rgfig', label: 'Buscar Fig', desc: 'Procurar figurinha salva.' },
            { cmd: 'figuanime', label: 'Figu Anime', desc: 'Figurinha de anime.' },
            { cmd: 'figuroblox', label: 'Figu Roblox', desc: 'Figurinha Roblox.' },
            { cmd: 'figuemoji', label: 'Figu Emoji', desc: 'Figurinha de emoji.' },
            { cmd: 'figucoreana', label: 'Figu Idol', desc: 'Figurinha de idol.' },
            { cmd: 'figudesenho', label: 'Figu Desenho', desc: 'Figurinha de desenho.' },
            { cmd: 'figuengracada', label: 'Figu Engraçada', desc: 'Figurinha engraçada.' },
            { cmd: 'figuapi', label: 'Figu API', desc: 'Figurinha via API.' },
            { cmd: 'figuraiva', label: 'Figu Fervendo', desc: 'Figurinha em alta.' },
            { cmd: 'figurinhaspin', label: 'Figu Spin', desc: 'Figurinha girando.' },
            { cmd: 'figurinhaspinterest', label: 'Figu Pinterest', desc: 'Figurinha do Pinterest.' }
        ]
    },
    {
        id: 'menudownloads',
        emoji: '⬇️',
        label: 'Menu Downloads',
        description: 'Baixar músicas e vídeos.',
        items: [
            { cmd: 'play', label: 'Play', desc: 'Baixar música do YouTube.' },
            { cmd: 'spotify', label: 'Spotify', desc: 'Baixar do Spotify.' },
            { cmd: 'ytmp3', label: 'YT MP3', desc: 'Baixar áudio do YouTube.' },
            { cmd: 'ytmp4', label: 'YT MP4', desc: 'Baixar vídeo do YouTube.' },
            { cmd: 'ytsearch', label: 'YT Search', desc: 'Buscar no YouTube.' },
            { cmd: 'ytplay', label: 'YT Play', desc: 'Buscar e tocar pelo nome.' },
            { cmd: 'tiktok', label: 'TikTok', desc: 'Baixar do TikTok.' },
            { cmd: 'tiktoksearch', label: 'TikTok Search', desc: 'Buscar no TikTok.' },
            { cmd: 'instagram', label: 'Instagram', desc: 'Baixar do Instagram.' },
            { cmd: 'fbvideo', label: 'FB Video', desc: 'Baixar do Facebook.' },
            { cmd: 'pinterest', label: 'Pinterest', desc: 'Baixar do Pinterest.' },
            { cmd: 'playstore', label: 'Play Store', desc: 'Buscar apps.' },
            { cmd: 'playlist', label: 'Playlist', desc: 'Sua playlist.' },
            { cmd: 'playplaylist', label: 'Tocar Playlist', desc: 'Tocar sua playlist.' },
            { cmd: 'nextplaylist', label: 'Próxima', desc: 'Próxima da playlist.' },
            { cmd: 'listaplaylists', label: 'Minhas Playlists', desc: 'Suas músicas salvas.' },
            { cmd: 'shazam', label: 'Shazam', desc: 'Identificar música.' },
            { cmd: 'tinyurl', label: 'TinyURL', desc: 'Encurtar link.' },
            { cmd: 'up', label: 'Upload', desc: 'Enviar arquivo.' }
        ]
    },
    {
        id: 'menutia',
        emoji: '🤖',
        label: 'Menu IA',
        description: 'Inteligência artificial.',
        items: [
            { cmd: 'ia', label: 'ChatGPT', desc: 'IA que analisa imagens.' },
            { cmd: 'gemini', label: 'Gemini', desc: 'IA Gemini do Google.' },
            { cmd: 'llama', label: 'Llama', desc: 'IA Llama da Meta.' },
            { cmd: 'perplexity', label: 'Perplexity', desc: 'Busca com IA.' },
            { cmd: 'flux', label: 'Flux', desc: 'Gerar imagens com IA.' },
            { cmd: 'text2img', label: 'Text2Img', desc: 'Texto para imagem.' },
            { cmd: 'transcrever', label: 'Transcrever', desc: 'Transcrever áudio.' },
            { cmd: 'simsimi', label: 'SimSimi', desc: 'Falar com o SimSimi.' },
            { cmd: 'demo', label: 'Demo IA', desc: 'Teste a IA do bot.' }
        ]
    },
    {
        id: 'menuanime',
        emoji: '🌸',
        label: 'Menu Anime',
        description: 'Coisas de anime.',
        items: [
            { cmd: 'waifu', label: 'Waifu', desc: 'Waifu aleatória.' },
            { cmd: 'figuanime', label: 'Figu Anime', desc: 'Figurinha de anime.' },
            { cmd: 'animes', label: 'Animes', desc: 'Buscar animes.' },
            { cmd: 'animeinfo', label: 'Info Anime', desc: 'Info de anime.' },
            { cmd: 'figuroblox', label: 'Figu Roblox', desc: 'Figurinha Roblox.' },
            { cmd: 'fraseanime', label: 'Frase Anime', desc: 'Frases de anime.' },
            { cmd: 'personagem', label: 'Personagem', desc: 'Personagens de anime.' }
        ]
    },
    {
        id: 'menupg',
        emoji: '👥',
        label: 'Menu Grupo',
        description: 'Administração de grupos.',
        items: [
            { cmd: 'infogrupo', label: 'Info Grupo', desc: 'Dados do grupo.' },
            { cmd: 'link', label: 'Link', desc: 'Link do grupo.' },
            { cmd: 'statusgp', label: 'Status Grupo', desc: 'Status completo.' },
            { cmd: 'admins', label: 'Admins', desc: 'Lista de admins.' },
            { cmd: 'promover', label: 'Promover', desc: 'Promover membro.' },
            { cmd: 'rebaixar', label: 'Rebaixar', desc: 'Rebaixar membro.' },
            { cmd: 'ban', label: 'Ban', desc: 'Banir membro.' },
            { cmd: 'hidetag', label: 'HideTag', desc: 'Marcar todos.' },
            { cmd: 'recrutar', label: 'Recrutar', desc: 'Convide alguém.' },
            { cmd: 'sorteio', label: 'Sorteio', desc: 'Sorteia membros.' },
            { cmd: 'puxararquivo', label: 'Puxar Arquivo', desc: 'Envia arquivo.' },
            { cmd: 'bemvindo', label: 'Bem-vindo', desc: 'Mensagem de entrada.' },
            { cmd: 'antitoxic', label: 'Anti-Tóxico', desc: 'Bloquear palavrões.' },
            { cmd: 'addpalavrao', label: 'Add Palavrão', desc: 'Adicionar palavra proibida (dono).' },
            { cmd: 'antiflood', label: 'Anti-Flood', desc: 'Proteger de spam.' },
            { cmd: 'antispam', label: 'Anti-Spam', desc: 'Anti spam.' },
            { cmd: 'antilinkhard', label: 'Anti-Link Rígido', desc: 'Bloqueie links.' },
            { cmd: 'soadm', label: 'Só Admin', desc: 'Restrinja aos admins.' },
            { cmd: 'mutar', label: 'Mute', desc: 'Silenciar o grupo.' },
            { cmd: 'addperm', label: 'Add Permissão', desc: 'Dê permissão.' },
            { cmd: 'rmperm', label: 'Del Permissão', desc: 'Revogue permissão.' },
            { cmd: 'listperm', label: 'Lista de Permissões', desc: 'Permissões.' },
            { cmd: 'donogp', label: 'Assumir Grupo', desc: 'Torne-se dono.' }
        ]
    },
    {
        id: 'menueconomia',
        emoji: '💰',
        label: 'Menu Economia',
        description: 'Coins, XP e progressão.',
        items: [
            { cmd: 'trabalhar', label: 'Trabalhar', desc: 'Ganhar coins.' },
            { cmd: 'apostar', label: 'Apostar', desc: 'Apostar coins.' },
            { cmd: 'casino', label: 'Cassino', desc: 'Jogar no cassino.' },
            { cmd: 'slot', label: 'Slot', desc: 'Caça-níquel.' },
            { cmd: 'ruleta', label: 'Roleta', desc: 'Roleta da fortuna.' },
            { cmd: 'roubar', label: 'Roubar', desc: 'Roubar coins.' },
            { cmd: 'loja', label: 'Loja', desc: 'Comprar itens.' },
            { cmd: 'cofre', label: 'Cofre', desc: 'Cofre diário.' },
            { cmd: 'inventario', label: 'Inventário', desc: 'Seus itens.' },
            { cmd: 'rankglobal', label: 'Ranking', desc: 'Ranking global.' },
            { cmd: 'nivel', label: 'Level', desc: 'Seu nível.' },
            { cmd: 'salariocidade', label: 'Salário', desc: 'Receba o salário.' }
        ]
    }
]

/**
 * Monta o texto do menu principal: SÓ as infos do bot.
 * Limpo, sem lista de opções (as opções ficam no botão).
 */
export function buildMainMenuText({
    prefix = '!', uptime = '', date = '', version = '', botName = 'Gótica Bot',
    owner = 'Dev Soberano', numero = '', cargo = 'usuário', vip = 'SIM',
    velocidade = '0.001s', total = 0
} = {}) {
    return cabecalhoMenu({
        nome: botName,
        dono: owner,
        numero,
        prefixo: prefix,
        vip,
        cargo,
        velocidade,
        uptime: uptime || '0s',
        total
    })
}

/**
 * Monta o texto de um submenu (categoria).
 */
export function buildSubMenuText(category, { prefix = '!', botName = 'Gótica Bot' } = {}) {
    return cabecalhoSubmenu({
        emoji: category.emoji,
        titulo: category.label.toUpperCase(),
        descricao: category.description,
        total: category.items.length
    })
}

/**
 * Encontra uma categoria pelo id.
 */
export function findCategory(id) {
    return MENU_CATEGORIES.find(c => c.id === id) || null
}

/**
 * Encontra uma categoria pelo label (para clique por índice).
 */
export function findCategoryByIndex(index) {
    const idx = Number(index) - 1
    if (idx < 0 || idx >= MENU_CATEGORIES.length) return null
    return MENU_CATEGORIES[idx]
}

/**
 * Encontra um item pelo id do comando dentro de uma categoria.
 */
export function findItem(categoryId, cmd) {
    const cat = findCategory(categoryId)
    if (!cat) return null
    return cat.items.find(i => i.cmd === cmd) || null
}