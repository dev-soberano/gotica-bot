/**
 * ╔═╗ ╔═╗ ╔╦╗ ╦ ╔═╗ ╔═╗      ╔╗  ╔═╗ ╔╦╗
 * ║ ╦ ║ ║  ║  ║ ║   ╠═╣      ╠╩╗ ║ ║  ║ 
 * ╚═╝ ╚═╝  ╩  ╩ ╚═╝ ╩ ╩      ╚═╝ ╚═╝  ╩ 
 * @author Leandro Rocha
 * @link https://github.com/leandromemes
 * @project Gotica Bot
 */

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!global.db.data.chats[m.chat].nsfw && m.isGroup) {
        return m.reply('*🔞 Conteúdo adulto desativado neste grupo.*');
    }

    const bancoAtrizes = [
        { pornStarName: "Remy LaCroix", picture: "https://cdni.pornpics.com/460/1/110/85205377/85205377_019_bd32.jpg", nationality: "US", galleries: "655" },
        { pornStarName: "Valentina Nappi", picture: "https://cdni.pornpics.com/460/7/432/17616538/17616538_126_38e5.jpg", nationality: "IT", galleries: "1187" },
        { pornStarName: "Madison Ivy", picture: "https://cdni.pornpics.com/460/5/222/59642255/59642255_002_e514.jpg", nationality: "DE", galleries: "903" },
        { pornStarName: "Blake Blossom", picture: "https://cdni.pornpics.com/460/7/95/15792130/15792130_085_8e27.jpg", nationality: "US", galleries: "173" },
        { pornStarName: "Little Caprice", picture: "https://cdni.pornpics.com/460/7/427/75245688/75245688_098_c8b6.jpg", nationality: "CZ", galleries: "474" },
        { pornStarName: "Alison Tyler", picture: "https://cdni.pornpics.com/460/5/195/12389984/12389984_016_9405.jpg", nationality: "US", galleries: "788" },
        { pornStarName: "Nina Hartley", picture: "https://cdni.pornpics.com/460/7/122/24551388/24551388_034_48ab.jpg", nationality: "US", galleries: "463" },
        { pornStarName: "India Summer", picture: "https://cdni.pornpics.com/460/7/106/47160446/47160446_235_08a8.jpg", nationality: "US", galleries: "1848" },
        { pornStarName: "Sasha Grey", picture: "https://cdni.pornpics.com/460/7/350/38447113/38447113_006_87d2.jpg", nationality: "US", galleries: "341" },
        { pornStarName: "Asa Akira", picture: "https://cdni.pornpics.com/460/7/309/39979390/39979390_008_1450.jpg", nationality: "US", galleries: "1321" },
        { pornStarName: "Tori Black", picture: "https://cdni.pornpics.com/460/5/91/29300033/29300033_009_f117.jpg", nationality: "US", galleries: "690" },
        { pornStarName: "Lulu Chu", picture: "https://cdni.pornpics.com/460/7/473/55241354/55241354_004_0b6f.jpg", nationality: "CN", galleries: "206" },
        { pornStarName: "Sophie Dee", picture: "https://cdni.pornpics.com/460/7/249/30814124/30814124_006_67ff.jpg", nationality: "GB", galleries: "611" },
        { pornStarName: "Krissy Lynn", picture: "https://cdni.pornpics.com/460/7/101/66622537/66622537_207_a618.jpg", nationality: "US", galleries: "1260" },
        { pornStarName: "Bridgette B", picture: "https://cdni.pornpics.com/460/5/104/88423454/88423454_001_290d.jpg", nationality: "ES", galleries: "1414" },
        { pornStarName: "Kagney Linn Karter", picture: "https://cdni.pornpics.com/460/7/96/87545180/87545180_140_5d73.jpg", nationality: "US", galleries: "1164" },
        { pornStarName: "Megan Rain", picture: "https://cdni.pornpics.com/460/5/193/65014660/65014660_002_4632.jpg", nationality: "US", galleries: "856" },
        { pornStarName: "Janice Griffith", picture: "https://cdni.pornpics.com/460/7/287/62221759/62221759_113_a57e.jpg", nationality: "US", galleries: "634" },
        { pornStarName: "LaSirena69", picture: "https://cdni.pornpics.com/460/7/87/16019872/16019872_075_49a1.jpg", nationality: "VE", galleries: "116" },
        { pornStarName: "Mandy Muse", picture: "https://cdni.pornpics.com/460/5/187/81754417/81754417_013_7c6e.jpg", nationality: "US", galleries: "450" },
        { pornStarName: "Syren De Mer", picture: "https://cdni.pornpics.com/460/1/360/29325801/29325801_012_68df.jpg", nationality: "US", galleries: "705" },
        { pornStarName: "Karlee Grey", picture: "https://cdni.pornpics.com/460/7/263/81040254/81040254_068_7141.jpg", nationality: "US", galleries: "810" },
        { pornStarName: "Savannah Bond", picture: "https://cdni.pornpics.com/460/7/582/89526866/89526866_012_524b.jpg", nationality: "AU", galleries: "150" },
        { pornStarName: "Dakota Tyler", picture: "https://cdni.pornpics.com/460/7/574/60072211/60072211_013_435e.jpg", nationality: "US", galleries: "53" },
        { pornStarName: "Jada Stevens", picture: "https://cdni.pornpics.com/460/7/229/57869688/57869688_045_0eff.jpg", nationality: "US", galleries: "980" },
        { pornStarName: "Eva Elfie", picture: "https://cdni.pornpics.com/460/7/304/67674036/67674036_070_7a7d.jpg", nationality: "RU", galleries: "165" },
        { pornStarName: "Lexi Belle", picture: "https://cdni.pornpics.com/460/7/540/39668469/39668469_097_46e0.jpg", nationality: "US", galleries: "1173" },
        { pornStarName: "Kimmy Granger", picture: "https://cdni.pornpics.com/460/7/360/91501365/91501365_091_0817.jpg", nationality: "US", galleries: "580" },
        { pornStarName: "Ariella Ferrera", picture: "https://cdni.pornpics.com/460/7/100/83275676/83275676_240_3953.jpg", nationality: "CO", galleries: "1412" },
        { pornStarName: "Julia Ann", picture: "https://cdni.pornpics.com/460/7/233/90070350/90070350_302_6f3a.jpg", nationality: "US", galleries: "1556" },
        { pornStarName: "Jennifer White", picture: "https://cdni.pornpics.com/460/1/365/32095453/32095453_008_4f2b.jpg", nationality: "US", galleries: "890" },
        { pornStarName: "Leah Gotti", picture: "https://cdni.pornpics.com/460/7/543/92007856/92007856_028_74e1.jpg", nationality: "US", galleries: "233" },
        { pornStarName: "Vina Sky", picture: "https://cdni.pornpics.com/460/7/473/23836171/23836171_066_d2e7.jpg", nationality: "US", galleries: "354" },
        { pornStarName: "Luna Star", picture: "https://cdni.pornpics.com/460/1/272/30530421/30530421_003_cafd.jpg", nationality: "CU", galleries: "808" },
        { pornStarName: "Sophia Leone", picture: "https://cdni.pornpics.com/460/7/528/75635576/75635576_007_6866.jpg", nationality: "US", galleries: "417" },
        { pornStarName: "Alina Lopez", picture: "https://cdni.pornpics.com/460/7/95/16020861/16020861_003_ea5a.jpg", nationality: "US", galleries: "337" },
        { pornStarName: "Rachel Starr", picture: "https://cdni.pornpics.com/460/7/43/71569814/71569814_603_baba.jpg", nationality: "US", galleries: "843" },
        { pornStarName: "AJ Applegate", picture: "https://cdni.pornpics.com/460/7/294/82740979/82740979_031_7cf8.jpg", nationality: "US", galleries: "1118" },
        { pornStarName: "Angel Youngs", picture: "https://cdni.pornpics.com/460/1/334/58171638/58171638_005_93e4.jpg", nationality: "US", galleries: "137" },
        { pornStarName: "Codi Vore", picture: "https://cdni.pornpics.com/460/7/100/97476074/97476074_109_c86a.jpg", nationality: "US", galleries: "77" }
    ];

    try {
        let selecionada;
        if (text) {
            selecionada = bancoAtrizes.find(v => v.pornStarName.toLowerCase().includes(text.toLowerCase()));
        } else {
            selecionada = bancoAtrizes[Math.floor(Math.random() * bancoAtrizes.length)];
        }

        if (!selecionada) return m.reply('*❌ Atriz não encontrada no banco de dados.*');

        let cap = `*🔞 PERFIL DA ATRIZ*\n\n` +
                  `*👤 Nome:* ${selecionada.pornStarName}\n` +
                  `*🌎 Nacionalidade:* ${selecionada.nationality}\n` +
                  `*📸 Galerias:* ${selecionada.galleries}\n\n` +
                  `*Gótica Bot*`;

        await conn.sendFile(m.chat, selecionada.picture, 'atriz.jpg', cap, m);
        await m.react('🍑');

    } catch (e) {
        console.error(e);
        m.reply('*❌ Erro ao buscar perfil.*');
    }
};

handler.help = ['atriz'];
handler.tags = ['+18'];
handler.command = ['atriz', 'star'];
handler.register = false;

export default handler;