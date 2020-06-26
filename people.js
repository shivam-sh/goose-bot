const fs = require('fs')
const { finished } = require('stream')

var rawData
var people

module.exports = {

    loadData: function() {
        rawData = fs.readFileSync('.data/people.json')
        people = JSON.parse(rawData)
    },
    saveData: function() {
        console.log(people)
        rawData = JSON.stringify(people)
        fs.writeFileSync('.data/people.json', rawData)
    },
    logData: function() {
        rawData = fs.readFileSync('.data/people.json')
        people = JSON.parse(rawData)

        console.log(people)
    },
    isLogged: function(userID) {
        this.loadData()
        
    },
    isInSYDE: function(userID) {
        this.loadData()

        return (people.userID !== undefined) ? true : false
    },
    addPerson: function(userID, firstName, lastName, department) {
        this.loadData()
       
        people[userID] = {
            "fName": firstName,
            "lName": lastName,
            "dept": department,
            "verified": false,
            "verifToken": "addHere"
        }

        console.log(people)

        this.saveData()
    },
    viewPerson: function(userID, firstName, lastName, department) {
        
    },
    removePerson: function() {

    }
}