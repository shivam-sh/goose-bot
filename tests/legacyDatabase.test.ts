import { existsSync, mkdirSync, readFileSync, rmdirSync } from "fs"
import { LegacyDatabase } from "../src/legacyDatabase"


describe('Legacy Database', () => {
    let database: LegacyDatabase

    beforeAll(() => {
        return MockLegacyData.createDirectory();
    })

    beforeEach(() => {
        return database = new LegacyDatabase('testGuild')
    })

    it('should save file data properly', () => {
        // @ts-ignore
        database.users = MockLegacyData.mockUsers
        // @ts-ignore
        database.stats = MockLegacyData.mockStats
        
        database.save();

        expect(readFileSync(`.data/people-testGuild.json`).toString())
            .toEqual(JSON.stringify(MockLegacyData.mockUsers, null, 4))

        expect(readFileSync(`.data/stats-testGuild.json`).toString())
            .toEqual(JSON.stringify(MockLegacyData.mockStats, null, 4))
    })

    it('should load file data properly', () => {
        database.load();

        // @ts-ignore
        expect(JSON.stringify(database.users))
            .toEqual(JSON.stringify(MockLegacyData.mockUsers))

        // @ts-ignore
        expect(JSON.stringify(database.stats))
            .toEqual(JSON.stringify(MockLegacyData.mockStats))
    })

    afterAll(() => {
        return MockLegacyData.clearDirectory();
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