const { EmbedBuilder, ActionRowBuilder, UserSelectMenuBuilder, ButtonBuilder } = require('discord.js');

async function sendVerificationEmbed(verificationChannel, client) {
    // Verifica se o embed já foi enviado
    const messages = await verificationChannel.messages.fetch({ limit: 100 });
    const embedSent = messages.find(m =>
        m.embeds.length > 0 &&
        m.embeds[0].title === 'Verificação' &&
        m.embeds[0].description === 'Quem você conhece no servidor?'
    );

    // Se o embed já está no canal, não envia novamente
    if (embedSent) {
        console.log('O embed de verificação já está no canal.');
        return;
    }

    // Cria o embed de verificação
    let embed = new EmbedBuilder()
        .setTitle('Verificação')
        .setDescription('Quem você conhece no servidor?')
        .setColor('#fd0e35');

    // Cria o menu de seleção de usuário
    const userSelectMenu = new UserSelectMenuBuilder()
        .setCustomId('send-verification')
        .setPlaceholder('Selecione ou digite um nickname.')
        .setMaxValues(1)
        .setMinValues(1);

    // Cria a linha de ação com o menu de seleção de usuário
    const row = new ActionRowBuilder()
        .addComponents(userSelectMenu);

    // Envia o embed com o menu de seleção de usuário para o canal de verificação
    const message = await verificationChannel.send({
        embeds: [embed],
        components: [row]
    });

    // Filtro do coletor de mensagens
    const collectorFilter = c => c.user.id === client.user.id;

    // Cria um coletor de componentes de mensagem
    const collector = verificationChannel.createMessageComponentCollector({
        filter: collectorFilter,
        time: 10_000
    });

    // Evento do coletor
    collector.on('collect', async (c) => {
        if (!c.values) return;

        let userID = c.values[0];
        let user = await client.users.fetch(userID);

        // Se o usuário não for encontrado, retorna
        if (!user) {
            return console.log('Usuário não encontrado.');
        }

        // Cria o embed de verificação
        const verifyEmbed = new EmbedBuilder()
            .setTitle('Verificação')
            .setDescription(`Usuário: ${user.username}`)
            .addFields({
                name: 'Quem conhece?',
                value: `<@${user.id}> (${user.username})`,
                inline: true
            })
            .setColor('#ffffff');

        // Cria botões para aprovação ou reprovação
        let option1 = new ButtonBuilder()
            .setStyle('Success')
            .setLabel('Aprovar')
            .setCustomId(`aprovar-${user.id}`);

        let option2 = new ButtonBuilder()
            .setStyle('Danger')
            .setLabel('Reprovar')
            .setCustomId(`reprovar-${user.id}`);

        // Cria a linha de ação com os botões
        const row2 = new ActionRowBuilder()
            .addComponents([option1, option2]);

        // Envia o embed de verificação com botões para o canal de verificação
        verificationChannel.send({
            content: `<@${user.id}> - ${user.toString()}`,
            embeds: [verifyEmbed],
            components: [row2]
        });
    });
}

module.exports = { sendVerificationEmbed };