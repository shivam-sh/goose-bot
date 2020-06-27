// Helps parse .json from webserver
const fetch = require('node-fetch')

// Token generator
const crypto = require('crypto')

// File saving/loading
const fs = require(`fs`)

var rawData
var people
var stats

var fName
var lName
var dept
var email
var token


module.exports = {

    fName,
    lName,
    dept,
    email,
    token,
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

    lookup: function(userID) {
        console.log(` - looking up ${userID} in UW database`)

        var url = 'https://api.uwaterloo.ca/v2/directory/' + userID + '.json?key=' + process.env.API_KEY_V2

        fetch(url, { method: `Get` })
          .then(res => res.json())
          .then((json) => {
              console.log(` - requesting JSON for ${userID}`)
              if(json.meta.message === 'Request successful' ) {

                    fName = json.data.given_name
                    lName = json.data.last_name
                    dept = json.data.department
                    eMail = json.data.email_addresses[0]
                    verified = false
                    token = `notGenerated`

                console.log(` - fetched info for ${userID}`)       

                return 0
              } else {
                console.log(` - ${userID} doesn't return valid JSON`)   
                return 1
              }
          })

        return 2
    },

    addPerson: function(userID, guildID) {
        try {
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

            return 0
        } catch {
            return 1
        }
    },

    assignToken: function(userID) {

        var token = crypto.randomBytes(Math.ceil(10/2)).toString('hex').slice(0,10)
        people[userID].verifToken = token
            
        console.log(` - assigned token to ${userID} for guild ${guildID}`)

    },

    loadData: function(guildID) {
        console.log(`\n[LOAD DATA] ${guildID}`)
        try {
            rawData = fs.readFileSync(`.data/people-${guildID}.json`)
            people = JSON.parse(rawData)

            rawData = fs.readFileSync(`.data/stats-${guildID}.json`)
            stats = JSON.parse(rawData)
            console.log(`[\\LOAD DATA] Loaded ${guildID}`)
        }
        catch {
            fs.writeFileSync(`.data/people-${guildID}.json`, `{}`)
            fs.writeFileSync(`.data/stats-${guildID}.json`, `{"numPeople": 0, "numVerified": 0, "numInSYDE": 0, "numOutSYDE": 0}`)

            rawData = fs.readFileSync(`.data/people-${guildID}.json`)
            people = JSON.parse(rawData)

            rawData = fs.readFileSync(`.data/stats-${guildID}.json`)
            stats = JSON.parse(rawData)

            console.log(`[\\LOAD DATA] New Guild! Initialized ${guildID}`)
        }
    },

    saveData: function(guildID) {
        console.log(`[SAVE DATA] ${guildID}`)
        rawData = JSON.stringify(people, null, 4)
        fs.writeFileSync(`.data/people-${guildID}.json`, rawData)

        rawData = JSON.stringify(stats, null, 4)
        fs.writeFileSync(`.data/stats-${guildID}.json`, rawData)
        console.log(`[\\SAVE DATA] Saved ${guildID}\n`)
    }
}