// Helps parse .json from webserver
const fetch = require('node-fetch')

// Token generator
const crypto = require('crypto')

// File saving/loading
const fs = require(`fs`)

var rawData
var people
var stats

module.exports = {

    logData: function(guildID) {
        this.loadData(guildID)

        console.log(people)
    },

    isLogged: function(userID, guildID) {
        this.loadData(guildID)
        
        if (people[userID] !== undefined) {
            return true
        }

        return false
    },

    addPerson: function(userID, guildID) {
        var url = 'https://api.uwaterloo.ca/v2/directory/' + userID + '.json?key=' + process.env.API_KEY_V2

        console.log(url)
        fetch(url, { method: `Get` })
          .then(res => res.json())
          .then((json) => {
              console.log(` - requesting JSON for ${userID}`)
              if(json.meta.message === 'Request successful' ) {
                try {
                    console.log(` - received JSON for ${userID}`)
                    this.loadData(guildID)

                    people[userID] = {
                        "fName": json.data.given_name,
                        "lName": json.data.last_name,
                        "dept": json.data.department,
                        "eMail": json.data.email_addresses[0],
                        "verified": false,
                        "Token": `notGenerated`
                    }

                    console.log(` - added  ${userID} to ${guildID}`)

                    stats.numPeople++
                    if (json.data.department === `ENG/Systems Design`) {
                        stats.numInSYDE++ 
                    } else {
                        stats.numOutSYDE++ 
                    }           

                    this.saveData(guildID)
                } catch (error) {
                    console.log(error)
                    return 2
                }
              } else {
                console.log(` - ${userID} is not in database`)
                return 1
              }
          })
        return 0
    },

    assignToken: function(userID, guildID) {
        try {
            this.loadData(guildID)
        
            var token = crypto.randomBytes(Math.ceil(10/2)).toString('hex').slice(0,10)
            people[userID].verifToken = token
            
            console.log(` - assigned token to ${userID}`)

            this.saveData()
            return token
        } catch(err) {
            console.log(err)
            return false
        }
    },
    initDatabase: function(guildID) {
        console.log(`[INIT] ID: ${guildID}`)
        this.loadData(guildID)

        if (!stats.initialized) {
            stats.initialized = false
            fs.writeFileSync(`.data/people-${guildID}.json`, `{}`)
            fs.writeFileSync(`.data/stats-${guildID}.json`, `{"numPeople": 0, "numVerified": 0, "numInSYDE": 0, "numOutSYDE": 0, "initialized": true}`)
            console.log(`[INIT] Initialized ID: ${guildID}`)
            return
        }

        console.log(`[INIT] ${guildID} is already in database`)
    },

    loadData: function(guildID) {
        rawData = fs.readFileSync(`.data/people-${guildID}.json`)
        people = JSON.parse(rawData)

        rawData = fs.readFileSync(`.data/stats-${guildID}.json`)
        stats = JSON.parse(rawData)
        console.log(`[LOAD DATA] ${guildID}`)
    },

    saveData: function(guildID) {
        rawData = JSON.stringify(people, null, 4)
        fs.writeFileSync(`.data/people-${guildID}.json`, rawData)

        rawData = JSON.stringify(stats, null, 4)
        fs.writeFileSync(`.data/stats-${guildID}.json`, rawData)
        console.log(`[SAVE DATA] ${guildID}`)
    },
}