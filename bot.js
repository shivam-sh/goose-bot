// Keep server online (only needer for repl.it hosting)
const keep_alive = require('./keep_alive.js')

// Functions for data storage & managing profiles
const people = require("./people.js");

// Helps parse .json from webserver
const fetch = require('node-fetch');

// Discord Bot
const Discord = require('discord.js');
const bot = new Discord.Client();

let prefix = "~";

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
  
  if(msg.content.substring(0,1) == prefix) {
    let msgArray = msg.content.split(" ");
    let cmd = msgArray[0];
    let args = msgArray.slice(1);

    switch(cmd) {
      case `${prefix}hello`:
        msg.reply(" Hello!");
        break;

      case '${prefix}verify`':
        // check if arg[1] is valid userID
          // if it is generate a verification token and store it in the database along with person's info
          // email the person their userID if in SYDE
        break;

      case `${prefix}addUser`:
        if (args.length != 1) {
          msg.reply(" Invalid syntax, try ~addUser [userID]");
        }

        var url = 'https://api.uwaterloo.ca/v2/directory/' + args[0] + '.json?key=' + process.env.API_KEY_V2
        let settings = { method: "Get" };

        fetch(url, settings)
            .then(res => res.json())
            .then((json) => {
                console.log(json);
                console.log(json.meta.message);
                if(json.meta.message == 'Request successful') {
                  people.addPerson(json.data.user_id, json.data.given_name, json.data.last_name, json.data.department)
                }
            });
        break;

        case '${prefix}confirm':
        //people.addPerson(userID, firstName, lastName, department);
        // check person's userID against their token
          // if valid it gives them the verified role
          // if person is syde it goves them the correct role
        break;
      
      case `${prefix}logData`:
        people.logData();
        break;

      case `${prefix}ping`:
        msg.reply(" Pong!");
        break;
        
      default:
        msg.reply(" Invalid :(");
        break;
    }
  }
});

bot.login(process.env.TOKEN);