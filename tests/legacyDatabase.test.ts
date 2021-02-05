import { existsSync, mkdirSync, readFileSync, rmdirSync } from "fs"
import { LegacyDatabase } from "../src/legacyDatabase"
import assert from 'assert'


describe('Legacy Database', () => {
    let database: LegacyDatabase

    it('should save and load file data properly', () => {
        MockLegacyData.createDirectory()
        database = new LegacyDatabase('testGuild')

        // @ts-ignore
        database.users = MockLegacyData.mockUsers
        // @ts-ignore
        database.stats = MockLegacyData.mockStats
        
        database.save();

        assert.strictEqual(
            readFileSync(`.data/people-testGuild.json`).toString(),
            JSON.stringify(MockLegacyData.mockUsers, null, 4),
            "Users file not saved correctly"
        );
        assert.strictEqual(
            readFileSync(`.data/stats-testGuild.json`).toString(),
            JSON.stringify(MockLegacyData.mockStats, null, 4),
            "Stats file not saved correctly"
        );

        database = new LegacyDatabase('testGuild')

        database.load();

        // @ts-ignore
        assert.strictEqual(
            // @ts-ignore
            JSON.stringify(database.users), 
            JSON.stringify(MockLegacyData.mockUsers),
            "Users weren't loaded correctly")
        // @ts-ignore
        assert.strictEqual(
            // @ts-ignore
            JSON.stringify(database.stats), 
            JSON.stringify(MockLegacyData.mockStats), 
            "Stats weren't loaded correctly")

        MockLegacyData.clearDirectory();
    })
})


class MockLegacyData {
    static mockUsers = {
        'user.id': {
            fName: 'John',
            lName: 'Doe',
            uwID: 'jd25',
            discName: 'johndoe#0001',
            email: 'john.doe@example.com',
            dept: 'ENG/Systems Design',
            verification: null,
            token: '4j3h6kjb63'
        }
    }

    static mockStats = {
        'info': {
            'requests': 50,
            'numVerified': 1,
            'numGuests': 34,
        },
        'claimed': {
            'jd25': '759374395739473759'
        }
    }

    static createDirectory() {
        if (existsSync('.data')) return;
        mkdirSync('.data', {})
    }

    static clearDirectory() {
        rmdirSync(".data", { recursive: true })
    }
}