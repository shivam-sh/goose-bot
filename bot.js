// Keep server online (only needer for repl.it hosting)
const keep_alive = require("./keep_alive.js");

// Functions for data storage & managing profiles
const functions = require("./functions.js");

// Preset variables
const vars = require("./setup.json");

// The Discord Bot itself
const Discord = require("discord.js");
const bot = new Discord.Client();

bot.on("ready", async () => {
  console.log(`\n\n[LOGIN] ${bot.user.tag} is online!\n\n`);
});

bot.on("disconnect", (event) => {
  setTimeout(() => bot.destroy().then(() => bot.login(config.token)), 10000);
  console.log(
    `[DISCONNECT] Notice: Disconnected from gateway with code ${event.code} - Attempting reconnect.`
  );
});

bot.on("reconnecting", () => {
  console.log(`[NOTICE] ReconnectAction: Reconnecting to Discord...`);
});

// Handle bot commands from Discord
bot.on("message", async (msg) => {
  if (msg.author.bot) return;

  if (msg.content.substring(0, 1) == vars.prefix) {
    let msgArray = msg.content.split(" ");
    let cmd = msgArray[0];
    let args = msgArray.slice(1);

    switch (cmd) {
      // Verify new users through e-mail
      case `${vars.prefix}verify`:
        if (args.length != 1) {
          msg.channel.send(`Invalid syntax, try ${vars.prefix}verify [UW-USERNAME]`);
          break;
        }
        if (functions.isUsernameTaken(args[0], msg)) {
          msg.channel.send(
            `That user is already verified in the database!` +
              `\nIf you think this is an error please use '@Admin'`
          );
          break;
        }
        console.log(`[>VERIFY] Checks Passed!`);

        functions.verify(msg, args);
        break;

      // Confirm the user's identity with their token
      case `${vars.prefix}confirm`:
        if (args.length != 1) {
          msg.channel.send(
            `Invalid syntax, try ${vars.prefix}confirm [TOKEN]`
          );
          break;
        }
        if (!functions.isInDatabase(msg)) {
          msg.channel.send(
            `That person isn't in my database!` +
              `\nRun \`${vars.prefix}verify [UW-USERNAME]\` first, or double check the Username`
          );
          break;
        }

        functions.confirm(msg, args);
        break;

      // Manually verify a user
      case `${vars.prefix}forceVerify`:
        if (!msg.member.hasPermission("ADMINISTRATOR")) {
          msg.reply(`You need Admin privileges to use that command!`);
          break;
        }
        if (args.length != 1) {
          msg.channel.send(
            `Invalid syntax, try ${vars.prefix}forceVerify [UW-USERNAME]`
          );
          break;
        }
        if (functions.isInDatabase(msg)) {
          msg.channel.send(
            "That person is already in the database! No use in adding them again."
          );
          break;
        }
        break;

      // Loookup people
      case `${vars.prefix}lookupUser`:
        if (!msg.member.hasPermission("ADMINISTRATOR")) {
          msg.reply(`You need Admin privileges to use that command!`);
          break;
        }
        if (args.length != 1) {
          msg.channel.send(
            `Invalid syntax, try ${vars.prefix}lookupPerson [UW-USERNAME]`
          );
          break;
        }

        functions.lookupUser(msg, args);
        break;

      // Random Commands
      case `${vars.prefix}honk`:
        msg.channel.send(" HONK");
        break;

      case `${vars.prefix}help`:
        if (args.length == 0 ) {
          let help = new Discord.MessageEmbed()
            .setColor('#ffffff')
            .setTitle('Help')
            .addField(`${vars.prefix}verify`, '', true)
            .addField(`${vars.prefix}confirm`, '', true)
            .addField(`${vars.prefix}honk`, '', true)
            .addField(`${vars.prefix}help admin`, '', true)
            .setFooter('Goose Bot - Shivam Sharma')
          msg.channel.send(help);
        }
        break;

      default:
        msg.channel.send(
          "Sorry, I don't know that command yet :(\nTry `~help` to see what I can do!"
        );
        break;
    }
  }
});

bot.login(vars.token);
