/*
 * Goose Bot
 * Shivam Sh | https://github.com/shivam-sh
 *
 * Default Goose Bot commands
 */

import { SlashCommandBuilder } from '@discordjs/builders';
import { Command, CommandPack } from '../../commandPackType';

module.exports = class Default implements CommandPack {
  commands = [
    new Command(
      new SlashCommandBuilder()
        .setName("honk")
        .setDescription("HONK"),
      (interaction) => {
        interaction.reply('***HONK!***');
      })
  ];
}