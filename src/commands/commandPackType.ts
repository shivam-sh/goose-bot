import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

export interface CommandPack {
  commands: Command[];
}

export interface Command {
  declaration: SlashCommandBuilder;
  run: (interaction: CommandInteraction) => void;
}

export class Command implements Command {
  constructor(declaration: SlashCommandBuilder, run: (interaction: CommandInteraction) => void) {
    this.declaration = declaration;
    this.run = run;
  }
}