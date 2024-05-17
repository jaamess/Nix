const { promises: fs } = require('fs');
const path = require('path');
const { Client: DiscordClient, Collection, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');
const { sendVerificationEmbed } = require('./components/verificationEmbed.js');

class Client extends DiscordClient {
    constructor(options) {
        super(options);
        this.commands = new Collection();
    }
}

async function main() {
    const client = new Client({
        intents: [
            GatewayIntentBits.Guilds,
            GatewayIntentBits.GuildMessages,
            GatewayIntentBits.GuildMessageReactions
        ]
    });

    client.once('ready', async () => {
        console.log(`Logged in as ${client.user.tag}!`);

        const foldersPath = path.join(__dirname, 'commands');
        const commandFolders = await fs.readdir(foldersPath);

        for (const folder of commandFolders) {
            const commandsPath = path.join(foldersPath, folder);
            const commandFiles = (await fs.readdir(commandsPath)).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, file);
                const command = require(filePath);
                if ('data' in command && 'execute' in command) {
                    command.execute = command.execute.bind(client);
                    client.commands.set(command.data.name, command);
                } else {
                    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
                }
            }
        }

        const eventsPath = path.join(__dirname, 'events');
        const eventFiles = (await fs.readdir(eventsPath)).filter(file => file.endsWith('.js'));

        for (const file of eventFiles) {
            const filePath = path.join(eventsPath, file);
            const event = require(filePath);
            if (event.once) {
                client.once(event.name, (...args) => event.execute.apply(event, args));
            } else {
                client.on(event.name, (...args) => event.execute.apply(event, args));
            }
        }

        // Call the verification function
        await sendVerificationEmbed(client);
    });

    client.login(token).catch(console.error);
}

main().catch(console.error);