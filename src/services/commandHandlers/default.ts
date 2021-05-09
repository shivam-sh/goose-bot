/*
 * Goose Bot
 * Shivam Sh | https://github.com/shivam-sh
 *
 */

import { Message } from 'discord.js';
import { Command, CommandHandler } from '../commandHandlerType';
import Result from '../../custom/result';

export class DefaultHandler implements CommandHandler {
  commands: Record<string, Command | undefined> = {
    honk: {
      hasValidInput: () => {
        return true;
      },
      run: async (message) => {
        message.reply('HONK!');
        return Result.success(undefined);
      },
    },
    help: {
      hasValidInput: () => {
        return true;
      },
      run: async (message) => {
        message.reply('HONK!');
        return Result.success(undefined);
      },
    },
  };
}
