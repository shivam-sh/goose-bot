/*
 * Goose Bot
 * Shivam Sh | https://github.com/shivam-sh
 *
 * Goose Bot UW Verification command pack
 */

import { SlashCommandBuilder } from '@discordjs/builders';
import { Collection, MongoClient, ObjectId } from 'mongodb';
import Nodemailer from 'nodemailer';

import { Command, CommandPack } from '../../commandPackType';
import { mongo } from './config';
import { Student, StudentObject } from './student';
import { email } from '../../../config';
import { CommandInteraction, GuildMemberRoleManager, Permissions } from 'discord.js';
import { GuildConfig } from './guildConfig';

export default class UWVerify implements CommandPack {
  mongoURI =
    'mongodb+srv://' +
    mongo.username +
    ':' +
    mongo.password +
    '@' +
    mongo.clusterURI +
    '/' +
    mongo.database +
    '?retryWrites=true&w=majority';
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

  sendVerificationEmail(interaction: CommandInteraction, from: string, to: string, token: string): void {
    interaction.editReply('Sending email...');
    try {
      this.transporter.sendMail(
        {
          from: 'UWVerify <' + from + '>',
          to: to,
          subject: 'UW  Verification ✔',
          text: 'Your token is: ' + token,
          html: `<b>HONK</b></br>
            Hey! Your verification token is: ${token}</br>
            You can verify yourself by entering: </br>
            <b>\`/verify confirm ${token}\`</b>
            </br></br>
            Also, If you have time reply to this email with something random to prevent this account from being flagged as spam.`,
        },
        (err) => {
          if (err) {
            interaction.editReply('❗️ Something went wrong while sending you the email. Please try again later.');
            console.error(err);
          } else {
            interaction.editReply(
              'Check your email, I sent you another verification token\n' +
                'enter `/verify confirm TOKEN` to finish the verification process',
            );
          }
        },
      );
    } catch (err) {
      interaction.editReply('❗️ Something went wrong while sending the email. Please try again later.');
      console.error(err);
    }
  }

  commands = [
    new Command(
      new SlashCommandBuilder()
        .setName('verify')
        .setDescription('verification commands')
        .addSubcommand((subcommand) =>
          subcommand
            .setName('request')
            .setDescription('verify your status as a UWaterloo student')
            .addStringOption((option) =>
              option
                .setName('watid')
                .setDescription('your UWaterloo WATID (the shortened form id used in your UW email)')
                .setRequired(true),
            ),
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName('confirm')
            .setDescription('confirm the token sent to your UW Email')
            .addStringOption((option) =>
              option.setName('token').setDescription('the unique token sent to your student email').setRequired(true),
            ),
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName('force')
            .setDescription('[ADMIN] - force verify the selected user')
            .addUserOption((option) =>
              option.setName('user').setDescription('the user to force verify').setRequired(true),
            ),
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName('wipe')
            .setDescription('[ADMIN] - delete all data associated with a verification profile')
            .addUserOption((option) =>
              option.setName('user').setDescription('user to wipe the data for').setRequired(true),
            ),
        )
        .addSubcommand((subcommand) =>
          subcommand
            .setName('role-options')
            .setDescription('[ADMIN] - configure settings for the verify package')
            .addStringOption((option) =>
              option
                .setName('role-type')
                .setDescription('the role to specify for this server')
                .addChoice('admin-role', 'admin')
                .addChoice('verified-role', 'verified')
                .setRequired(true),
            )
            .addRoleOption((option) =>
              option.setName('role').setDescription('the role to assing to this setting').setRequired(true),
            ),
        ),
      async (interaction) => {
        const command = interaction.options.getSubcommand();

        let userID: ObjectId;
        let guildID: ObjectId;
        let collection: Collection;
        let student: Student;
        let config: GuildConfig;

        await interaction.deferReply();

        if (interaction.guild) {
          switch (command) {
            // Request
            // Lets users request a verification token

            case 'request':
              userID = ObjectId.createFromHexString(interaction.user.id.padEnd(24, '0').slice(0, 24));
              const watID = interaction.options
                .getString('watid', true)
                .toLowerCase()
                .replace(/[^a-z0-9.]/g, '');

              await this.client.connect();
              collection = this.client.db('UWVerify').collection('students');
              student = (await collection.findOne({ _id: userID })) as Student;

              if (student) {
                if (student.verified == true) {
                  collection = this.client.db('UWVerify').collection('guildConfigs');
                  guildID = ObjectId.createFromHexString(interaction.guild.id.padEnd(24, '0').slice(0, 24));
                  config = (await collection.findOne({ _id: guildID })) as GuildConfig;

                  if (config) {
                    const verifiedRole = interaction.guild?.roles.resolve(config.verifiedRole);
                    if (verifiedRole) {
                      (interaction.member?.roles as GuildMemberRoleManager).add(verifiedRole.id);
                      interaction.editReply('Verified! 🚀');
                    } else {
                      interaction.editReply("❗️ Couldn't find role, configure the verified role in options!");
                    }
                  } else {
                    interaction.editReply("❗️ Couldn't find role, configure the verified role in options");
                  }
                } else if (student.watID == watID) {
                  interaction.editReply('Check your email, I sent you a verification token');
                } else {
                  const token =
                    Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
                  await collection.updateOne(
                    { _id: userID },
                    { $set: { watID: watID, emails: [watID + '@uwaterloo.ca'], token: token } },
                  );
                  student = (await collection.findOne({ _id: userID })) as Student;
                  interaction.editReply('Updated WatID');

                  this.sendVerificationEmail(interaction, email.address, student.emails[0], token);
                }
              } else {
                student = (await collection.findOne({ watID: watID, verified: true })) as Student;

                if (student) {
                  interaction.editReply('❗️ That WatID is already taken. Please try again.');
                } else {
                  student = StudentObject(userID, watID);
                  await collection.insertOne(student);
                  this.sendVerificationEmail(interaction, email.address, student.emails[0], student.token);
                }
              }
              await this.client.close();
              break;

            // Confirm
            // Validates the token and updates the student's verified status & role

            case 'confirm':
              userID = ObjectId.createFromHexString(interaction.user.id.padEnd(24, '0').slice(0, 24));

              await this.client.connect();
              collection = this.client.db('UWVerify').collection('students');
              student = (await collection.findOne({ _id: userID })) as Student;

              if (student) {
                if (student.token == interaction.options.getString('token', true)) {
                  await collection.updateOne({ _id: userID }, { $set: { verified: true, verifiedBy: 'token' } });
                  collection = this.client.db('UWVerify').collection('guildConfigs');
                  guildID = ObjectId.createFromHexString(interaction.guild.id.padEnd(24, '0').slice(0, 24));
                  config = (await collection.findOne({ _id: guildID })) as GuildConfig;

                  if (config) {
                    const verifiedRole = interaction.guild?.roles.resolve(config.verifiedRole);
                    if (verifiedRole) {
                      (interaction.member?.roles as GuildMemberRoleManager).add(verifiedRole.id);
                      interaction.editReply('Verified! 🚀');
                    } else {
                      interaction.editReply("❗️ Couldn't find role, configure the verified role in options!");
                    }
                  } else {
                    interaction.editReply("❗️ Couldn't find role, configure the roles in options!");
                  }
                } else {
                  interaction.editReply('❗️ Invalid token');
                }
              } else {
                interaction.editReply(
                  "❗️ Couldn't find your information, did you already run `/verify request [wat-id]`?",
                );
              }

              await this.client.close();
              break;

            // Force
            // Allows admins to force verify a user

            case 'force':
              await this.client.connect();
              collection = this.client.db('UWVerify').collection('guildConfigs');
              guildID = ObjectId.createFromHexString(interaction.guild.id.padEnd(24, '0').slice(0, 24));
              config = (await collection.findOne({ _id: guildID })) as GuildConfig;

              userID = ObjectId.createFromHexString(
                interaction.options.getUser('user', true).id.padEnd(24, '0').slice(0, 24),
              );

              if (config) {
                if (
                  (interaction.member?.roles as GuildMemberRoleManager).resolve(config.adminRole) ||
                  (interaction.member?.permissions as Permissions).has(Permissions.FLAGS.ADMINISTRATOR)
                ) {
                  const verifiedRole = interaction.guild?.roles.resolve(config.verifiedRole);
                  if (verifiedRole) {
                    (
                      interaction.guild?.members?.resolve(interaction.options.getUser('user', true))
                        ?.roles as GuildMemberRoleManager
                    ).add(verifiedRole);
                    interaction.editReply('Verified! 🚀');
                  } else {
                    interaction.editReply("❗️ Couldn't find role, configure this in options!");
                  }
                } else {
                  interaction.editReply(
                    "❗️ You don't have permission to do that! You can ask an admin to help with that if you'd like",
                  );
                }
              } else {
                interaction.editReply("❗️ Couldn't find role, configure the admin role in options!");
              }
              await this.client.close();
              break;

            // Wipe
            // Lets admins wipe users' data from the database

            case 'wipe':
              await this.client.connect();
              collection = this.client.db('UWVerify').collection('guildConfigs');
              guildID = ObjectId.createFromHexString(interaction.guild.id.padEnd(24, '0').slice(0, 24));
              config = (await collection.findOne({ _id: guildID })) as GuildConfig;
              userID = ObjectId.createFromHexString(
                interaction.options.getUser('user', true).id.padEnd(24, '0').slice(0, 24),
              );

              if (config) {
                if (
                  (interaction.member?.roles as GuildMemberRoleManager).resolve(config.adminRole) ||
                  (interaction.member?.permissions as Permissions).has(Permissions.FLAGS.ADMINISTRATOR)
                ) {
                  collection = this.client.db('UWVerify').collection('students');
                  await collection.deleteOne({ _id: userID });
                  interaction.editReply('Wiped! 💥');
                } else {
                  interaction.editReply(
                    "❗️ You don't have permission to do that! You can ask an admin to help with that if you'd like",
                  );
                }
              } else {
                interaction.editReply("❗️ Couldn't find role, configure the admin role in options!");
              }
              await this.client.close();
              break;

            // Role Options
            // Allows guild admins to configure custom roles to be used for their guild

            case 'role-options':
              if ((interaction.member?.permissions as Permissions).has(Permissions.FLAGS.ADMINISTRATOR)) {
                await this.client.connect();
                collection = this.client.db('UWVerify').collection('guildConfigs');
                const guildID = ObjectId.createFromHexString(interaction.guild.id.padEnd(24, '0').slice(0, 24));

                switch (interaction.options.getString('role-type', true)) {
                  case 'admin':
                    await collection.updateOne(
                      { _id: guildID },
                      { $set: { adminRole: interaction.options.getRole('role', true).id } },
                      { upsert: true },
                    );

                    interaction.editReply('⚙️ Updated admin role');
                    break;

                  case 'verified':
                    await collection.updateOne(
                      { _id: guildID },
                      { $set: { verifiedRole: interaction.options.getRole('role', true).id } },
                      { upsert: true },
                    );
                    interaction.editReply('⚙️ Updated verified role');
                    break;
                }
                await this.client.close();
              } else {
                interaction.editReply(
                  "❗️ You don't have permission to do that! You can ask an admin to help with that if you'd like",
                );
              }
              break;
          }
        }
      },
    ),
  ];
}
