/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @project Gotica Bot
 */

import { dirname } from 'path'
import { fileURLToPath } from 'url'
import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import fluent_ffmpeg from 'fluent-ffmpeg'
import webp from 'node-webpmux'
import fetch from 'node-fetch'

const __dirname = dirname(fileURLToPath(import.meta.url))
const tmp = path.join(__dirname, '../tmp')

if (!fs.existsSync(tmp)) fs.mkdirSync(tmp)

async function addExif(webpSticker, packname, author, categories = [''], extra = {}) {
  const img = new webp.Image();
  const json = { 'sticker-pack-id': crypto.randomBytes(32).toString('hex'), 'sticker-pack-name': packname, 'sticker-pack-publisher': author, 'emojis': categories, ...extra };
  let exifAttr = Buffer.from([0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00, 0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00, 0x00, 0x00, 0x16, 0x00, 0x00, 0x00]);
  let jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8');
  let exif = Buffer.concat([exifAttr, jsonBuffer]);
  exif.writeUIntLE(jsonBuffer.length, 14, 4);
  await img.load(webpSticker)
  img.exif = exif
  return await img.save(null)
}

async function ffmpegSticker(buffer, packname, author) {
  const input = path.join(tmp, crypto.randomBytes(6).toString('hex') + '.media')
  const output = path.join(tmp, crypto.randomBytes(6).toString('hex') + '.webp')
  
  fs.writeFileSync(input, buffer)

  return new Promise((resolve, reject) => {
    fluent_ffmpeg(input)
      .on('error', (err) => {
        if (fs.existsSync(input)) fs.unlinkSync(input)
        reject(err)
      })
      .on('end', async () => {
        if (fs.existsSync(input)) fs.unlinkSync(input)
        if (fs.existsSync(output)) {
          let stiker = fs.readFileSync(output)
          fs.unlinkSync(output)
          resolve(await addExif(stiker, packname, author))
        }
      })
      .addOutputOptions([
        "-vcodec", "libwebp",
        // Ajuste Soberano: Força 512x512 ignorando proporção para não ter bordas
        "-vf", "scale=512:512,setsar=1,fps=15", 
        "-lossless", "0",
        "-compression_level", "6",
        "-q:v", "50",
        "-loop", "0",
        "-preset", "picture",
        "-an",
        "-vsync", "0"
      ])
      .toFormat('webp')
      .save(output)
  })
}

async function sticker(img, url, packname, author) {
  let buffer = img
  if (url) {
    let res = await fetch(url)
    buffer = await res.arrayBuffer().then(ab => Buffer.from(ab))
  }
  return await ffmpegSticker(buffer, packname, author)
}

export { sticker, addExif }
export default { sticker, addExif }