/*
 * Goose Bot
 * Shivam Sh | https://github.com/shivam-sh
 * 
 * Initializes the bot
 */

import { bot } from "./config";
import { Client, Intents } from 'discord.js';
import { CommandManager } from './commands/commandManager';

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const commandManager = new CommandManager();

client.once("ready", async () => {
	console.log(
		`   ______                         ____        __
  / ____/___  ____  ________     / __ )____  / /_
 / / __/ __ \\/ __ \\/ ___/ _ \\   / __  / __ \\/ __/
/ /_/ / /_/ / /_/ (__  )  __/  / /_/ / /_/ / /_
\\____/\\____/\\____/____/\\___/  /_____/\\____/\\__/
-----------------------------------------------
`, `\n[CONNECTED] ${client.user!.tag} is online!\n`
	);

	commandManager.start();
});

client.on('interactionCreate', async interaction => {
	if (interaction.isCommand())
		commandManager.handle(interaction);
});

client.login(bot.token);