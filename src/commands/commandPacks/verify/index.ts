/*
 * Goose Bot
 * Shivam Sh | https://github.com/shivam-sh
 *
 * Default Goose Bot commands
 */

import { SlashCommandBuilder } from '@discordjs/builders';
import { MongoClient } from 'mongodb';
import Nodemailer from 'nodemailer';

import { Command, CommandPack } from '../../commandPackType';
import { mongo } from '../../../config';
import { Student } from "./studentType";
import { email } from '../../../config';
import { ObjectID } from 'bson';
import { CommandInteraction, Guild, GuildMemberRoleManager, Permissions } from 'discord.js';


module.exports = class UWVerify implements CommandPack {
  mongoURI = 'mongodb+srv://' + mongo.username + ':' + mongo.password + '@' + mongo.clusterURI + '/' + mongo.database + '?retryWrites=true&w=majority';
  client = new MongoClient(this.mongoURI);

  transporter = Nodemailer.createTransport({
    host: email.host,
    port: email.port,
    secure: false,
    auth: {
      user: email.address,
      pass: email.password,
    },
  });

  sendVerificationEmail(interaction: CommandInteraction, from: string, to: string, token: string) {
    interaction.editReply('Sending email...');
    try {
      this.transporter.sendMail({
        from: 'UWVerify <' + from + '>',
        to: to,
        subject: 'UW  Verification ✔',
        text: 'Your token is: ' + token,
        html: `<b>HONK</b></br>
      Hey! Your verification token is: ${token}</br>
      You can verify yourself by entering: </br>
      <b>\`/verify confirm ${token}\`</b>
      </br></br>
      Also, If you have time reply to this email with something random to prevent this account from being flagged as spam.`
      }, (err) => {
        if (err) {
          interaction.editReply('Something went wrong while sending you the email. Please try again later.');
          console.error(err);
        }
        else {
          interaction.editReply('Check your email, I sent you another verification token\n' +
            'enter `/verify confirm TOKEN` to finish the verification process');
        }
      });
    } catch (err) {
      interaction.reply('Something went wrong while sending the email. Please try again later.');
      console.error(err);
    }
  }

  commands = [
    new Command(
      new SlashCommandBuilder()
        .setName('verify')
        .setDescription('verification commands')

        .addSubcommand(subcommand => subcommand
          .setName('request')
          .setDescription('verify your status as a UWaterloo student')
          .addStringOption(option =>
            option.setName('watid')
              .setDescription('your UWaterloo WATID (the shortened form id used in your UW email)')
              .setRequired(true)))

        .addSubcommand(subcommand => subcommand
          .setName('confirm')
          .setDescription('confirm the token sent to your UW Email')
          .addStringOption(option =>
            option.setName('token')
              .setDescription('the unique token sent to your student email')
              .setRequired(true)))

        .addSubcommand(subcommand => subcommand
          .setName('force')
          .setDescription('[ADMIN] - force verify the selected user')
          .addUserOption(option =>
            option.setName('user')
              .setDescription('the user to force verify')
              .setRequired(true)))

        .addSubcommand(subcommand => subcommand
          .setName('wipe')
          .setDescription('[ADMIN] - delete all data associated with a verification profile')
          .addUserOption(option =>
            option.setName('user')
              .setDescription('user to wipe the data for')
              .setRequired(true)))
      ,
      async (interaction) => {
        var command = interaction.options.getSubcommand();

        // Check subcommand type
        switch (command) {
          case 'request':
            await interaction.deferReply()
            var userID: ObjectID = ObjectID.createFromHexString(interaction.user.id.padEnd(24, "0").slice(0, 24));
            var watID = interaction.options.getString('watid', true).toLowerCase().replace(/[^a-z0-9.]/g, "");

            await this.client.connect()
            var collection = this.client.db('UWVerify').collection('students');
            var student = await collection.findOne({ _id: userID }) as Student;

            if (student) {
              // UUID exists in db
              if (student.verified == true) {
                var role = interaction.guild?.roles.cache.find(n => n.name == "UW");
                if (role) {
                  // UW Role Exists
                  (interaction.member?.roles as GuildMemberRoleManager).add(role)
                  interaction.editReply("Verified! 🚀")
                }
                else {
                  // TODO: Role customization
                  interaction.editReply('Bot not configured correctly, need UW role!')
                }
              }
              else if (student.watID == watID) {
                // Verification alrready sent for this WatIAM
                interaction.editReply('Check your email, I sent you a verification token');
              }
              else {
                // Changed WatIAM
                const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                await collection.updateOne({ _id: userID }, { $set: { watID: watID, emails: [watID + '@uwaterloo.ca'], token: token } });
                student = await collection.findOne({ _id: userID }) as Student;
                interaction.editReply('Updated WatID');

                this.sendVerificationEmail(interaction, email.address, student.emails[0], token);
              }
            }
            else {
              // New UUID
              student = await collection.findOne({ watID: watID, verified: true }) as Student;

              if (student) {
                // WatIAM already claimed
                interaction.editReply('That WatID is already taken. Please try again.');
              }
              else {
                // WatIAM not claimed, set up verification
                const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

                student = {
                  _id: userID,
                  watID: watID,
                  emails: [
                    watID + '@uwaterloo.ca'
                  ],
                  verified: false,
                  verifiedBy: '',
                  token: token
                }

                await collection.insertOne(student);
                this.sendVerificationEmail(interaction, email.address, student.emails[0], token);
              }
            }

            await this.client.close();
            break;


          case 'confirm':
            var userID: ObjectID = ObjectID.createFromHexString(interaction.user.id.padEnd(24, "0").slice(0, 24));

            await this.client.connect();
            var collection = this.client.db('UWVerify').collection('students');

            var student = await collection.findOne({ _id: userID }) as Student;

            if (student) {
              // UUID exists
              if (student.token == interaction.options.getString('token', true)) {
                // Token matches
                await collection.updateOne({ _id: userID }, { $set: { verified: true, verifiedBy: "token" } });
                interaction.reply('Verified! 🚀');
              }
              else {
                interaction.reply('Invalid token!');
              }
            }
            else {
              // UUID not in db
              interaction.reply('Couldn\'t find your information, did you already run `/verify request [wat-id]`?');
            };

            await this.client.close();
            break;


          case 'wipe':
            var userID: ObjectID = ObjectID.createFromHexString(interaction.options.getUser('user', true).id.padEnd(24, "0").slice(0, 24));

            if ((interaction.member?.permissions as Permissions).has(Permissions.FLAGS.ADMINISTRATOR)) {
              // Admin access
              // TODO: Customizable roles
              await this.client.connect();
              var collection = this.client.db('UWVerify').collection('students');
              await collection.deleteOne({ _id: userID });
              await this.client.close();

              interaction.reply('Wiped! 💥');
            }
            else {
              interaction.reply('You don\'t have permission to do that! You can ask an admin to help with that if you\'d like');
            }
            break;


          case 'force':
            var userID: ObjectID = ObjectID.createFromHexString(interaction.options.getUser('user', true).id.padEnd(24, "0").slice(0, 24));

            if ((interaction.member?.permissions as Permissions).has(Permissions.FLAGS.ADMINISTRATOR)) {
              // Admin access
              await this.client.connect();
              var collection = this.client.db('UWVerify').collection('students');

              var student = {
                _id: userID,
                watID: 'unknown',
                emails: [
                  'unknown' + '@uwaterloo.ca'
                ],
                verified: true,
                verifiedBy: 'forced',
                token: ''
              }

              collection.updateOne({ _id: userID }, student, { upsert: true });
              await this.client.close();

              var role = interaction.guild?.roles.cache.find(n => n.name == "UW");
              if (role) {
                (interaction.options.getMember('user', true).roles as GuildMemberRoleManager).add(role)
              }
              else {
                // TODO: Role customization
                interaction.editReply('Bot not configured correctly, need UW role!')
              }

              interaction.reply('Verified! 🚀');
            }
            else {
              interaction.reply('You don\'t have permission to do that! You can ask an admin to help with that if you\'d like');
            }

            break;
        }
      })
  ];
}
