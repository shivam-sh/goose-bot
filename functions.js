// Preset variables
const vars = require("./setup.json");

// Token generator
const crypto = require("crypto");

// Helps parse .json from webserver
const fetch = require('node-fetch')

// Email setup to send verification codes
const nodemailer = require("nodemailer");
const mailAccount = nodemailer.createTransport({
  host: vars.host,
  port: vars.port,
  secure: false, // true for 465, false for other ports
  auth: {
    user: vars.email, // generated ethereal user
    pass: vars.emailPass, // generated ethereal password
  },
});

// File saving/loading
const fs = require(`fs`);

var rawData;
var people;
var stats;

module.exports = {

    logData: function (guildID) {
        this.loadData(guildID);

        console.log(people);
    },

    isLogged: function (userID, guildID) {
        this.loadData(guildID);

        if (people[userID] !== undefined) {
        return true;
        }

        return false;
    },

    verify: function (msg, args) {
        let guild = msg.guild.id;
        let url = `https://api.uwaterloo.ca/v2/directory/${args[0]}.json?key=${vars.UWApiKey}`;

        fetch(url, { method: "Get" })
            .then((res) => res.json())
            .then((json, reject) => {
                if (json.meta.message !== "Request successful") {
                    console.log(url)
                    reject(`Doesn't look like you're in UW's database! This is likely due to an incorrect UserID, try again. \nIf you think this is a mistake use @Admin!`)
                } else {
                    this.loadData(guild)

                    people[args[0]] = {
                        fName: json.data.given_name,
                        lName: json.data.last_name,
                        discord: `${msg.author.username}#${msg.author.discriminator}`,
                        dept: json.data.department,
                        email: json.data.email_addresses,
                        verified: this.verified,
                        token: crypto.randomBytes(Math.ceil(10 / 2)).toString("hex").slice(0, 10),
                    };

                    msg.channel.send(`Great! I added ${args[0]} to my database.`)

                    stats.numPeople++;
                    if (json.data.department === `ENG/Systems Design`) {
                    } else {
                        reject("You're not in SYDE! An admin can grant you access to the server if you have a valid reason")
                    }

                    return people[args[0]]
                }
            })
            .catch((err) => {
                console.log("- " + err + args[0])
                msg.channel.send(err)
            })
            .then((user) => {
                mailAccount.sendMail({
                    from: `"Goose Bot 👻" <${vars.email}>`, // sender address
                    to: user.email[0], // list of receivers
                    subject: "UW SYDE '25 Verification ✔", // Subject line
                    text: `TOKEN: ${user.token}`, // plain text body
                    html: `<b>HONK</b></br>
                            Hey! Your verification token is: ${user.token}</br>
                            You can verify yourself by entering: </br>
                            <b>\`~verify ${user.token}\`</b>!
                            </br></br>
                            Also! If you have time reply to this email with something random to prevent this account from being flagged as spam.`, // html body
                });

                msg.channel.send(  `I emailed you a verification token! \nVerify your identity by entering \`~confirm [TOKEN]\``)
            })
            .catch((err) => {
                console.log(err)
                msg.channel.send('Error sending email! An <@&694339748528914472> will send your verification token to you')
            })
            .then(() => {
                this.saveData(guild)
            })
            .catch((err) => {
                console.log(err)
                msg.channel.send('Error saving database! <@&694339748528914472>!!')
            })
    },

    confirm: function(msg, args) {

    },

    loadData: function (guildID) {
        try {
        rawData = fs.readFileSync(`.data/people-${guildID}.json`);
        people = JSON.parse(rawData);

        rawData = fs.readFileSync(`.data/stats-${guildID}.json`);
        stats = JSON.parse(rawData);

        return 0;
        } catch {
        fs.writeFileSync(`.data/people-${guildID}.json`, `{}`);
        fs.writeFileSync(
            `.data/stats-${guildID}.json`,
            `{"numPeople": 0, "numVerified": 0, "numInSYDE": 0, "numOutSYDE": 0}`
        );

        rawData = fs.readFileSync(`.data/people-${guildID}.json`);
        people = JSON.parse(rawData);

        rawData = fs.readFileSync(`.data/stats-${guildID}.json`);
        stats = JSON.parse(rawData);
        }
    },

    saveData: function (guildID) {
        try {
        rawData = JSON.stringify(people, null, 4);
        fs.writeFileSync(`.data/people-${guildID}.json`, rawData);

        rawData = JSON.stringify(stats, null, 4);
        fs.writeFileSync(`.data/stats-${guildID}.json`, rawData);

        return null;
        } catch (err) {
        console.log(err);
        return "Error saving data!";
        }
    },
};
