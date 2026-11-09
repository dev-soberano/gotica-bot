/**
 * Teste do sistema de aliases: verifica que o before() reescreve
 * o texto do comando para o comando real.
 *
 * Uso: node scripts/test-aliases.js
 */

import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

let falhas = 0
function check(nome, cond, detalhe = '') {
    if (cond) console.log(`  [OK] ${nome}`)
    else { console.log(`  [X] ${nome}${detalhe ? ` - ${detalhe}` : ''}`); falhas++ }
}

console.log('\n' + '='.repeat(60))
console.log('  TESTE DE ALIASES')
console.log('='.repeat(60) + '\n')

const mod = await import(pathToFileURL(path.join(ROOT, 'plugins', 'main-aliases.js')).href)
const plugin = mod.default

check('Plugin de aliases carrega', !!plugin)
check('before() implementado', typeof plugin.before === 'function')
check('Comandos registrados', Array.isArray(plugin.command) && plugin.command.length > 0,
    `${plugin.command?.length} aliases`)

global.prefix = '!'

/** Mock de mensagem. */
function mockM(texto) {
    return { text: texto, chat: 'x@s.whatsapp.net', sender: 'y@s.whatsapp.net', isGroup: false }
}

// Testa a reescrita
const casos = [
    ['!fechamento', '!fechar'],
    ['!abertura', '!abrir'],
    ['!antiligação', '!antiligar'],
    ['!antipalavrão', '!antipalavra'],
    ['!rgcmdmod', '!rgcmd'],
    ['!anti-delete', '!antidelete']
]

for (const [entrada, esperado] of casos) {
    const m = mockM(entrada)
    await plugin.before(m, { conn: {}, usedPrefix: '!' })
    check(`"${entrada}" → "${esperado}"`, m.text === esperado, `obtido: ${m.text}`)
}

// Testa que comandos normais NAO sao alterados
for (const normal of ['!menu', '!ping', '!dono', '!ytmp3']) {
    const m = mockM(normal)
    await plugin.before(m, { conn: {}, usedPrefix: '!' })
    check(`"${normal}" não é alterado`, m.text === normal, `obtido: ${m.text}`)
}

// Testa que mensagens sem prefixo nao sao alteradas
const mSem = mockM('fechamento')
await plugin.before(mSem, { conn: {}, usedPrefix: '!' })
check('Mensagem sem prefixo não é alterada', mSem.text === 'fechamento', `obtido: ${mSem.text}`)

// Testa que argumentos sao preservados
const mArgs = mockM('!fechamento motivo aqui')
await plugin.before(mArgs, { conn: {}, usedPrefix: '!' })
check('Argumentos são preservados', mArgs.text === '!fechar motivo aqui', `obtido: ${mArgs.text}`)

console.log('\n' + '='.repeat(60))
console.log(falhas === 0 ? '  [OK] ALIASES 100% FUNCIONAL' : `  [X] ${falhas} FALHA(S)`)
console.log('='.repeat(60) + '\n')

process.exit(falhas === 0 ? 0 : 1)
