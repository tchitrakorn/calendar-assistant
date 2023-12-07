const dataModel = require('../models/dataModel')
const db = require('../database/queries')

jest.mock('../database/queries')

describe('Data Model', () => {
    describe('analyzeData', () => {
        it('should analyze data correctly', async () => {
            const mockOrgId = 123
            const mockEvents = [
                { email: 'user1@example.com', event_type: 'track' },
                { email: 'user1@example.com', event_type: 'manage' },
                { email: 'user2@example.com', event_type: 'freeSlots' },
            ]

            db.getUserEvents.mockResolvedValue(mockEvents)

            const analysis = await dataModel.analyzeData(mockOrgId)

            expect(db.getUserEvents).toHaveBeenCalledWith(mockOrgId)
            expect(analysis).toEqual({
                'user1@example.com': { track: 1, manage: 1, freeSlots: 0 },
                'user2@example.com': { track: 0, manage: 0, freeSlots: 1 },
            })
        })

        // Add more test cases for different scenarios
    })

    describe('readData', () => {
        it('should read user data', async () => {
            const email = 'test@example.com'
            const mockUserData = { email, name: 'Test User' }

            db.getUser.mockResolvedValue(mockUserData)

            const result = await dataModel.readData(email)

            expect(db.getUser).toHaveBeenCalledWith(email)
            expect(result).toEqual(mockUserData)
        })

        // Add more test cases if needed
    })

    describe('writeData', () => {
        it('should write user data', async () => {
            const email = 'test@example.com'
            const fieldsToUpdate = { name: 'Updated Name' }
            const mockResponse = { affectedRows: 1 }

            db.updateUser.mockResolvedValue(mockResponse)

            const result = await dataModel.writeData(email, fieldsToUpdate)

            expect(db.updateUser).toHaveBeenCalledWith(email, fieldsToUpdate)
            expect(result).toEqual(mockResponse)
        })

        // Add more test cases if needed
    })

    describe('deleteData', () => {
        it('should delete user data', async () => {
            const email = 'test@example.com'
            const mockResponse = { affectedRows: 1 }

            db.deleteUser.mockResolvedValue(mockResponse)

            const result = await dataModel.deleteData(email)

            expect(db.deleteUser).toHaveBeenCalledWith(email)
            expect(result).toEqual(mockResponse)
        })

        // Add more test cases if needed
    })
})
