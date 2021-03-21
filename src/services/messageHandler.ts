/*
 * Goose Bot
 * Shivam Sh | https://github.com/shivam-sh
 * 
 * Exeutes a command once it's been sent to the bot
 */

import { botConfig } from "../config";
import { Message } from 'discord.js';
import EventEmitter from 'events';

export class MessageHandler {
	static listener = new MessageHandler();

	start(emitter: EventEmitter) {
		emitter.on('message', async message =>  this.execute(message) )
	}

	execute(message: Message) {
		if (message.author.bot || message.guild === null) return;
		if (message.content.substring(0, 1) != botConfig.prefix) return;

		const messageArray = message.content.split(" ")
		const command = messageArray[0].slice(1).toLowerCase()
		const args = messageArray.slice(1)

		switch (command) {
			case "honk":
				message.channel.send("***HONK***");
				break;

			case "verify":
				message.channel.send("verifying");
				break;

			case "help":

				break;

			default:
				message.channel.send(
					`***Honk***, I don't know that command yet! \nTry '${botConfig.prefix}help' to see what I can do!`
				);
				break;
		}
	}
}