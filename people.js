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
var verified
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

    addPerson: function(userID, guildID) {
        try {
            this.token = crypto.randomBytes(Math.ceil(10/2)).toString('hex').slice(0,10)
            console.log(` - assigned token to ${userID} for guild ${guildID}`)

            people[userID] = {
                "fName": this.fName,
                "lName": this.lName,
                "dept": this.dept,
                "email": this.email,
                "verified": this.verified,
                "token": this.token
            }

            console.log(` - added  ${userID} to ${guildID}`)

            stats.numPeople++
            if (dept === `ENG/Systems Design`) {
                stats.numInSYDE++ 
            } else {
                stats.numOutSYDE++ 
            }           

            return null
        } catch(err) {
            console.log(err) 
            return (`Failed while adding person to database :(`)
        }
    },

    loadData: function(guildID) {
        try {
            rawData = fs.readFileSync(`.data/people-${guildID}.json`)
            people = JSON.parse(rawData)

            rawData = fs.readFileSync(`.data/stats-${guildID}.json`)
            stats = JSON.parse(rawData)

            return 0
        }
        catch {
            fs.writeFileSync(`.data/people-${guildID}.json`, `{}`)
            fs.writeFileSync(`.data/stats-${guildID}.json`, `{"numPeople": 0, "numVerified": 0, "numInSYDE": 0, "numOutSYDE": 0}`)

            rawData = fs.readFileSync(`.data/people-${guildID}.json`)
            people = JSON.parse(rawData)

            rawData = fs.readFileSync(`.data/stats-${guildID}.json`)
            stats = JSON.parse(rawData)
        }
    },

    saveData: function(guildID) {
        try {
            rawData = JSON.stringify(people, null, 4)
            fs.writeFileSync(`.data/people-${guildID}.json`, rawData)

            rawData = JSON.stringify(stats, null, 4)
            fs.writeFileSync(`.data/stats-${guildID}.json`, rawData)

            return null

        } catch(err) {
            console.log(err)
            return "Error saving data!"
        }
    }
}