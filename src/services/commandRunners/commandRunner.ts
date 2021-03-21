/*
 * Goose Bot
 * Shivam Sh | https://github.com/shivam-sh
 * 
 */

import { Message } from "discord.js";

export default interface CommandRunner {
    canHandle(message: Message): boolean;
}