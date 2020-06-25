// Keep server online (only needer for repl.it hosting)
const keep_alive = require('./keep_alive.js')

// Main Program
const Discord = require('discord.js');
const client = new Discord.Client();

bot.on("ready", async () => {
  console.log(`[LOGIN] ${bot.user.tag} is online!`);
});

bot.on('disconnect', (event) => {
    setTimeout(() => bot.destroy().then(() => bot.login(config.token)), 10000)
    console.log(`[DISCONNECT] Notice: Disconnected from gateway with code ${event.code} - Attempting reconnect.`)
})

bot.on('reconnecting', () => {
    console.log(`[NOTICE] ReconnectAction: Reconnecting to Discord...`)
})

bot.on("message", async msg => {
  if (msg.author.bot) return;
  
  let msgArray = msg.content.split(" ");
  let cmd = msgArray[0];
  let args = msgArray.slice(1);
  
  if(cmd.substring(0,1) == prefix) {
    switch(cmd) {
      case `${prefix}hello`:
        return msg.reply(" Hello!");
        break;
        
      case `${prefix}ping`:
        return msg.reply(" Pong!");
        break;
        
      default:
        return msg.reply(" Invalid :(");
        break;
    }
  }
});

client.login(process.env.TOKEN);