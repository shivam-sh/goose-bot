/*
 * Goose Bot
 * Shivam Sh | https://github.com/shivam-sh
 *
 * Default Goose Bot commands
 */

import { SlashCommandBuilder } from '@discordjs/builders';
import { Command, CommandPack } from '../../commandPackType';

import { MongoClient } from 'mongodb';
import { mongo } from '../../../config';


module.exports = class UWVerify implements CommandPack {
  mongoURI = 'mongodb+srv://' + mongo.username + ':' + mongo.password + '@' + mongo.clusterURI + '/' + mongo.database + '?retryWrites=true&w=majority';
  client = new MongoClient(this.mongoURI);

  commands = [
    new Command(
      new SlashCommandBuilder()
        .setName('verify')
        .setDescription('verify your status as a UWaterloo student')
        .addStringOption(option =>
          option.setName('watid')
            .setDescription('your UWaterloo WATID (the shortened form id used in your UW email)')
            .setRequired(true)),

      async (interaction) => {
        const userID = interaction.member?.user.id;
        const watID = interaction.options.getString('watid');

        await this.client.connect(async (err, result) => {
          const collection = this.client.db('UWVerify').collection('students');

          if (err) {
            interaction.reply('Something went wrong. Please try again later.');
            console.error(err);
          } else if (result) {

          } else {

          }

          await this.client.close();
        });

        interaction.reply('verify ran');
      }),


    new Command(
      new SlashCommandBuilder()
        .setName('confirm')
        .setDescription('confirm the token sent to your UW Email')
        .addStringOption(option =>
          option.setName('token')
            .setDescription('the unique token sent to your student email')
            .setRequired(true)),

      async (interaction) => {
        const userID = interaction.member?.user.id;

        await this.client.connect(async (err, result) => {
          const collection = this.client.db('UWVerify').collection('students');

          if (err) {
            interaction.reply('Something went wrong. Please try again later.');
            console.error(err);
          } else if (result) {

          } else {

          }

          await this.client.close();
        });


        await this.client.close();

        interaction.reply('confirm ran');

      })
  ];
}