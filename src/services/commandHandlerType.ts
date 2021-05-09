/*
 * Goose Bot
 * Shivam Sh | https://github.com/shivam-sh
 *
 */

import { Message } from 'discord.js';
import Result from '../custom/result';

export interface Command {
  hasValidInput: (message: Message) => boolean;
  run: (
    message: Message
  ) => Promise<Result<undefined, null>> | Promise<Result<null, Error>>;
}

export interface CommandHandler {
  commands: Record<string, Command | undefined>;
}
