/* Este arquivo deve ser executado toda vez que você precisar
*  registrar seus comandos na API do Discord. Se um comando novo
*  não estiver aparecendo, rode esse script e atualize seu cliente.
*/

const { REST, Routes } = require('discord.js');
const { clientId, token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

const commands = [];
// Pega todas as pastas de comandos do diretório de comandos que criamos anteriormente
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	// Pega todos os arquivos de comandos do diretório de comandos que criamos anteriormente
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	// Pega a saída toJSON() do SlashCommandBuilder# de cada comando
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		} else {
			console.log(`[AVISO] O comando em ${filePath} está faltando uma propriedade "data" ou "execute" necessária.`);
		}
	}
}

// Constroi e prepara uma instância do módulo REST
const rest = new REST().setToken(token);

// define e atualiza os comandos!
(async () => {
	try {
		console.log(`Iniciada a atualização de ${commands.length} comandos de aplicação (/).`);

		// O método put é usado para atualizar completamente todos os comandos na guilda com o conjunto atual
		const data = await rest.put(
			Routes.applicationCommands(clientId),
			{ body: commands },
		);

		console.log(`Recarreguei com sucesso ${data.length} comandos de aplicação (/).`);
	} catch (error) {
		// E claro, registramos os erros!
		console.error(error);
	}
})();