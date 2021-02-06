/*
 * Goose Bot
 * Shivam Sh | https://github.com/shivam-sh
 * 
 * legacyDatabase.ts provides backwards compatibility for
 * the initial version of goose-bot where data is saved locally
 */

import { existsSync, readFileSync, writeFileSync } from 'fs'

interface User {
    fName: string
    lName: string
    uwID: string
    discName: string
    email: string
    dept: string
    verification?: string
    token: string
}

export class LegacyDatabase {
    private guildID: string

    private users: { [username: string]: User } = {}
    private stats?: JSON


    static exists(guildId: string): Boolean {
        const guildID = guildId
        const exists = existsSync(`.data/people-${guildID}.json`) && existsSync(`.data/stats-${guildID}.json`)
        return exists ? true : false
    }

    constructor(guildId: string) {
        this.guildID = guildId
    }

    public load() {
        try {
            this.users = JSON.parse(
                readFileSync(`.data/people-${this.guildID}.json`)
                    .toString()
            );

            this.stats = JSON.parse(
                readFileSync(`.data/stats-${this.guildID}.json`)
                    .toString()
            );

            return
        } catch {
            writeFileSync(
                `.data/people-${this.guildID}.json`, 
                `{}`
            );
            writeFileSync(
                `.data/stats-${this.guildID}.json`,
                `{}`
            );

            this.users = JSON.parse(
                readFileSync(`.data/people-${this.guildID}.json`)
                    .toString()
            );

            this.stats = JSON.parse(
                readFileSync(`.data/stats-${this.guildID}.json`)
                    .toString()
            );
        }
    }

    public save() {
        try {
            writeFileSync(`.data/people-${this.guildID}.json`,
                JSON.stringify(this.users, null, 4)
            );

            writeFileSync(`.data/stats-${this.guildID}.json`, 
			    JSON.stringify(this.stats, null, 4)
            );

			return
		} catch (err) {
			console.log("[ERROR] - Couldn't save data to filesystem!", err);
			return "Error saving data!";
		}
    }

    public migrateDB() {

    }
}