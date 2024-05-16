const { Events } = require('discord.js');
const { ChatOllama } = require('@langchain/community/chat_models/ollama');
const { system } = require('../config.json');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        return null;
        if (message.guild.id !== '737173603107340310') return;
        // Initialize Ollama
        const ollama = new ChatOllama({
            baseUrl: 'http://localhost:11434',
            model: 'llama3',
            // system: 'You are Nix bot. A jolly-sounding helpful assistant who loves helping people on Discord.'
        });

        // Check if the message content contains mentions of the bot
        const botMention = message.mentions.users.has(this.client.user.id);
        const botNameMention = message.content.toLowerCase().includes(this.client.user.username.toLowerCase());

        // Check if the message is a reply to the bot
        const isReplyToBot = message.reference && message.reference.messageID === message.client.user.id;

        // If any of the conditions are met, handle accordingly
        if (botMention || botNameMention || isReplyToBot) {
            if (message.author.bot) return;
            message.channel.sendTyping();
            const stream = await ollama.stream(message.content);
            const chunks = [];
            message.channel.sendTyping();
            for await (const chunk of stream) {
                chunks.push(chunk);
            }
            const response = chunks.map(r => r.lc_kwargs.content);
            await message.reply(response.join(''));

        }
    },
};