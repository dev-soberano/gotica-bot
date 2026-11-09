/**
 * @project Gótica Bot - Configurações
 * @author Dev Soberano
 * @link https://github.com/leandromemes
 */

import { watchFile, unwatchFile } from 'fs'
import chalk from 'chalk'
import { fileURLToPath, pathToFileURL } from 'url'

// --- [ CONFIGURACAO DE DONO (MODO SOBERANO) ] ---
// Numero do dono principal. Variacoes com/sem o 9 e LID sao
// aceitos para nao perder o acesso em nenhum caso.
global.owner = [
    ['+556391096656', 'Soberano', true],
    ['+556391096656', 'Soberano (S/ 9)', true],
    ['+556391096656', 'Dev Soberano', true],
    ['+556391096656@s.whatsapp.net', 'Soberano (JID)', true],
    ['639556976745', 'Gotica Bot - soberano', true],
    ['93691188363501@lid', 'Soberano Leandro (LID)', true],
    ['556391096656@s.whatsapp.net', 'Soberano (JID)', true],
    ['93691188363501@lid', 'Soberano (LID atual)', true]
]

// --- [ CONFIGURACOES DO BOT ] ---
global.botname = 'Gótica Bot'
global.prefix = '!' // Prefixo padrao
global.wm = 'dev soberano • Soberano Gotica'
global.packname = 'Gótica Bot'
global.author = 'Dev Soberano'

// --- [ CHAVES RAPIDAPI ] ---
global.apiKeys = [
    'SUA_CHAVE_1_AQUI',
    'SUA_CHAVE_2_AQUI',
    'SUA_CHAVE_3_AQUI'
]

// --- [ LINKS ] ---
global.banner = 'https://files.catbox.moe/yyk5xo.jpg'
global.canal = 'https://whatsapp.com/channel/0029Vb8SRN5CcW4sYg65Tp2K'
global.canalJid = '120363430111471964@newsletter'
global.canalNome = 'Gotica Bots'
global.md = 'https://github.com/dev-soberano/gotica-bot'

// --- [ PERFIL DO CRIADOR (comando !dono) ] ---
// O !dono mostra so o perfil do criador: foto, nome, contato e redes.
// O !donos continua sendo o painel de donos.
global.perfilDono = {
    nome: 'Dev Soberano',
    cargo: 'Criador',
    numero: '556391096656',
    // Deixe vazio para usar a foto de perfil do WhatsApp do dono.
    foto: '',
    // So entra no perfil o que tiver link preenchido.
    redes: [
        { nome: 'GitHub', icone: '🐙', link: 'https://github.com/dev-soberano' },
        { nome: 'Instagram', icone: '📸', link: '' },
        { nome: 'TikTok', icone: '🎵', link: '' },
        { nome: 'YouTube', icone: '▶️', link: '' },
        { nome: 'Canal WhatsApp', icone: '📢', link: 'https://whatsapp.com/channel/0029Vb8SRN5CcW4sYg65Tp2K' }
    ]
}

// --- [ SISTEMA ] ---
global.languaje = 'Português'
global.vs = '2.0.4'

// --- [ CORRECAO DE RECARREGAMENTO NO WINDOWS ] ---
let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
    unwatchFile(file)
    console.log(chalk.bold.greenBright(`\n[ RESTARTING ] `) + chalk.white(`settings.js atualizado!`))

    // O segredo esta aqui: pathToFileURL resolve o erro de 'C:' no Windows
    import(`${pathToFileURL(file).href}?update=${Date.now()}`)
})
