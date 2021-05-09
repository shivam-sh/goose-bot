/*
 * Goose Bot
 * Shivam Sh | https://github.com/shivam-sh
 *
 * Executes a command once it's been sent to the bot
 */

import { Message } from 'discord.js';
import EventEmitter from 'events';

// Import Command Handlers
import { CommandHandler, Command } from './commandHandlerType';
import { VerificationCoordinator } from './commandHandlers/verificationCoordinator';

export class MessageHandler {
  commandHandlers: CommandHandler[] = [];

  start(bot: EventEmitter) {
    this.commandHandlers = [new VerificationCoordinator()];

    bot.on('message', async (message) => this.handle(message));
  }

  handle(message: Message) {
    let command = message.content.split(' ')[0].substring(1);

    let commands = this.commandHandlers
      .map((handler) => handler.commands[command])
      .filter((command) => command) as Command[];
    let validatedCommands = commands.filter((command) =>
      command.hasValidInput(message)
    );
    let runResults = validCommands.map((command) => command.function(message));

    Promise.any(runResults).then((result) => {
      if (result.isError) {
        console.error('[ERROR] - ' + result.error.message);
        message.reply(result.error.message);
      }
    });
  }
}
