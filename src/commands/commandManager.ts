/*
 * Goose Bot
 * Shivam Sh | https://github.com/shivam-sh
 *
 * Executes a command once it's been sent to the bot
 */

import { CommandInteraction } from 'discord.js';
import { Command, CommandPack } from './commandPackType';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';

import { bot } from '../config';

import fs from 'fs';
import path from 'path';
import { SlashCommandBuilder } from '@discordjs/builders';

export class CommandManager {
  commands: Command[] = [];
  commandPacks: CommandPack[] = [];

  start() {
    const folders = fs.readdirSync(path.normalize('src/commands/commandPacks')).filter(file =>
      fs.lstatSync(path.normalize('src/commands/commandPacks/' + file)).isDirectory());

    folders.forEach(async (folder) => {
      const Module = require('./commandPacks/' + folder);
      const Pack = new Module() as CommandPack;
      this.commandPacks.push(Pack)

      Pack.commands.forEach(command => {
        this.commands.push(command);
      });
    });

    const rest = new REST({ version: '9' }).setToken(bot.token);

    (async () => {
      console.log('[STATUS] - Attempting to register application commands.');
      try {
        await rest.put(
          // TODO: Procedural registration of guild & global commands
          // Currently only guild commands are implemented for dev purposes 
          // as are updated instantly
          Routes.applicationGuildCommands(bot.clientID, bot.guildID),
          { body: this.commands.flatMap((command) => (command.declaration as SlashCommandBuilder).toJSON()) },
        );

        console.log('[STATUS] - Successfully registered application commands.');
      } catch (error) {
        console.error(error);
      }
    })();
  }

  handle(interaction: CommandInteraction) {
    this.commandPacks.forEach(pack => {
      pack.commands.forEach(command => {
        if (interaction.commandName == command.declaration.name) {
          command.run(interaction);
        }
      })
    })
  }
}