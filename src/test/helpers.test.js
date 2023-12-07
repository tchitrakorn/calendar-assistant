const helpers = require('../models/helpers')
const { google } = require('googleapis')

jest.mock('googleapis')

describe('Helpers', () => {
    const mockAuth = { auth: 'mockAuth' }
    google.calendar = jest.fn().mockReturnValue({
        events: {
            list: jest.fn(),
            insert: jest.fn(),
            delete: jest.fn(),
            update: jest.fn(),
            get: jest.fn(),
        },
    })

    describe('listEvents', () => {
        it('should list events', async () => {
            const mockParameters = { scope: 7 }
            const mockResponse = { data: { items: ['event1', 'event2'] } }
            google.calendar().events.list.mockResolvedValue(mockResponse)

            const result = await helpers.listEvents(mockAuth, mockParameters)

            expect(google.calendar().events.list).toHaveBeenCalledWith(
                expect.anything()
            )
            expect(result.allEvents).toEqual(mockResponse.data.items) // Modify the assertion here
        })

        // Add more test cases for different scenarios
    })

    describe('insertEvent', () => {
        it('should insert an event', async () => {
            // mock your parameters and expected response
            // write your test logic
        })

        // Add more test cases for different scenarios
    })

    describe('deleteEvent', () => {
        it('should delete an event', async () => {
            // mock your parameters and expected response
            // write your test logic
        })

        // Add more test cases for different scenarios
    })

    describe('updateEvent', () => {
        it('should update an event', async () => {
            // mock your parameters and expected response
            // write your test logic
        })

        // Add more test cases for different scenarios
    })

    describe('calculateFreeTime', () => {
        it('should calculate free time', () => {
            const events = [
                {
                    start: { dateTime: new Date().toISOString() },
                    end: { dateTime: new Date().toISOString() },
                },
            ]
            const scope = 7

            const result = helpers.calculateFreeTime(events, scope)

            expect(result).toBeInstanceOf(Object)
            // Add more assertions as needed
        })

        // Add more test cases for different scenarios
    })
})
