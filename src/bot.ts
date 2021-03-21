/*
 * Goose Bot
 * Shivam Sh | https://github.com/shivam-sh
 * 
 * Initializes the bot
 */

import { botConfig } from "./config";
import Discord from 'discord.js';
import { MessageHandler } from './services/messageHandler';

const bot = new Discord.Client();
const messageHandler = new MessageHandler();

bot.login(botConfig.discordToken);

bot.on("ready", async () => {
	console.log( 
`   ______                         ____        __
  / ____/___  ____  ________     / __ )____  / /_
 / / __/ __ \\/ __ \\/ ___/ _ \\   / __  / __ \\/ __/
/ /_/ / /_/ / /_/ (__  )  __/  / /_/ / /_/ / /_
\\____/\\____/\\____/____/\\___/  /_____/\\____/\\__/
-----------------------------------------------
`, `\n[CONNECTED] ${bot.user!.tag} is online!\n`
	);
	
	messageHandler.start(bot);
});