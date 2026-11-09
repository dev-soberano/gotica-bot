/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * * dev: leandro rocha
 * * GitHub: https://github.com/leandromemes
 */

import { DOMImplementation, XMLSerializer } from 'xmldom';
import JsBarcode from 'jsbarcode';
import { JSDOM } from 'jsdom';  
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const src = join(__dirname, '..', 'src')
const svgPath = join(src, 'welcome.svg')
const _svg = existsSync(svgPath) ? readFileSync(svgPath, 'utf-8') : ''

/**
 * Gera o código de barras estético para a arte
 */
const barcode = data => {
    const xmlSerializer = new XMLSerializer();
    const document = new DOMImplementation().createDocument('http://www.w3.org/1999/xhtml', 'html', null);
    const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    JsBarcode(svgNode, data, {
        xmlDocument: document,
    });

    return xmlSerializer.serializeToString(svgNode);
}

const imageSetter = (img, value) => {
    if (img) img.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', value)
}
const textSetter = (el, value) => {
    if (el) el.textContent = value
}

/**
 * Converte SVG para imagem real usando o ImageMagick recém-instalado
 */
const toImg = (svg, format = 'png') => new Promise((resolve, reject) => {
    if (!svg) return resolve(Buffer.alloc(0))
    let bufs = []
    const im = spawn('magick', ['convert', 'svg:-', format + ':-'])
    
    im.on('error', e => {
        console.error('[ERRO] Falha ao executar Magick:', e)
        resolve(Buffer.alloc(0))
    })
    
    im.stdout.on('data', chunk => bufs.push(chunk))
    im.stdin.write(Buffer.from(svg))
    im.stdin.end()
    im.on('close', code => {
        resolve(Buffer.concat(bufs))
    })
})

const toBase64 = (buffer, mime) => `data:${mime};base64,${buffer.toString('base64')}`

/**
 * Preenche o template SVG com os dados do novo membro
 */
const genSVG = async ({
    wid = '',
    pp = join(src, 'avatar_contact.png'),
    title = '',
    name = '',
    text = '',
    background = ''
} = {}) => {
    if (!_svg) return ''
    let { document: svg } = new JSDOM(_svg).window
    
    let el = {
        code: ['#_1661899539392 > g:nth-child(6) > image', imageSetter, toBase64(await toImg(barcode(wid.replace(/[^0-9]/g, '')), 'png'), 'image/png')],
        pp: ['#_1661899539392 > g:nth-child(3) > image', imageSetter, pp],
        text: ['#_1661899539392 > text.fil1.fnt0', textSetter, text],
        title: ['#_1661899539392 > text.fil2.fnt1', textSetter, title],
        name: ['#_1661899539392 > text.fil2.fnt2', textSetter, name],
        bg: ['#_1661899539392 > g:nth-child(2) > image', imageSetter, background],
    }
    
    for (let [selector, set, value] of Object.values(el)) {
        set(svg.querySelector(selector), value)
    }
    return svg.body.innerHTML
}

/**
 * Função exportada para gerar a imagem final de boas-vindas
 */
const render = async ({
    wid = '',
    pp = toBase64(readFileSync(join(src, 'avatar_contact.png')), 'image/png'),
    name = '',
    title = '',
    text = '',
    background = toBase64(readFileSync(join(src, 'Aesthetic', 'Aesthetic_000.jpeg')), 'image/jpeg'),
} = {}, format = 'png') => {
    let svgData = await genSVG({ wid, pp, name, text, background, title })
    return await toImg(svgData, format)
}

export default render