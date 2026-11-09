/**
 * Testa o !dono (perfil do criador) e o !donos (painel) com um
 * conector simulado, sem precisar do WhatsApp.
 *
 * Uso: node scripts/testar-dono.js
 */

import '../settings.js'

const pluginMod = await import('../plugins/info-dono.js')
const plugin = pluginMod.default || pluginMod

let falhas = 0
const ok = (cond, msg) => {
    console.log(`${cond ? '[OK]  ' : '[FALHA]'} ${msg}`)
    if (!cond) falhas++
}

/** Conector falso que captura o que seria enviado. */
function connFake() {
    return {
        waUploadToServer: async () => ({ url: 'x' }),
        profilePictureUrl: async () => 'https://files.catbox.moe/yyk5xo.jpg',
        getName: async () => 'Dev Soberano',
        sendMessage: async (jid, conteudo) => {
            connFake.ultimo = { jid, conteudo }
            return {}
        }
    }
}
connFake.ultimo = null

function mFake() {
    return {
        chat: '123@g.us',
        sender: '556391096656@s.whatsapp.net',
        pushName: 'Soberano',
        react: async () => { },
        reply: async (t) => { connFake.ultimo = { jid: '123@g.us', conteudo: { text: t } } }
    }
}

const textoDe = () => {
    const u = connFake.ultimo?.conteudo || {}
    return u.caption || u.text || ''
}

console.log('\n[1] !dono -> perfil do criador')
connFake.ultimo = null
await plugin(mFake(), { conn: connFake(), command: 'dono', usedPrefix: '!' })
const perfil = textoDe()
console.log(perfil.split('\n').slice(0, 3).join('\n') + '\n  ...')
ok(perfil.includes('Dev Soberano'), 'mostra o nome do criador')
ok(perfil.includes('+556391096656'), 'mostra o contato')
ok(perfil.includes('github.com/dev-soberano'), 'mostra rede social GitHub')
ok(perfil.includes('Canal WhatsApp'), 'mostra o canal')
ok(!!connFake.ultimo?.conteudo?.image, 'envia com foto')
ok(!/Dono \d:/.test(perfil), 'NÃO é o painel de donos')

console.log('\n[2] !donos -> painel de donos')
connFake.ultimo = null
await plugin(mFake(), { conn: connFake(), command: 'donos', usedPrefix: '!' })
const painel = textoDe()
ok(painel.includes('𝐏𝐀𝐈𝐍𝐄𝐋 𝐃𝐎𝐒 𝐃𝐎𝐍𝐎𝐒'), 'painel de donos')
ok((painel.match(/Dono \d:/g) || []).length === 6, '6 slots de dono')
ok(painel.trimEnd().endsWith('☾⋆༺ Gótica Bot ༻⋆☽'), 'rodapé Gótica Bot')
ok(!painel.includes('github.com/dev-soberano'), 'não vaza o perfil no painel')

console.log('\n[3] Redes sem link ficam de fora')
ok(!perfil.includes('Instagram'), 'Instagram vazio não aparece')
ok(!perfil.includes('TikTok'), 'TikTok vazio não aparece')

console.log(falhas ? `\n${falhas} falha(s).` : '\nTodos os testes passaram.')
process.exit(falhas ? 1 : 0)
