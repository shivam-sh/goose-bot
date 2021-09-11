import { SlashCommandBuilder, SlashCommandSubcommandBuilder } from '@discordjs/builders';
import { SharedNameAndDescription } from '@discordjs/builders/dist/interactions/slashCommands/mixins/NameAndDescription';
import { CommandInteraction } from 'discord.js';

export interface CommandPack {
  commands: Command[];
}

export interface Command {
  declaration: SlashCommandBuilder | SharedNameAndDescription | SlashCommandSubcommandBuilder;
  run: (interaction: CommandInteraction) => void;
}

export class Command implements Command {
  constructor(
    declaration: SlashCommandBuilder | SharedNameAndDescription | SlashCommandSubcommandBuilder,
    run: (interaction: CommandInteraction) => void,
  ) {
    this.declaration = declaration;
    this.run = run;
  }
}
