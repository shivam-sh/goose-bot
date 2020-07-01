# Goose Bot

## Introduction
Goose bot is a Node.js based discord bot designed to manage the University of Waterloo Systems Design Eng. '25 Discord server

The main feature of the bot is its integration with UW's LDAP to provide a verification system to confirm the identities of any new members

## Commands
### General Commands
```
~verify [UW-USERNAME]			// Starts the verification process and links the discord to the UW account
~confirm [VERIFICATION-TOKEN]		// Confirms the identity of the discord user
~help					// Provides information about available commands
```


### Admin Commands
```
~forceVerify [UW-USERNAME] [?ROLE]	// Verifies the specified user without linking a UW account
~addGuest [@USER]			// Assigns the guest role to the specified user
~lookupUser [UW-USERNAME]		// Searches the UW LDAP for the specified user
```


## Setup
The bot should be ready to go after you drop in your own variables into a setup.json file and adding "Verified" and "Guest" roles to your discord server
