/**
 * Testa URLs de efeitos de texto do ephoto360 para descobrir quais
 * continuam válidos (o site troca de slug de tempos em tempos).
 *
 * Uso: node scripts/test-ephoto360.js
 */
import { Maker } from 'imagemaker.js'

// A biblioteca do ephoto360 rejeita dentro de um callback do `request`,
// o que dispara "uncaught exception" e mata o processo. Neutralizamos
// aqui para conseguir testar todas as URLs em sequência.
process.on('uncaughtException', (e) => {
    console.log('   (erro assincrono: ' + String(e?.message).slice(0, 80) + ')')
})
process.on('unhandledRejection', (e) => {
    console.log('   (rejeicao: ' + String(e?.message).slice(0, 80) + ')')
})

const CANDIDATOS = {
    '1917': 'https://en.ephoto360.com/1917-effect-text-online-518.html',
    '3druby': 'https://en.ephoto360.com/create-3d-ruby-text-effect-online-1003.html',
    'advancedglow': 'https://en.ephoto360.com/text-effect-with-glowing-lights-999.html',
    'blackpinklogo': 'https://en.ephoto360.com/blackpink-logo-text-effect-online-1004.html',
    'blood': 'https://en.ephoto360.com/blood-text-effect-online-714.html',
    'cartoon': 'https://en.ephoto360.com/cartoon-text-effect-online-724.html',
    'cemetery': 'https://en.ephoto360.com/cemetery-text-effect-online-726.html',
    'clouds': 'https://en.ephoto360.com/create-clouds-text-effect-online-721.html',
    'darkgreen': 'https://en.ephoto360.com/dark-green-text-effect-online-729.html',
    'deleting': 'https://en.ephoto360.com/deleting-text-effect-online-732.html',
    'flag': 'https://en.ephoto360.com/create-flag-text-effect-online-720.html',
    'flag3d': 'https://en.ephoto360.com/3d-flag-text-effect-online-1027.html',
    'galaxy': 'https://en.ephoto360.com/create-galaxy-text-effect-online-1021.html',
    'galaxywallpaper': 'https://en.ephoto360.com/galaxy-wallpaper-text-effect-online-1022.html',
    'glitch': 'https://en.ephoto360.com/create-digital-glitch-text-effects-online-767.html',
    'glowing': 'https://en.ephoto360.com/text-effect-with-glowing-lights-999.html',
    'gradient': 'https://en.ephoto360.com/gradient-text-effect-online-1030.html',
    'halloween': 'https://en.ephoto360.com/halloween-text-effect-online-1071.html',
    'horror': 'https://en.ephoto360.com/horror-text-effect-online-1043.html',
    'joker': 'https://en.ephoto360.com/joker-text-effect-online-1044.html',
    'ligatures': 'https://en.ephoto360.com/ligature-text-effect-online-1046.html',
    'lighteffects': 'https://en.ephoto360.com/light-effects-text-effect-online-1047.html',
    'luxurygold': 'https://en.ephoto360.com/luxury-gold-text-effect-online-1050.html',
    'makingneon': 'https://en.ephoto360.com/neon-text-effect-online-1052.html',
    'metal3d': 'https://en.ephoto360.com/3d-metal-text-effect-online-1055.html',
    'multicoloredneon': 'https://en.ephoto360.com/multi-color-neon-text-effect-online-1056.html',
    'neondevil': 'https://en.ephoto360.com/neon-devil-text-effect-online-1057.html',
    'neonglitch': 'https://en.ephoto360.com/neon-glitch-text-effect-online-1058.html',
    'papercut': 'https://en.ephoto360.com/paper-cut-text-effect-online-1060.html',
    'pixelglitch': 'https://en.ephoto360.com/pixel-glitch-text-effect-online-1061.html',
    'royal': 'https://en.ephoto360.com/royal-text-effect-online-1063.html',
    'sandsummer': 'https://en.ephoto360.com/sand-summer-text-effect-online-1064.html',
    'summerbeach': 'https://en.ephoto360.com/summer-beach-text-effect-online-1065.html',
    'sunset': 'https://en.ephoto360.com/sunset-text-effect-online-1066.html',
    'typography': 'https://en.ephoto360.com/typography-text-effect-online-1067.html',
    'underwater': 'https://en.ephoto360.com/underwater-text-effect-online-1068.html',
    'watercolor': 'https://en.ephoto360.com/water-color-text-effect-online-1069.html',
    'wooden3d': 'https://en.ephoto360.com/wooden-3d-text-effect-online-1070.html',
    'dragonball': 'https://en.ephoto360.com/create-dragon-ball-style-text-effects-online-809.html',
    'frozen': 'https://en.ephoto360.com/frozen-text-effect-online-1040.html'
}

const ok = []
const fail = []

for (const [nome, url] of Object.entries(CANDIDATOS)) {
    try {
        const res = await new Maker().Ephoto360(url, ['Teste'])
        if (res?.imageUrl && res.imageUrl.startsWith('http')) {
            ok.push([nome, res.imageUrl])
            console.log('[OK]   ' + nome + ' -> ' + res.imageUrl.slice(0, 80))
        } else {
            fail.push([nome, 'resposta sem imageUrl'])
            console.log('[FALHA] ' + nome + ' -> sem imageUrl')
        }
    } catch (e) {
        fail.push([nome, e.message])
        console.log('[FALHA] ' + nome + ' -> ' + String(e.message).slice(0, 90))
    }
}

console.log('\n' + '='.repeat(50))
console.log('OK: ' + ok.length + ' | FALHA: ' + fail.length)
if (fail.length) console.log('Falhas: ' + fail.map(f => f[0]).join(', '))

process.exit(0)
