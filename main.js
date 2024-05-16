const { promises: fs } = require('fs');
const path = require('path');
const { Client: DiscordClient, Collection, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');

// Classe que estende o cliente padrão do Discord
class Client extends DiscordClient {
    constructor(options) {
        super(options);
        // Coleção para armazenar os comandos
        this.commands = new Collection();
    }
}

async function main() {
    // Cria uma nova instância do cliente com as intenções necessárias
    const client = new Client({ intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions
    ]});

    // Evento que é executado uma vez quando o cliente está pronto
    client.once('ready', async () => {
        console.log(`Logado como ${client.user.tag}!`);
        
        // Caminho para a pasta de comandos
        const foldersPath = path.join(__dirname, 'commands');
        // Lê os diretórios de comandos
        const commandFolders = await fs.readdir(foldersPath);

        // Itera sobre cada pasta de comandos
        for (const folder of commandFolders) {
            // Caminho para os arquivos de comando dentro da pasta
            const commandsPath = path.join(foldersPath, folder);
            // Filtra e lê os arquivos de comando que terminam com '.js'
            const commandFiles = (await fs.readdir(commandsPath)).filter(file => file.endsWith('.js'));
            // Itera sobre cada arquivo de comando
            for (const file of commandFiles) {
                // Caminho completo para o arquivo de comando
                const filePath = path.join(commandsPath, file);
                // Requer o arquivo de comando
                const command = require(filePath);
                // Verifica se o comando tem as propriedades 'data' e 'execute'
                if ('data' in command && 'execute' in command) {
                    // Vincula o método execute à instância do cliente
                    command.execute = command.execute.bind(client);
                    // Define o comando na coleção de comandos
                    client.commands.set(command.data.name, command);
                } else {
                    // Da um aviso se o comando estiver faltando as propriedades necessárias
                    console.log(`[AVISO] O comando em ${filePath} está faltando uma propriedade "data" ou "execute" necessária.`);
                }
            }
        }              

        // Caminho para a pasta de eventos
        const eventsPath = path.join(__dirname, 'events');
        // Filtra e lê os arquivos de evento que terminam com '.js'
        const eventFiles = (await fs.readdir(eventsPath)).filter(file => file.endsWith('.js'));

        // Itera sobre cada arquivo de evento
        for (const file of eventFiles) {
            // Caminho completo para o arquivo de evento
            const filePath = path.join(eventsPath, file);
            // Requer o arquivo de evento
            const event = require(filePath);
            // Verifica se o evento deve ser executado uma vez ou várias vezes
            if (event.once) {
                // Vincula o evento para ser executado uma vez
                client.once(event.name, (...args) => event.execute.apply(event, args));
            } else {
                // Vincula o evento para ser executado várias vezes
                client.on(event.name, (...args) => event.execute.apply(event, args));
            }
        }
    });

    // Faz login no cliente com o token
    client.login(token);
}

// Executa a função principal e joga os erros no console
main().catch(console.error);