const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { senVerificationEmbed, sendVerificationEmbed } = require('../../components/verificationEmbed');
const config = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verificar')
        .setDescription('Envia o embed de verificão!'),

    async execute(interaction) {
        const verificationChannel = config.settings.testGuild.verificationChannel;

        await sendVerificationEmbed(verificationChannel, interaction.client);
    },
};