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
          msg.channel.send(`Invalid syntax, try ${vars.prefix}verify [userID]`);
          break;
        }
        if (functions.isLogged(args[0], msg.guild.id)) {
          msg.channel.send(
            `That person is already in the database!` +
              `Confirm your identity by entering the token sent to your email with \`~confirm [USERID] [TOKEN]\`` +
              `\nIf you think this is an error please use @Admin`
          );
          break;
        }
        console.log(`[>VERIFY] Checks Passed!`);

        functions.verify(msg, args);
        break;

      // Confirm the user's identity with their token
      case `${vars.prefix}confirm`:
        if (args.length != 2) {
          msg.channel.send(
            `Invalid syntax, try ${vars.prefix}confirm [userID] [TOKEN]`
          );
          break;
        }
        if (!functions.isLogged(args[0], msg.guild.id)) {
          msg.channel.send(
            `That person isn't in my database!` +
              `\nRun \`~verify [USERID]\` first, or double check the UserID`
          );
          break;
        }

        functions.confirm(msg, args);
        break;

      // Manually verify a user
      case `${vars.prefix}verifyUser`:
        if (!msg.member.hasPermission("ADMINISTRATOR")) {
          msg.reply(`You need Admin privileges to use that command!`);
          break;
        }
        if (args.length != 1) {
          msg.channel.send(
            `Invalid syntax, try ${vars.prefix}addUser [userID]`
          );
          break;
        }
        if (functions.isLogged[args[1]]) {
          msg.channel.send(
            "That person is already in the database! No use in adding them again. If you think this is an error please contact @Admin"
          );
          break;
        }

        break;

      // Log people
      case `${vars.prefix}lookupPerson`:
        if (!msg.member.hasPermission("ADMINISTRATOR")) {
          msg.reply(`You need Admin privileges to use that command!`);
          break;
        }
        if (args.length != 1) {
          msg.channel.send(
            `Invalid syntax, try ${vars.prefix}lookupPerson [userID]`
          );
          break;
        }

        functions.lookupPerson(msg, args);

        break;

      // Random Commands
      case `${vars.prefix}honk`:
        msg.channel.send(" HONK");
        break;

      case `${vars.prefix}help`:
        msg.channel.send(" Still working on that! Check in later :)");
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
