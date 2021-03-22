/*
 * Goose Bot
 * Shivam Sh | https://github.com/shivam-sh
 * 
 * Executes a command once it's been sent to the bot
 */

import { Message } from 'discord.js';
import EventEmitter from 'events';

// Import Command Handlers
import { CommandHandler } from "./commandRunners/commandHandler";
import { VerificationCoordinator } from "./commandRunners/verificationCoordinator";

export class MessageHandler {
	start(emitter: EventEmitter) {
		emitter.on('message', async message => this.handle(message));
	}

	handle(message: Message) {
		const commandHandlers: CommandHandler[] = [
			new VerificationCoordinator()
		];

		let validHandlers = commandHandlers.filter(runner => runner.canHandle(message));
		let validCommands = validHandlers.map(runner => runner.commandFor(message));
		let runResults = validCommands.map(command => command(message));

		Promise.any(runResults).then(result => {
			if(result.isError) {
				console.error('[ERROR] - ' + result.error.message);
				message.reply(result.error.message);
			}
		});
	}
}