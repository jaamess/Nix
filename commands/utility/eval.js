const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const colors = require('colors');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('eval')
		.setDescription('Executes JavaScript code.')
		.addStringOption(option =>
			option.setName('input')
				.setDescription('The code to execute')
				.setRequired(true)),
	async execute(interaction) {
		colors.enable();
		console.log(`Eval: `.yellow + `User executed command: ${interaction.user.username}`);

		// Check if the user is me
		if (interaction.user.id !== '440442804360052736') {
			return await interaction.reply({ content: 'Sorry, but you do not have permission to use this command.', ephemeral: true });
		}

		const input = interaction.options.getString('input');
		try {
			let output = eval(input);

			// If output is a Promise, await it
			if (output instanceof Promise) {
				output = await output;
			}

			// Make sure output is a string to prevent Discord API errors
			if (typeof output !== 'string') {
				output = require('util').inspect(output, { depth: 0 });
			}

			const maxMessageLength = 5999;
			let currentLength = 0;
			let messageEmbeds = [];

			// Split output into chunks for embed descriptions
			const maxEmbedDescriptionLength = 4095;
			const outputChunks = output.match(new RegExp('.{1,' + maxEmbedDescriptionLength + '}', 'g'));

			// Create embeds from chunks
			const embeds = outputChunks.map((chunk, index) => {
				return new EmbedBuilder()
					.setTitle(`Output`)
					.setDescription(`\`\`\`js\n${chunk}\n\`\`\``)
					.setColor('#0099ff');
			});

			// Send embeds in separate messages if they exceed the Discord message character limit
			for (const embed of embeds) {
				const embedLength = JSON.stringify(embed.toJSON()).length;
				if (currentLength + embedLength > maxMessageLength) {
					await interaction.reply({ embeds: messageEmbeds });
					messageEmbeds = []; // Reset for the next message
					currentLength = 0;
				}
				messageEmbeds.push(embed);
				currentLength += embedLength;
			}

			// Send any remaining embeds
			if (messageEmbeds.length) {
				await interaction.reply({ embeds: messageEmbeds });
			}

		} catch (error) {
			console.error(error);
			await interaction.reply({ content: 'An error occurred while executing the command.', ephemeral: true });
		}
	},
};