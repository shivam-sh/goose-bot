/*
 * Goose Bot
 * Shivam Sh | https://github.com/shivam-sh
 *
 * Manages verification based commands
 */

import { Command, CommandHandler } from '../commandHandlerType';

import { Message } from 'discord.js';

export class VerificationCoordinator implements CommandHandler {
  commands: Record<string, Command | undefined> = {
    'honk': {
      hasValidInput: () => {
        return true
      },
      run: () => {
        return 
      }
    }
  };
}
