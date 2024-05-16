const { Events } = require('discord.js');
const { sendVerificationEmbed } = require('../components/verificationEmbed.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	async execute(client) {
		// Toda lógica do embed de verificação está no componente requerido acima
		sendVerificationEmbed(verificationChannel, client)
	}
}