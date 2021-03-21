/*
 * Goose Bot
 * Shivam Sh | https://github.com/shivam-sh
 * 
 * Executes a command once it's been sent to the bot
 */

import { botConfig } from "../config";
import { Message } from 'discord.js';
import EventEmitter from 'events';
import { VerificationCoordinator } from "./commandRunners/verificationCoordinator";
import CommandRunner from "./commandRunners/commandRunner";

export class MessageHandler {
	start(emitter: EventEmitter) {
		emitter.on('message', async message =>  this.execute(message));
	}

	execute(message: Message) {
		const messageArray = message.content.split(" ");
		const command = messageArray[0].slice(1).toLowerCase();

		const commandRunners: CommandRunner[] = [
			new VerificationCoordinator(),
		];

		let potentialRunners = commandRunners.filter(runner => runner.canHandle(message));

		//TODO: Run the command for each potentialRunner, and manage the result from each
	}
}