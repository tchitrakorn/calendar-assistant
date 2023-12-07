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

        it('should handle Google API client creation failure', async () => {
            google.auth.fromJSON.mockRejectedValue(
                new Error('Client creation failed')
            )

            const response = await calendarModel.readCalendar(mockRequest)
            expect(google.auth.fromJSON).toHaveBeenCalled()
            expect(response).toEqual({
                success: false,
                message: 'An error occurred while running the calendar script.',
            })
        })

        it('should handle error from helpers.listEvents', async () => {
            // Mock listEvents to throw an error
            helpers.listEvents.mockRejectedValue(
                new Error('Error listing events')
            )

            const response = await calendarModel.readCalendar(mockRequest)

            // Assertions
            expect(helpers.listEvents).toHaveBeenCalledWith(
                mockClient,
                mockRequest
            )
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

        it('should handle delete event', async () => {
            const mockDeleteRequest = { ...mockRequest, type: 'delete' }
            helpers.deleteEvent.mockResolvedValue({ result: 'event deleted' })

            const response =
                await calendarModel.writeCalendar(mockDeleteRequest)

            expect(queries.getUser).toHaveBeenCalledWith(
                mockDeleteRequest.email
            )
            expect(helpers.deleteEvent).toHaveBeenCalledWith(
                mockClient,
                mockDeleteRequest
            )
            expect(response).toEqual({ result: 'event deleted' })
        })

        it('should handle update event', async () => {
            const mockUpdateRequest = { ...mockRequest, type: 'update' }
            helpers.updateEvent.mockResolvedValue({ result: 'event updated' })

            const response =
                await calendarModel.writeCalendar(mockUpdateRequest)

            expect(queries.getUser).toHaveBeenCalledWith(
                mockUpdateRequest.email
            )
            expect(helpers.updateEvent).toHaveBeenCalledWith(
                mockClient,
                mockUpdateRequest
            )
            expect(response).toEqual({ result: 'event updated' })
        })

        it('should handle user not found in writeCalendar', async () => {
            queries.getUser.mockResolvedValueOnce([])

            const response = await calendarModel.writeCalendar(mockWriteRequest)
            expect(response).toEqual({
                success: false,
                message: 'An error occurred while running the calendar script.',
            })
        })
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

        it('should handle invalid eventsResponse in findFreeSlots', async () => {
            helpers.listEvents.mockResolvedValue({})

            await expect(
                calendarModel.findFreeSlots(mockRequest)
            ).rejects.toThrow('Failed to retrieve calendar events')
            expect(helpers.listEvents).toHaveBeenCalledWith(
                mockClient,
                mockRequest
            )
        })

        it('should use default scope value if none provided', async () => {
            const mockRequestWithoutScope = { email: 'test@gmail.com' }
            helpers.listEvents.mockResolvedValue(mockEventsResponse)
            helpers.calculateFreeTime.mockReturnValue({ '2022-01-01': 2 })

            const response = await calendarModel.findFreeSlots(
                mockRequestWithoutScope
            )

            expect(helpers.calculateFreeTime).toHaveBeenCalledWith(
                mockEventsResponse.allEvents,
                7
            ) // Default scope
            expect(response.freeSlots).toBeDefined()
        })

        it('should handle error in calculateFreeTime', async () => {
            helpers.listEvents.mockResolvedValue(mockEventsResponse)
            helpers.calculateFreeTime.mockImplementation(() => {
                throw new Error('Error in calculateFreeTime')
            })

            await expect(
                calendarModel.findFreeSlots(mockRequest)
            ).rejects.toThrow('Error in calculateFreeTime')
        })

        // Add a test for 'failed to retrieve calendar events' scenario
    })
})
