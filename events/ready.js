const { Events } = require('discord.js');
const config = require('../config.json');
const { sendVerificationEmbed } = require('../components/verificationEmbed.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		// Test server
		const labID = config.settings.testGuild.guildID;
		const verificationChannel = config.settings.testGuild.verificationChannel;

		// Check if the embed message already exists
		let messages = await verificationChannel.messages.fetch({ limit: 100 });
		const embedMessage = messages.find(m => m.author.id === client.user.id && m.embeds.length > 0);

		// If the embed message does not exist, send it
		if (!embedMessage) {
			let embed = new EmbedBuilder()
				.setTitle('Bem-vindo ao Servidor!')
				.setDescription('Para se verificar, por favor, selecione um membro conhecido.')
				.setColor('#fd0e35');

			verificationChannel.send({
				embeds: [embed]
			});
		}
	}
}