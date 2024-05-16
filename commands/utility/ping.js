const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Replies with the latency!')
		.setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
	async execute(interaction) {
		const timeTaken = Date.now() - interaction.createdTimestamp + interaction.client.ws.ping;
		await interaction.reply(`Pong! This message had a latency of ${timeTaken}ms.`);
	},
};