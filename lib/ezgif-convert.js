/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * * dev: leandro rocha
 * * GitHub: https://github.com/leandromemes
 */

import { FormData } from 'formdata-node';
import axios from 'axios';

// Mapeamento de endpoints e parâmetros do Ezgif
const linksConvert = {
    "video-gif": {
        "url": "https://ezgif.com/video-to-gif",
        "params": { "start": 0, "end": 10, "size": "original", "fps": 10, "method": "ffmpeg" },
        "req_params": [],
        "split": { "start": "<img src=\"", "end": "\" style=\"width:" },
        "either_params": []
    },
    "gif-mp4": {
        "url": "https://ezgif.com/gif-to-mp4",
        "params": { "convert": "Convert GIF to MP4!" },
        "req_params": [],
        "split": { "start": "\" controls><source src=\"", "end": "\" type=\"video/mp4\">Your browser" },
        "either_params": []
    },
    "webp-mp4": {
        "url": "https://ezgif.com/webp-to-mp4",
        "params": {},
        "req_params": [],
        "split": { "start": "\" controls><source src=\"", "end": "\" type=\"video/mp4\">Your browser" },
        "either_params": []
    },
    "webp-png": {
        "url": "https://ezgif.com/webp-to-png",
        "params": {},
        "req_params": [],
        "split": { "start": "<img src=\"", "end": "\" style=\"width:" },
        "either_params": []
    },
    "png-webp": {
        "url": "https://ezgif.com/png-to-webp",
        "params": {},
        "req_params": [],
        "split": { "start": "<img src=\"", "end": "\" style=\"width:" },
        "either_params": []
    },
    "video-webp": {
        "url": "https://ezgif.com/video-to-webp",
        "params": { "start": 0, "end": 10, "size": "original", "fps": 10, "loop": "on" },
        "req_params": [],
        "split": { "start": "<img src=\"", "end": "\" style=\"width:" },
        "either_params": []
    }
    // ... (as outras dezenas de formatos seguem a mesma lógica)
};

/**
 * Função principal de conversão
 */
async function convert(fields) {
    if (typeof fields === 'string' && fields?.toLowerCase() === 'list') return Object.keys(linksConvert);

    let type = linksConvert?.[fields?.type];
    if (!type) throw new Error(`Tipo de conversão inválido: "${fields?.type}"`);
    let form = new FormData();

    if (fields?.file) {
        if (!fields.filename) throw new Error(`O nome do arquivo deve ser fornecido para upload.`);
        form.append('new-image', fields.file, { filename: fields.filename });
    } else if (fields?.url) {
        form.append('new-image-url', fields.url);
    } else throw new Error('É necessário fornecer um arquivo ou uma URL.');

    delete fields.type;
    delete fields.file;
    delete fields.filename;
    delete fields.url;

    let org_keys = Object.keys(fields);
    if (type.req_params) {
        type.req_params.forEach(e => {
            if (!org_keys.includes(e)) throw new Error(`"${e}" é um parâmetro obrigatório.`);
        });
    }

    let link = await axios({
        method: 'post',
        url: type.url,
        headers: { 'Content-Type': 'multipart/form-data' },
        data: form,
    }).catch(function(error) {
        throw new Error("Erro na comunicação com o Ezgif. Tente novamente.");
    });

    let redir = String(link?.request?.res?.responseUrl);
    if (!redir) throw new Error(`Falha no redirecionamento do servidor.`);
    let id = redir.split('/')[redir.split('/').length - 1];
    type.params.file = id;

    let image = await axios({
        method: 'post',
        url: `${redir}?ajax=true`,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        data: new URLSearchParams({ ...type.params, ...fields }),
    });

    let img_url = `https:${(image?.data?.toString()?.split(type.split.start)?.[1]?.split(type.split.end)?.[0])?.replace('https:', '')}`;
    if (img_url.includes('undefined')) throw new Error(`Erro ao capturar URL da imagem. Comunique o dev.`);
    return img_url;
}

// Funções de atalho exportadas para facilitar o uso nos plugins
async function webp2mp4(url) {
    return await convert({ type: 'webp-mp4', url })
}

async function webp2img(url) {
    return await convert({ type: 'webp-png', url })
}

async function img2webp(url) {
    return await convert({ type: 'png-webp', url })
}

async function vid2webp(url) {
    return await convert({ type: 'video-webp', url })
}

export {
    convert,
    webp2mp4,
    webp2img,
    img2webp,
    vid2webp
};