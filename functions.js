/*
 * Goose Bot - functions.js
 * Shivam Sharma | https://github.com/shivam-sh
 *
 * This file contains all the functions that
 * manage data & make http requests for the bot
 */

// Load Environment Variables
require("dotenv").config();

// Token generator
const crypto = require("crypto");

// Helps parse .json from webserver
const fetch = require("node-fetch");

// Email setup
const nodemailer = require("nodemailer");
const mailAccount = nodemailer.createTransport({
	host: process.env.EMAIL_HOST,
	port: process.env.EMAIL_PORT,
	secure: false,
	auth: {
		user: process.env.EMAIL,
		pass: process.env.EMAIL_PASS,
	},
});

// File saving/loading
const fs = require(`fs`);

// Discord for message handling
const Discord = require("discord.js");

// Global variables to hold file info
var rawData;
var people;
var stats;

// Specify functions to be exported
module.exports = {
	// Load the database associated with the current guild or init new if it doesn't exist
	loadData: function (guildID) {
		try {
			rawData = fs.readFileSync(`.data/people-${guildID}.json`);
			people = JSON.parse(rawData);

			rawData = fs.readFileSync(`.data/stats-${guildID}.json`);
			stats = JSON.parse(rawData);

			return 0;
		} catch {
			fs.writeFileSync(`.data/people-${guildID}.json`, `{}`);
			fs.writeFileSync(
				`.data/stats-${guildID}.json`,
				`{ "info":{"requests": 0, "numVerified": 0, "numGuests": 0, "numInProgram": 0}, "claimed":{} }`
			);

			rawData = fs.readFileSync(`.data/people-${guildID}.json`);
			people = JSON.parse(rawData);

			rawData = fs.readFileSync(`.data/stats-${guildID}.json`);
			stats = JSON.parse(rawData);
		}
	},

	// Save the current database state to the filesystem
	saveData: function (guildID) {
		try {
			rawData = JSON.stringify(people, null, 4);
			fs.writeFileSync(`.data/people-${guildID}.json`, rawData);

			rawData = JSON.stringify(stats, null, 4);
			fs.writeFileSync(`.data/stats-${guildID}.json`, rawData);

			return null;
		} catch (err) {
			console.log(err);
			return "Error saving data!";
		}
	},

	// Verifies that the person is part of the correct program and adds them to the database for further actions
	verify: function (msg, args) {
		let guild = msg.guild.id;
		let uwID = args[0];
		let discID = msg.author.id;
		let url = `https://api.uwaterloo.ca/v2/directory/${uwID}.json?key=${process.env.UW_API_KEY}`;

		// Get the JSON from the url and parse it
		fetch(url, { method: "Get" })
			.then((res) => res.json())
			.then((json) => {
				if (json.meta.message !== "Request successful") {
					console.log(url);
					throw `Look like you're not in UW's database! This is likely due to an incorrect UserID, try again. \nIf you think this is a mistake use @${process.env.ROLE_ADMIN}!`;
				} else {
					// Add the person to the database to prepare for future interactions
					this.loadData(guild);

					people[discID] = {
						fName: json.data.given_name,
						lName: json.data.last_name,
						uwID: uwID,
						discName: `${msg.author.username}#${msg.author.discriminator}`,
						email: json.data.email_addresses,
						dept: json.data.department,
						verification: null,
						token: crypto
							.randomBytes(Math.ceil(10 / 2))
							.toString("hex")
							.slice(0, 10),
					};

					msg.channel.send(`Great! I added ${uwID} to my database.`);
					stats.info.requests++;
					if (
						json.data.department ===
						process.env.PROGRAM_CONFIRMATION
					) {
						stats.info.numInProgram++;
					} else {
						throw `You're not in ${process.env.PROGRAM_NAME}! An @${process.env.ROLE_ADMIN} can give you a guest role if you would like access to the server`;
					}

					return people[discID];
				}
			})
			.then((user) => {
				// Send an email to their account for identity confirmation
				try {
					mailAccount.sendMail({
						from: `"Goose Bot 👻" <${process.env.EMAIL}>`, // sender address
						to: user.email[0], // receiver address
						subject:
							"UW " +
							process.env.PROGRAM_NAME +
							" Verification ✔", // Subject line
						text: `TOKEN: ${user.token}`, // plain text body
						html: `<b>HONK</b></br>
						Hey! Your verification token is: ${user.token}</br>
						You can verify yourself by entering: </br>
						<b>\`${process.env.PREFIX}confirm ${user.token}\`</b>!
						</br></br>
						Also! If you have time reply to this email with something random to prevent this account from being flagged as spam.`, // html body
					});
					msg.channel.send(
						`I'm sending a token to your UW email!\nGo ahead and enter \'${process.env.PREFIX}confirm [TOKEN]\' to finish the verification process`
					);
				} catch (err) {
					console.log(err);
					throw `Error sending email! Please contact @${process.env.ROLE_ADMIN} to request a verification token`;
				}
			})
			.catch((err) => {
				msg.channel.send("[ERROR] - " + err);
				console.log(" - " + err);
			})
			.then(() => {
				this.saveData(guild);
			});
	},

	// Confirm the user's identity and associate their discord with their UW account
	confirm: function (msg, args) {
		let guild = msg.guild.id;
		let discID = msg.author.id;
		let token = args[0];
		let verified = msg.guild.roles.cache.find(
			(role) => role.name === process.env.ROLE_VERIFIED
		);
		this.loadData(guild);

		if (people[discID].verification == "Verified") {
			msg.reply(` you are already verified!`);
		} else if (this.isUsernameTaken(people[discID].uwID, msg)) {
			msg.channel.send(
				`That username is already associated with a verified account!` +
					`\nIf you think this is an error please use '@${process.env.ROLE_ADMIN}'`
			);
			return;
		} else if (people[discID].token != token) {
			msg.reply(` incorrect token!`);
		} else {
			// Set role to verified
			msg.member.roles
				.add(verified)
				.then(() => {
					people[discID].verification = "Verified";
					msg.reply(
						`Verified ${people[discID].uwID}! \nWelcome to the server! :)`
					);
					stats.info.numVerified++;
					stats.claimed[people[discID].uwID] = discID;
					this.saveData(guild);
				})
				.catch((err) => {
					console.log(
						`[ERROR] - Couldn't verify ${people[discID].uwID} \n${err}`
					);
					msg.channel.send(
						`Couldn't verify ${people[discID].uwID}, check logs for reason`
					);
				});
		}
	},

	// Verify a user without the need for a UW username
	forceVerify: function (msg) {
		let guild = msg.guild.id;
		let member = msg.guild.member(msg.mentions.users.first());
		let verified = msg.guild.roles.cache.find(
			(role) => role.name == process.env.ROLE_VERIFIED
		);

		this.loadData(guild);

		try {
			if (!member) {
				msg.reply(`Can't find that user in this server :(`);
				return;
			}
			if (people[discID].verification == "Verified") {
				msg.reply(`User is already verified!`);
				return;
			}
		} catch {}

		// Verify member
		member.roles
			.add(verified)
			.then(() => {
				people[
					member.id
				].discName = `${member.user.username}#${member.user.discriminator}`;
				people[member.id].verification = "Verified";
				msg.reply(
					`Verified ${
						people[member.id].discName
					}! \nWelcome to the server! :)`
				);
				stats.info.numVerified++;
				this.saveData(guild);
			})
			.catch((err) => {
				console.log(
					`[ERROR] - Couldn't verify ${people[discID].discName} \n${err}`
				);
				msg.channel.send(
					`Couldn't verify ${people[discID].discName}, check logs for reason`
				);
			});
	},

	// Links a discord user to a given UW username (doesn't verify the user)
	// If the user has the verified role it also sets the UW username as claimed
	linkUser: function (msg, args) {
		let guild = msg.guild.id;
		let member = msg.guild.member(msg.mentions.users.first());
		let uwID = args[1];
		let url = `https://api.uwaterloo.ca/v2/directory/${uwID}.json?key=${process.env.UW_API_KEY}`;

		// Get information for the database by using the UW API
		fetch(url, { method: "Get" })
			.then((res) => res.json())
			.then((json) => {
				if (json.meta.message !== "Request successful") {
					console.log(url);
					throw `Look like this user is not in UW's database! This is likely due to an incorrect UserID, try again.`;
				} else {
					// Add the person to the database to prepare for future interactions
					this.loadData(guild);

					people[member.id] = {
						fName: json.data.given_name,
						lName: json.data.last_name,
						uwID: uwID,
						discName: `${msg.author.username}#${msg.author.discriminator}`,
						email: json.data.email_addresses,
						dept: json.data.department,
						verification: null,
						token: crypto
							.randomBytes(Math.ceil(10 / 2))
							.toString("hex")
							.slice(0, 10),
					};

					msg.channel.send(`Great! I added ${uwID} to my database.`);
					stats.info.requests++;
					if (
						json.data.department ===
						process.env.PROGRAM_CONFIRMATION
					) {
						stats.info.numInProgram++;
					} else {
						throw `This user isn't in ${process.env.PROGRAM_NAME}!`;
					}

					// If the server member is already verified, show that in the database
					if (
						member.roles.cache.some(
							(role) => role.name === process.env.ROLE_VERIFIED
						)
					) {
						stats.info.numVerified++;
						people[member.id].verification = "Verified";
						stats.claimed[uwID] = member.id;
					}

					return;
				}
			})

			.catch((err) => {
				msg.channel.send("[ERROR] - " + err);
				console.log(" - " + err);
			})
			.then(() => {
				this.saveData(guild);
			});
	},

	// Add guest user with limited access to the server
	addGuest: function (msg) {
		let guild = msg.guild.id;
		let member = msg.guild.member(msg.mentions.users.first());
		let guest = msg.guild.roles.cache.find(
			(role) => role.name === process.env.ROLE_GUEST
		);
		this.loadData(guild);

		try {
			if (!member) {
				msg.reply(`Can't find that user in this server :(`);
			}
			if (people[member.id].verification == "Verified") {
				msg.channel.send(`That user is already verified!`);
				return;
			} else if (people[member.id].verification == "Guest") {
				msg.channel.send(`User is already a guest!`);
				return;
			}
		} catch {
			people[member.id] = {
				discName: `${member.user.username}#${member.user.discriminator}`,
				verification: null,
			};
		}
		// Verify member
		member.roles
			.add(guest)
			.then(() => {
				people[
					member.id
				].discName = `${member.user.username}#${member.user.discriminator}`;
				people[member.id].verification = "Guest";
				msg.reply(
					`Added Guest ${
						people[member.id].discName
					}! \nWelcome to the server! :)`
				);
				stats.info.numGuests++;
				this.saveData(guild);
			})
			.catch((err) => {
				console.log(
					`[ERROR] - Couldn't add guest ${
						people[member.id].discName
					} \n${err}`
				);
				msg.channel.send(
					`Couldn't add guest ${
						people[member.id].discName
					}, check logs for reason`
				);
			});
	},

	// Look up a user in UW's database
	lookupUser: function (msg, args) {
		let url = `https://api.uwaterloo.ca/v2/directory/${args[0]}.json?key=${process.env.UW_API_KEY}`;

		fetch(url, { method: "Get" })
			.then((res) => res.json())
			.then((json) => {
				if (json.meta.message == "Request successful") {
					let lookup = new Discord.MessageEmbed()
						.setColor("#ffffff")
						.setTitle("User Info: " + args[0])
						.addField("Full Name:", json.data.full_name, true)
						.addField("Common Names:", json.data.common_names, true)
						.addField("Department:", json.data.department, true)
						.addField("Emails:", json.data.email_addresses, true)
						.setFooter("Goose Bot - Info parsed from UW LDAP");
					msg.channel.send(lookup);
				} else {
					msg.channel.send(
						`Lookup failed :( \n Double check the user id you entered`
					);
				}
			});
	},

	// Add a user to the chat the command was sent to
	// Useful for chats where only certain people want access/want to decide who is let in
	addToChat: function(msg) {
		let member = msg.guild.member(msg.mentions.users.first());

		if (!msg.member.roles.cache.some(role => role.name === process.env.ROLE_VERIFIED)) {
			msg.channel.send(`The user you mentioned hasn't gone through verification! \nUse @${process.env.ROLE_ADMIN} to request their verification`);
			return;
		}

		msg.channel.updateOverwrite(member, {
			VIEW_CHANNEL: true,
			SEND_MESSAGES: true,
			READ_MESSAGE_HISTORY: true
		});
	},

	// Check if someone has already claimed & verified a username
	isUsernameTaken: function (userID, msg) {
		this.loadData(msg.guild.id);
		if (stats.claimed[userID]) {
			return true;
		}
		return false;
	},

	// Checks if a given discord ID is already in the database
	isInDatabase: function (msg, discID) {
		this.loadData(msg.guild.id);
		if (people[discID]) {
			return true;
		}
		return false;
	},

	// Checks if a given person has already ran the verify command
	alreadyRanVerify: function (msg, args) {
		let discID = msg.author.id;
		let uwID = args[0];
		try {
			if (people[discID].uwID == uwID) {
				return true;
			}
		} catch {}
		return false;
	},
};
