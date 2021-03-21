/*
 * Goose Bot
 * Shivam Sh | https://github.com/shivam-sh
 * 
 * Manages verification based commands
 */

import { Message } from "discord.js";
import CommandRunner from "./commandRunner";

export class VerificationCoordinator implements CommandRunner {
    validCommands: string[] = [
        "verify",
        "confirm"
    ]

    canHandle(message: Message): boolean {
        const messageArray = message.content.split(" ");
        const command = messageArray[0].slice(1).toLowerCase();

        // TODO: rework this logic to actually check command logic (args, valdity, etc)
        return this.validCommands.includes(command);
    }
}