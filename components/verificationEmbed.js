const { EmbedBuilder, ActionRowBuilder, UserSelectMenuBuilder, ButtonBuilder, InteractionType } = require('discord.js');
const config = require('../config.json');

async function sendVerificationEmbed(client) {
    try {
        const verificationChannel = await client.channels.fetch(config.settings.testGuild.verificationChannel);
        const adminChannel = await client.channels.fetch(config.settings.testGuild.adminChannel);
        const verifiedRoleID = config.settings.verifiedRole;

        // Verifica se o embed já foi enviado
        const messages = await verificationChannel.messages.fetch({ limit: 100 });
        const embedSent = messages.find(m =>
            m.embeds.length > 0 &&
            m.embeds[0].title === 'Verificação' &&
            m.embeds[0].description.includes('Quem você conhece no servidor?')
        );

        // Se o embed já está no canal, não envia novamente
        if (embedSent) {
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

        // Cria a actionRow com o menu de seleção de usuário
        const row = new ActionRowBuilder().addComponents(userSelectMenu);

        // Envia o embed com o menu de seleção de usuário para o canal de verificação
        await verificationChannel.send({
            embeds: [embed],
            components: [row]
        });

        // Cria um coletor de componentes de mensagem
        const collector = verificationChannel.createMessageComponentCollector({
            time: 15000 // 15 segundos para interação
        });

        collector.on('collect', async interaction => {
            if (interaction.type !== InteractionType.MessageComponent) return;

            // Verifica se a interação é do menu de seleção
            if (interaction.customId === 'send-verification') {
                try {
                    await interaction.deferUpdate(); // Defer the interaction to avoid "This interaction failed"

                    let userID = interaction.values[0];
                    let user = await client.users.fetch(userID);

                    // Se o usuário não for encontrado, retorna
                    if (!user) {
                        return console.log('User not found.');
                    }

                    // Cria o embed de verificação para o canal de administração
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
                    let approveButton = new ButtonBuilder()
                        .setStyle('Success')
                        .setLabel('Aprovar')
                        .setCustomId(`approve-${user.id}`);

                    let denyButton = new ButtonBuilder()
                        .setStyle('Danger')
                        .setLabel('Reprovar')
                        .setCustomId(`deny-${user.id}`);

                    // Cria a linha de ação com os botões
                    const row2 = new ActionRowBuilder().addComponents([approveButton, denyButton]);

                    // Envia o embed de verificação com botões para o canal de administração
                    await adminChannel.send({
                        content: `<@${user.id}> - ${user.toString()}`,
                        embeds: [verifyEmbed],
                        components: [row2]
                    });

                    // Coletor para os botões de aprovação/reprovação
                    const buttonCollector = adminChannel.createMessageComponentCollector({
                        componentType: 'BUTTON',
                        time: 15000 // 15 segundos para interação
                    });

                    buttonCollector.on('collect', async buttonInteraction => {
                        if (buttonInteraction.customId === `approve-${user.id}`) {
                            const member = await interaction.guild.members.fetch(userID);
                            await member.roles.add(verifiedRoleID);
                            await buttonInteraction.reply({ content: `O usuário <@${user.id}> foi aprovado e verificado com sucesso.`, ephemeral: true });
                        } else if (buttonInteraction.customId === `deny-${user.id}`) {
                            await user.send('Sua solicitação de verificação foi negada.');
                            await buttonInteraction.reply({ content: `O usuário <@${user.id}> foi reprovado.`, ephemeral: true });
                        }
                    });
                } catch (error) {
                    console.error('Erro ao processar a interação:', error);
                    await interaction.followUp({ content: 'Houve um erro ao processar sua solicitação.', ephemeral: true });
                }
            }
        });
    } catch (error) {
        console.error('Ocorreu um erro em sendVerificationEmbed:', error);
    }
}

module.exports = { sendVerificationEmbed };