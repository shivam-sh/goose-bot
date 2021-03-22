/*
 * Goose Bot
 * Shivam Sh | https://github.com/shivam-sh
 * 
 * Manages verification based commands
 */

import { Message } from "discord.js";
import { Command, CommandRunner } from "./commandRunner";

export class VerificationCoordinator implements CommandRunner {
    validCommands: string[] = [
        "verify",
        "confirm"
    ]

    canHandle(message: Message): boolean {
        const messageArray = message.content.split(" ");
        const command = messageArray[0].slice(1).toLowerCase();

        // TODO: rework this logic to actually check command logic (args, validity, etc)
        return this.validCommands.includes(command);
    }

    commandFor(message: Message): Command {
        // TODO: Make this method return commands that can be run based on the received message
    }
}