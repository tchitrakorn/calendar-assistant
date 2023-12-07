const calendarModel = require('../models/calendarModel')
const queries = require('../database/queries')
const helpers = require('../models/helpers')
const { google } = require('googleapis')

jest.mock('../database/queries')
jest.mock('../models/helpers')
jest.mock('googleapis')

describe('Calendar Model', () => {
    const mockUser = {
        id: 1,
        email: 'test@gmail.com',
        org_id: 123,
        client_id: 'client_id',
        client_secret: 'client_secret',
        openai_key: 'openai_key',
        access_token: 'access_token',
        refresh_token: 'refresh_token',
        city: 'city',
    }
    const mockRequest = { email: 'test@gmail.com' }
    const mockClient = { auth: 'mockClient' }
    const mockEventsResponse = { allEvents: [] }

    beforeEach(() => {
        queries.getUser.mockResolvedValue([mockUser])
        google.auth.fromJSON.mockResolvedValue(mockClient)
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    describe('readCalendar', () => {
        it('should return events for a valid request', async () => {
            helpers.listEvents.mockResolvedValue(mockEventsResponse)

            const response = await calendarModel.readCalendar(mockRequest)

            expect(queries.getUser).toHaveBeenCalledWith(mockRequest.email)
            expect(helpers.listEvents).toHaveBeenCalledWith(
                mockClient,
                mockRequest
            )
            expect(response).toEqual(mockEventsResponse)
        })

        it('should handle user not found', async () => {
            queries.getUser.mockResolvedValueOnce([])

            const response = await calendarModel.readCalendar(mockRequest)
            expect(response).toEqual({
                success: false,
                message: 'An error occurred while running the calendar script.',
            })
        })
    })

    describe('writeCalendar', () => {
        const mockWriteRequest = { ...mockRequest, type: 'insert' }

        it('should handle insert event', async () => {
            helpers.insertEvent.mockResolvedValue({ result: 'event inserted' })

            const response = await calendarModel.writeCalendar(mockWriteRequest)

            expect(queries.getUser).toHaveBeenCalledWith(mockWriteRequest.email)
            expect(helpers.insertEvent).toHaveBeenCalledWith(
                mockClient,
                mockWriteRequest
            )
            expect(response).toEqual({ result: 'event inserted' })
        })

        // Add tests for 'delete' and 'update' cases
        // Add a test for 'user not found' scenario
    })

    describe('findFreeSlots', () => {
        it('should find free slots', async () => {
            helpers.listEvents.mockResolvedValue(mockEventsResponse)
            helpers.calculateFreeTime.mockReturnValue({ '2022-01-01': 2 })

            const response = await calendarModel.findFreeSlots(mockRequest)

            expect(queries.getUser).toHaveBeenCalledWith(mockRequest.email)
            expect(helpers.listEvents).toHaveBeenCalledWith(
                mockClient,
                mockRequest
            )
            expect(response).toHaveProperty('freeSlots')
        })

        it('should handle user not found', async () => {
            queries.getUser.mockResolvedValueOnce([])

            await expect(
                calendarModel.findFreeSlots(mockRequest)
            ).rejects.toThrow('User not found')
        })

        // Add a test for 'failed to retrieve calendar events' scenario
    })
})
