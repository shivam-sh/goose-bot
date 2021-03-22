/*
 * Goose Bot
 * Shivam Sh | https://github.com/shivam-sh
 * 
 */

import { Message } from "discord.js";

export type Command = (message: Message) => Promise<Result<undefined, Error>>;

export interface CommandHandler{
    canHandle(message: Message): boolean;
    commandFor(message: Message): Command;
}