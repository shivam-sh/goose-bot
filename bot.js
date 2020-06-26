// Keep server online (only needer for repl.it hosting)
const keep_alive = require('./keep_alive.js')

// Functions for data storage & managing profiles
const people = require("./people.js")

// The Discord Bot itself
const Discord = require('discord.js')
const bot = new Discord.Client()

let prefix = "~"

bot.on("ready", async () => {
  console.log(`\n\n[LOGIN] ${bot.user.tag} is online!\n\n`)
});

bot.on('disconnect', (event) => {
    setTimeout(() => bot.destroy().then(() => bot.login(config.token)), 10000)
    console.log(`[DISCONNECT] Notice: Disconnected from gateway with code ${event.code} - Attempting reconnect.`)
})

bot.on('reconnecting', () => {
    console.log(`[NOTICE] ReconnectAction: Reconnecting to Discord...`)
})



bot.on("message", async msg => {
  if (msg.author.bot) return
  
  if(msg.content.substring(0,1) == prefix) {
    let msgArray = msg.content.split(" ")
    let cmd = msgArray[0]
    let args = msgArray.slice(1)


    // Handle various commands
    switch(cmd) {
      // Simple greeting
      case `${prefix}hello`:
        msg.channel.send(" Hello!")
        break

      case `${prefix}init`:
        people.initDatabase(msg.guild.id)
        break

      // Verify new users through e-mail
      case `${prefix}verify`:
        console.log(`[VERIFY] for: ${args[0]}`)
        if (args.length != 1) {
          msg.channel.send(`Invalid syntax, try ${prefix}verify [userID]`)
          console.log(`[VERIFY] Invalid Syntax, Try Again!`)
          break
        }
        if (people.isLogged(args[0], msg.guild.id)) {
          msg.channel.send("That person is already in the database! If you think this is an error please use @Admin")
          console.log(`[VERIFY] Already Logged!`)
          break
        }

        var response = people.addPerson(args[0], msg.guild.id)

        switch(response) {
          case 2:
            msg.channel.send(`Uh Oh... Something went wrong! \nContacting <@&694339748528914472>...`)
            console.log(`[VERIFY -> ERROR] while adding to database :(`)
            break
          case 1:
            msg.channel.send(`Doesn't look like you're in UWs database! This may be due to an invalid UserID, try again. \nIf you think this is a mistake use @Admin!`)
            console.log(`[VERIFY] Invalid UserID: Try Again!`)
            break
          case 0:
            msg.channel.send(`Great! I added you to my database`)
            break
          default:
            console.log(response)
            break
        }
       
          // email the person their userID if in SYDE
        break

      case `${prefix}addUser`:
        if (!msg.member.hasPermission('ADMINISTRATOR')) {
          msg.reply(`You need Admin privileges to use that command!`)
          break
        }
        
        if (args.length != 1) {
          msg.channel.send(`Invalid syntax, try ${prefix}addUser [userID]`)
          break
        }

        if (people.isLogged[args[1]]) {
          msg.channel.send("That person is already in the database! No use in adding them again. If you think this is an error please contact @Admin")
          break
        }

        break

      case `${prefix}confirm`:
        //people.addPerson(userID, firstName, lastName, department);
        // check person's userID against their token
          // if valid it gives them the verified role
          // if person is syde it goves them the correct role
        break
      
      case `${prefix}logData`:
        people.logData()
        break

      case `${prefix}ping`:
        msg.reply(" Pong!")
        break

      case `${prefix}help`:
        msg.channel.send(" Still working on that! Check in later :)")
        break
        
      default:
        msg.channel.send("Sorry, I don't know that command yet :(")
        break
    }
  }
})

bot.login(process.env.TOKEN)