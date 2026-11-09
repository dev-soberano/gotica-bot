/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

import { unlinkSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const handler = async (m, { conn, args, usedPrefix, command }) => {
    try {
        const q = m.quoted ? m.quoted : m;
        const mime = (q.msg || q).mimetype || '';
        let set;

        // Configuração dos filtros de áudio 💫
        if (/bass/.test(command)) set = '-af equalizer=f=94:width_type=o:width=2:g=30';
        if (/blown/.test(command)) set = '-af acrusher=.1:1:64:0:log';
        if (/deep/.test(command)) set = '-af atempo=4/4,asetrate=44500*2/3';
        if (/earrape/.test(command)) set = '-af volume=12';
        if (/fast/.test(command)) set = '-filter:a "atempo=1.63,asetrate=44100"';
        if (/fat/.test(command)) set = '-filter:a "atempo=1.6,asetrate=22100"';
        if (/nightcore/.test(command)) set = '-filter:a atempo=1.06,asetrate=44100*1.25';
        if (/reverse/.test(command)) set = '-filter_complex "areverse"';
        if (/robot/.test(command)) set = '-filter_complex "afftfilt=real=\'hypot(re,im)*sin(0)\':imag=\'hypot(re,im)*cos(0)\':win_size=512:overlap=0.75"';
        if (/slow/.test(command)) set = '-filter:a "atempo=0.7,asetrate=44100"';
        if (/smooth/.test(command)) set = '-filter:v "minterpolate=\'mi_mode=mci:mc_mode=aobmc:vsbmc=1:fps=120\'"';
        if (/tupai|squirrel|chipmunk|esquilo/.test(command)) set = '-filter:a "atempo=0.5,asetrate=65100"';

        if (/audio/.test(mime)) {
            // Criar pasta tmp se não existir 💋
            const tmpDir = join(__dirname, '../tmp');
            if (!existsSync(tmpDir)) mkdirSync(tmpDir, { recursive: true });

            const ran = getRandom('.mp3');
            const filename = join(tmpDir, ran);
            const media = await q.download(true);

            if (!media) throw '*💋 Erro ao baixar a mídia!*';

            try {
                // Usando await para garantir que o FFmpeg termine antes de prosseguir ⭐
                await execPromise(`ffmpeg -i "${media}" ${set} "${filename}"`);
                
                if (existsSync(media)) unlinkSync(media); // Limpa o arquivo baixado original

                const buff = readFileSync(filename);
                await conn.sendFile(m.chat, buff, ran, null, m, true, {
                    type: 'audioMessage',
                    ptt: true,
                });

                // Deletar arquivo temporário gerado ⭐
                if (existsSync(filename)) {
                    setTimeout(() => {
                        try { unlinkSync(filename) } catch (e) {}
                    }, 5000);
                }
            } catch (err) {
                if (existsSync(media)) unlinkSync(media);
                console.error(err);
                throw `*💋 Erro ao processar o áudio com FFmpeg!*`;
            }
        } else {
            throw `*💫 Responda a um áudio ou nota de voz para aplicar o efeito usando: ${usedPrefix + command}*`;
        }
    } catch (e) {
        m.reply(String(e));
    }
};

handler.help = ['esquilo', 'bass', 'deep', 'robot'].map((v) => v + ' [vn]');
handler.tags = ['audio'];
handler.group = true;
handler.command = ['bass', 'blown', 'deep', 'earrape', 'fast', 'fat', 'nightcore', 'reverse', 'robot', 'slow', 'smooth', 'tupai', 'squirrel', 'chipmunk', 'esquilo'];

export default handler;

const getRandom = (ext) => {
    return `${Math.floor(Math.random() * 10000)}${ext}`;
};