// Token generator
const crypto = require("crypto");

// Helps parse .json from webserver
const fetch = require("node-fetch");

// Email setup to send verification codes
const nodemailer = require("nodemailer");
const mailAccount = nodemailer.createTransport({
  host: process.env.HOST,
  port: process.env.PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL, // generated ethereal user
    pass: process.env.EMAILPASS, // generated ethereal password
  },
});

// File saving/loading
const fs = require(`fs`);

// Discord for message handling
const Discord = require("discord.js");

var rawData;
var people;
var stats;

module.exports = {
  logData: function (guildID) {
    this.loadData(guildID);

    console.log(people);
  },

  isUsernameTaken: function (userID, msg) {
    this.loadData(msg.guild.id);

    if (stats.claimed[userID]) {
      return true;
    }
    return false;
  },

  isInDatabase: function (msg, discID) {
    this.loadData(msg.guild.id);

    if (people[discID]) {
      return true;
    }
    return false;
  },

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

  verify: function (msg, args) {
    let guild = msg.guild.id;
    let uwID = args[0];
    let discID = msg.author.id;
    let url = `https://api.uwaterloo.ca/v2/directory/${uwID}.json?key=${process.env.UWAPIKEY}`;

    fetch(url, { method: "Get" })
      .then((res) => res.json())
      .then((json, reject) => {
        if (json.meta.message !== "Request successful") {
          console.log(url);
          throw `Look like you're not in UW's database! This is likely due to an incorrect UserID, try again. \nIf you think this is a mistake use @Admin!`;
        } else {
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
          if (json.data.department === `ENG/Systems Design`) {
            stats.info.numInSyde++;
          } else {
            throw "You're not in SYDE! An admin can give you a guest role if you would like access to the server";
          }

          return people[discID];
        }
      })
      .then((user) => {
        try {
          mailAccount.sendMail({
            from: `"Goose Bot 👻" <${process.env.EMAIL}>`, // sender address
            to: user.email[0], // list of receivers
            subject: "UW SYDE '25 Verification ✔", // Subject line
            text: `TOKEN: ${user.token}`, // plain text body
            html: `<b>HONK</b></br>
                                Hey! Your verification token is: ${user.token}</br>
                                You can verify yourself by entering: </br>
                                <b>\`~confirm ${user.token}\`</b>!
                                </br></br>
                                Also! If you have time reply to this email with something random to prevent this account from being flagged as spam.`, // html body
          });
          msg.channel.send(
            `I'm sending you an email to your UW Outlook account!`
          );
        } catch {
          throw "Error sending email! An <@&694339748528914472> will send your verification token to you";
        }

        msg.channel.send(
          `I'm sending a token to your UW email!\nGo ahead and enter \'~confirm [TOKEN]\' to finish the process`
        );
      })
      .catch((err) => {
        msg.channel.send(err);
        console.log(err);
      })
      .then(() => {
        this.saveData(guild);
        people = null;
        stats = null;
        rawData = null;
      });
  },

  confirm: function (msg, args) {
    let guild = msg.guild.id;
    let discID = msg.author.id;
    let token = args[0];
    let verified = msg.member.guild.roles.cache.find(
      (role) => role.name === "Verified"
    );
    this.loadData(guild);

    if (this.isUsernameTaken(people[discID].uwID, msg)) {
      msg.channel.send(
        `That UW Username is already associated with a verified account!` +
          `\nIf you think this is an error please use '@Admin'`
      );
      return;
    }
    if (people[discID].verification == "Verified") {
      msg.reply(` you are already verified!`);
    } else if (people[discID].token != token) {
      msg.reply(` incorrect token!`);
    } else {
      try {
        msg.member.roles.add(verified);
        people[discID].verification = "Verified";
        msg.reply(
          `Verified ${people[discID].uwID}! \nWelcome to the server! :)`
        );
        stats.info.numVerified++;
        stats.claimed[people[discID].uwID] = discID;
        this.saveData(guild);
      } catch {
        console.log(`[ERROR] - Couldn't verify ${people[discID].uwID}`);
        msg.channel.send(`Couldn't verify ${people[discID].uwID}`);
      }
    }
  },

  // Verify a user without the need for a UW username
  forceVerify: function (msg, args) {
    let guild = msg.guild.id;
    let member = msg.guild.member(msg.mentions.users.first());
    let verified = msg.guild.roles.cache.find(
      (role) => role.name === "Verified"
    );

    this.loadData(guild);

    try {
      if (!member) {
        msg.reply(`Can't find that user in this server :(`);
      }
      if (people[discID].verification == "Verified") {
        msg.reply(`User is already verified!`);
        return;
      }
    } catch {}
    try {
      member.roles.add(verified);

      people[member.id] = {
        discName: `${member.user.username}#${member.user.discriminator}`,
        verification: "Verified",
      };

      msg.channel.send(
        `Verified ${people[member.id].discName}! \nWelcome to the server :)`
      );
      stats.info.numVerified++;

      console.log(args.length);
      console.log(args[1]);
      if (args.length == 2) {
        try {
          let role = args[1].replace("-", " ");
          console.log(role);
          role = msg.guild.roles.cache.find((role) => role.name == role);

          console.log(role);
          if (role) {
            member.roles.add(role);
          }
        } catch {
          msg.channel.send("Couldn't assign role \"" + role + '"');
        }
      }

      this.saveData(guild);
    } catch (err) {
      console.log(err);
      msg.reply(`Couldn't verify ${args[0]}`);
    }
  },

  // Add guest user with limited access tot hr server
  addGuest: function (msg, discord) {
    let guild = msg.guild.id;
    let member = msg.guild.member(msg.mentions.users.first());
    let guest = msg.member.guild.roles.cache.find(
      (role) => role.name === "Guest"
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

    try {
      member.roles.add(guest);
      people[member.id].verification = "Guest";

      people[member.id] = {
        discName: `${member.user.username}#${member.user.discriminator}`,
        verification: "Guest",
      };

      msg.channel.send(
        `Added Guest ${people[member.id].discName}! \nWelcome to the server :)`
      );
      stats.info.numGuests++;

      this.saveData(guild);
    } catch (err) {
      console.log(err);
      msg.reply(`Couldn't add guest ${discord[0]}! :(`);
    }
  },

  lookupUser: function (msg, args) {
    let url = `https://api.uwaterloo.ca/v2/directory/${args[0]}.json?key=${process.env.UWAPIKEY}`;

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
        `{ "info":{"requests": 0, "numVerified": 0, "numGuests": 0, "numInSYDE": 0}, "claimed":{} }`
      );

      rawData = fs.readFileSync(`.data/people-${guildID}.json`);
      people = JSON.parse(rawData);

      rawData = fs.readFileSync(`.data/stats-${guildID}.json`);
      stats = JSON.parse(rawData);
    }
  },

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
};
