// Keep server online (only needer for repl.it hosting)
const keep_alive = require('./keep_alive.js')

// Functions for data storage & managing profiles
const people = require('./people.js')

// Preset variables
const preset =require('./presets.json')

// Email plugin to send verification codes
const email = require('emailjs')

// The Discord Bot itself
const Discord = require('discord.js')
const bot = new Discord.Client()

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
  
  if(msg.content.substring(0,1) == preset.prefix) {
    let msgArray = msg.content.split(" ")
    let cmd = msgArray[0]
    let args = msgArray.slice(1)


    // Handle bot commands
    switch(cmd) {
      // Simple greeting
      case `${prefix}hello`:
        msg.channel.send(" Hello!")
        break


      // Verify new users through e-mail
      case `${preset.prefix}verify`:
        console.log(`[VERIFY] for: ${args[0]}`)
        if (args.length != 1) {
          msg.channel.send(`Invalid syntax, try ${preset.prefix}verify [userID]`)
          console.log(`[\\VERIFY] Invalid Usage, Try Again!`)
          break
        }
        if (people.isLogged(args[0], msg.guild.id)) {
          msg.channel.send("That person is already in the database! If you think this is an error please use @Admin")
          console.log(`[\\VERIFY] Already Logged!`)
          break
        }

        var guild = msg.guild.id
        var response = people.lookup(args[0])

        if (response === 0) {
          people.loadData(guild)

          response = people.addPerson(args[0], guild)

          if (response === 0) {
            msg.channel.send(`Great! I added you to my database`)
            people.assignToken(args[0], guild)

            
            


            people.saveData(guild)
          }
          else if (response === 1) {
            msg.channel.send(`Uh Oh... Something went wrong! \nContacting <@&694339748528914472>...`)
            console.log(`[VERIFY -> ERROR] while adding to database :(`)
          }

        } 
        else if (response === 1) {
          msg.channel.send(`Doesn't look like you're in UWs database! This may be due to an incorrect UserID, try again. \nIf you think this is a mistake use @Admin!`)
          console.log(`[\\VERIFY] Invalid UserID: Try Again!`)
        }

          // email the person their userID if in SYDE
        break


      // Confirm the user's identity with their token
      case `${preset.prefix}confirm`:
        //people.addPerson(userID, firstName, lastName, department);
        // check person's userID against their token
        // if valid it gives them the verified role
        // if person is syde it gives them the correct role
        break

      // Manually verify a user
      case `${preset.prefix}verifyUser`:
        if (!msg.member.hasPermission('ADMINISTRATOR')) {
          msg.reply(`You need Admin privileges to use that command!`)
          break
        }
        if (args.length != 1) {
          msg.channel.send(`Invalid syntax, try ${preset.prefix}addUser [userID]`)
          break
        }
        if (people.isLogged[args[1]]) {
          msg.channel.send("That person is already in the database! No use in adding them again. If you think this is an error please contact @Admin")
          break
        }

        break
      
      // Log people
      case `${preset.prefix}logData`:
        people.logData(msg.guild.id)
        break



      // Random Commands
      case `${preset.prefix}honk`:
        msg.channel.send(" HONK")
        break

      case `${preset.prefix}help`:
        msg.channel.send(" Still working on that! Check in later :)")
        break
        
      default:
        msg.channel.send("Sorry, I don't know that command yet :(\nTry `~help` to see what I can do!")
        break
    }
  }
})

bot.login(process.env.TOKEN)