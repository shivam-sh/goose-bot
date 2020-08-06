# Goose Bot

## Introduction
Goose bot is a Node.js based discord bot designed to manage the University of Waterloo Systems Design Eng. '25 Discord server

The main feature of the bot is its integration with UW's LDAP to provide a verification system to confirm the identities of any new members

## Commands
### Verification Commands
```
~verify [UW-USERNAME]			// Starts the verification process and links the discord to the UW account
~confirm [VERIFICATION-TOKEN]		// Confirms the identity of the discord user
~help					// Provides information about available commands
```

### General Commands
```
~role [ROLE-NAME]           // Assigns the mentioned role to the user or removes it if already assigned
~addToChat [@USER]                  // Gives the mentioned user permission to view the channel the command is sent in
```


### Admin Commands
```
~forceVerify [UW-USERNAME] [?ROLE]	// Verifies the specified user without linking a UW account
~linkUser [@USER] [UW-USERNAME]         // Links the specified discord to the given UW account
~addGuest [@USER]			// Assigns the guest role to the specified user
~lookupUser [UW-USERNAME]		// Searches the UW LDAP for the specified user
```


## Setup
The bot should be ready to go after you drop in your own variables into a .env file and adding "Verified" and "Guest" roles to your discord server
