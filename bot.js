/*
 * Goose Bot
 * Shivam Sh | https://github.com/shivam-sh
 *
 * A Discord bot to provide indentity confirmation through UW servers
 */

// Functions for data storage & managing profiles
const functions = require("./functions.js");

// Load Environment Variables
require("dotenv").config();

// Discord Bot Setup
const Discord = require("discord.js");
const bot = new Discord.Client();

bot.on("ready", async () => {
	console.log(`\n[LOGIN] ${bot.user.tag} is online!\n`);
});

bot.on("disconnect", (event) => {
	setTimeout(() => bot.destroy().then(() => bot.login(config.token)), 10000);
	console.log(
		`[DISCONNECT] Disconnected from gateway with code ${event.code} - Attempting reconnect.\n`
	);
});

bot.on("reconnecting", () => {
	console.log(`[RECONNECTING] Reconnect Action: Reconnecting to Discord...\n`);
});

// Discord message handler
bot.on("message", async (msg) => {
	if (msg.author.bot || msg.guild === null) return;

	if (msg.content.substring(0, 1) == process.env.PREFIX) {
    // Break up message into more usable chunks | "~command var1 var2 var3" => cmd: "~command" & args:["arg1", "arg2", "arg3"]
		let msgArray = msg.content.split(" ");
		let cmd = msgArray[0];
		let args = msgArray.slice(1);

		// Switch to handle all commands
		switch (cmd) {
			// Verify new users through email
			case `${process.env.PREFIX}verify`:
				if (args.length != 1) {
					msg.channel.send(
						`Invalid syntax, try ${process.env.PREFIX}verify [UW-USERNAME]`
					);
					break;
				}
				if (functions.isUsernameTaken(args[0], msg)) {
					msg.channel.send(
						`That username is already associated with a verified account!` +
							`\nIf you think this is an error please use @${process.env.ROLE_ADMIN}`
					);
					break;
				}
				if (functions.alreadyRanVerify(msg, args)) {
					msg.reply(
						`I've already sent you an email for that username!`
					);
					break;
				}

				functions.verify(msg, args);
				break;

			// Confirm the user's identity with their token
			case `${process.env.PREFIX}confirm`:
				if (args.length != 1) {
					msg.channel.send(
						`Invalid syntax, try ${process.env.PREFIX}confirm [TOKEN]`
					);
					break;
				}
				if (!functions.isInDatabase(msg, msg.author.id)) {
					msg.channel.send(
						`You aren't in my database!` +
							`\nRun \`${process.env.PREFIX}verify [UW-USERNAME]\` first, or double check the Username`
					);
					break;
				}

				functions.confirm(msg, args);
				break;

			// Manually verify a user
			case `${process.env.PREFIX}forceVerify`:
				if (!msg.member.roles.cache.some(role => role.name === process.env.ROLE_ADMIN)) {
					msg.reply(
						`You need the ${process.env.ROLE_ADMIN} role to use that command!`
					);
					break;
				}
				if (args.length != 1) {
					msg.channel.send(
						`Invalid syntax, try ${process.env.PREFIX}forceVerify [UW-USERNAME]`
					);
					break;
				}

				functions.forceVerify(msg, args);
				break;

			// Link a discord user with a UW username
			case `${process.env.PREFIX}linkUser`:
				if (!msg.member.roles.cache.some(role => role.name === process.env.ROLE_ADMIN)) {
					msg.reply(
						`You need the ${process.env.ROLE_ADMIN} role to use that command!`
					);
					break;
				}
				if (args.length != 2) {
					msg.channel.send(
						`Invalid syntax, try ${process.env.PREFIX}linkUser [@DISCORD] [UW-USERNAME]`
					);
					break;
				}

				functions.linkUser(msg, args);
				break;

			// Add a guest to the server
			case `${process.env.PREFIX}addGuest`:
				if (!msg.member.roles.cache.some(role => role.name === process.env.ROLE_ADMIN)) {
					msg.reply(
						`You need the ${process.env.ROLE_ADMIN} role to use that command!`
					);
					break;
				}
				if (args.length != 1) {
					msg.channel.send(
						`Invalid syntax, try ${process.env.PREFIX}addGuest [@DISCORD]`
					);
					break;
				}

				functions.addGuest(msg);
				break;

			// Lookup people in database
			case `${process.env.PREFIX}lookupUser`:
				if (!msg.member.roles.cache.some(role => role.name === process.env.ROLE_ADMIN)) {
					msg.reply(
						`You need the ${process.env.ROLE_ADMIN} role to use that command!`
					);
					break;
				}
				if (args.length != 1) {
					msg.channel.send(
						`Invalid syntax, try ${process.env.PREFIX}lookupPerson [UW-USERNAME]`
					);
					break;
				}
				functions.lookupUser(msg, args);
				break;

			// Bot test command
			case `${process.env.PREFIX}honk`:
				msg.channel.send("HONK");
				break;

			// Help command to inform server members
			case `${process.env.PREFIX}help`:
				if (args.length == 0) {
					let help = new Discord.MessageEmbed()
						.setColor("#ffffff")
						.setTitle("Help")
						.addField(
							`${process.env.PREFIX}verify [UW-USERNAME]`,
							`Verify your status as a member of the ${process.env.PROGRAM_NAME} program for access to the server`,
							true
						)
						.addField(
							`${process.env.PREFIX}confirm [VERIFICATION-TOKEN]`,
							"Confirm your student status with the verification token sent to your student email",
							true
						)
						.addField(
							`${process.env.PREFIX}honk`,
							"Umm, just honk",
							true
						)
						.setFooter(
							"Shivam Sharma | https://github.com/shivam-sh"
						);
					msg.channel.send(help);
				}
				break;

			// Fallback for any exceptions
			default:
				msg.channel.send(
					`Sorry, I don't know that command yet :(\nTry '${process.env.PREFIX}help' to see what I can do!`
				);
				break;
		}
	}
});

bot.login(process.env.DISCORD_TOKEN);
