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

        it('should return empty array if no events', async () => {
            google
                .calendar()
                .events.list.mockResolvedValue({ data: { items: [] } })

            const result = await helpers.listEvents(mockAuth, { scope: 7 })

            expect(result.allEvents).toEqual([])
            expect(result.groupedByType).toEqual({})
            expect(result.analysisByType).toEqual({})
        })

        it('should group events by event type', async () => {
            const mockResponse = {
                data: {
                    items: [
                        {
                            eventType: 'meeting',
                            start: { dateTime: '2022-01-01T09:00:00' },
                            end: { dateTime: '2022-01-01T10:00:00' },
                        },
                        {
                            eventType: 'workshop',
                            start: { dateTime: '2022-01-01T11:00:00' },
                            end: { dateTime: '2022-01-01T12:00:00' },
                        },
                    ],
                },
            }
            google.calendar().events.list.mockResolvedValue(mockResponse)

            const result = await helpers.listEvents(mockAuth, {
                scope: 7,
                groupBy: 'eventType',
            })

            expect(result.groupedByType).toHaveProperty('meeting')
            expect(result.groupedByType).toHaveProperty('workshop')
        })

        it('should group events by color', async () => {
            const mockResponse = {
                data: {
                    items: [
                        {
                            colorId: '1',
                            start: { dateTime: '2022-01-01T09:00:00' },
                            end: { dateTime: '2022-01-01T10:00:00' },
                        },
                        {
                            colorId: '2',
                            start: { dateTime: '2022-01-01T11:00:00' },
                            end: { dateTime: '2022-01-01T12:00:00' },
                        },
                    ],
                },
            }
            google.calendar().events.list.mockResolvedValue(mockResponse)

            const result = await helpers.listEvents(mockAuth, {
                scope: 7,
                groupBy: 'color',
            })

            expect(result.groupedByType).toHaveProperty('Lavender')
            expect(result.groupedByType).toHaveProperty('Sage')
        })
    })

    describe('insertEvent', () => {
        it('should insert an event', async () => {
            const mockAuth = { auth: 'mockAuth' }
            const mockParameters = {
                startTime: '2022-01-01T09:00:00',
                endTime: '2022-01-01T10:00:00',
                timezone: 'America/New_York',
                summary: 'Test Event',
                location: 'Test Location',
                description: 'Test Description',
            }
            const mockResponse = { data: { eventId: 'mockEventId' } }

            const mockCalendar = {
                events: {
                    insert: jest.fn().mockResolvedValue(mockResponse),
                },
            }
            google.calendar = jest.fn().mockReturnValue(mockCalendar)

            const result = await helpers.insertEvent(mockAuth, mockParameters)

            expect(google.calendar).toHaveBeenCalledWith({
                version: 'v3',
                auth: mockAuth,
            })
            expect(mockCalendar.events.insert).toHaveBeenCalledWith({
                calendarId: 'primary',
                resource: {
                    start: {
                        dateTime: new Date(mockParameters.startTime),
                        timezone: mockParameters.timezone,
                    },
                    end: {
                        dateTime: new Date(mockParameters.endTime),
                        timezone: mockParameters.timezone,
                    },
                    summary: mockParameters.summary,
                    location: mockParameters.location,
                    description: mockParameters.description,
                },
            })
            expect(result).toEqual({
                type: 'insert',
                eventDetails: mockResponse.data,
            })
        })

        it('should insert an event with optional fields omitted', async () => {
            const mockParameters = {
                startTime: '2022-01-01T09:00:00',
                endTime: '2022-01-01T10:00:00',
                timezone: 'America/New_York',
            }
            const mockResponse = { data: { eventId: 'mockEventId' } }

            google.calendar().events.insert.mockResolvedValue(mockResponse)

            const result = await helpers.insertEvent(mockAuth, mockParameters)

            expect(result.eventDetails).toEqual(mockResponse.data)
        })

        it('should handle errors in event insertion', async () => {
            const mockParameters = {
                startTime: '2022-01-01T09:00:00',
                endTime: '2022-01-01T10:00:00',
                timezone: 'America/New_York',
            }
            google
                .calendar()
                .events.insert.mockRejectedValue(new Error('Insertion failed'))

            await expect(
                helpers.insertEvent(mockAuth, mockParameters)
            ).rejects.toThrow('Insertion failed')
        })
    })

    describe('deleteEvent', () => {
        it('should delete an event', async () => {
            const mockParameters = { eventId: 'mockEventId' }
            const mockGetResponse = { data: { someEventData: {} } }
            const mockDeleteResponse = {}

            const mockCalendar = {
                events: {
                    get: jest.fn().mockResolvedValue(mockGetResponse),
                    delete: jest.fn().mockResolvedValue(mockDeleteResponse),
                },
            }
            google.calendar = jest.fn().mockReturnValue(mockCalendar)

            const result = await helpers.deleteEvent(mockAuth, mockParameters)

            expect(google.calendar).toHaveBeenCalledWith({
                version: 'v3',
                auth: mockAuth,
            })
            expect(mockCalendar.events.get).toHaveBeenCalledWith({
                calendarId: 'primary',
                eventId: mockParameters.eventId,
            })
            expect(mockCalendar.events.delete).toHaveBeenCalledWith({
                calendarId: 'primary',
                eventId: mockParameters.eventId,
            })
            expect(result.eventDetails).toEqual(mockGetResponse.data)
        })

        it('should handle errors when deleting an event', async () => {
            const mockError = new Error('Error fetching event')
            google.calendar().events.get.mockRejectedValue(mockError)

            await expect(
                helpers.deleteEvent(mockAuth, { eventId: 'mockEventId' })
            ).rejects.toThrow('Error fetching event')
        })
    })

    describe('updateEvent', () => {
        it('should update an event with all fields', async () => {
            const mockParameters = {
                eventId: 'mockEventId',
                summary: 'Updated Summary',
                location: 'New Location',
                description: 'Updated Description',
                startTime: '2022-01-01T11:00:00',
                endTime: '2022-01-01T12:00:00',
                timezone: 'America/New_York',
            }
            const mockGetResponse = {
                data: {
                    summary: 'Old Summary',
                    location: 'Old Location',
                    description: 'Old Description',
                    start: { dateTime: '2022-01-01T09:00:00' },
                    end: { dateTime: '2022-01-01T10:00:00' },
                },
            }
            const mockUpdateResponse = {
                data: { updatedEventId: 'mockEventId' },
            }

            const mockCalendar = {
                events: {
                    get: jest.fn().mockResolvedValue(mockGetResponse),
                    update: jest.fn().mockResolvedValue(mockUpdateResponse),
                },
            }
            google.calendar = jest.fn().mockReturnValue(mockCalendar)

            const result = await helpers.updateEvent(mockAuth, mockParameters)

            expect(result.eventDetails).toEqual(mockUpdateResponse.data)
        })

        it('should update an event with partial fields', async () => {
            const mockParameters = {
                eventId: 'mockEventId',
                summary: 'Updated Summary',
            }
            const mockGetResponse = {
                data: {
                    summary: 'Old Summary',
                    location: 'Old Location',
                    description: 'Old Description',
                    start: { dateTime: '2022-01-01T09:00:00' },
                    end: { dateTime: '2022-01-01T10:00:00' },
                },
            }
            const mockUpdateResponse = {
                data: { updatedEventId: 'mockEventId' },
            }

            google.calendar().events.get.mockResolvedValue(mockGetResponse)
            google
                .calendar()
                .events.update.mockResolvedValue(mockUpdateResponse)

            const result = await helpers.updateEvent(mockAuth, mockParameters)

            expect(mockUpdateResponse.data).toEqual(result.eventDetails)
        })
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

        it('should calculate free time correctly with overlapping events', () => {
            const events = [
                {
                    start: { dateTime: '2022-01-01T09:00:00' },
                    end: { dateTime: '2022-01-01T11:00:00' },
                },
                {
                    start: { dateTime: '2022-01-01T10:30:00' },
                    end: { dateTime: '2022-01-01T12:00:00' },
                },
            ]

            const result = helpers.calculateFreeTime(events, 1)

            expect(result['2022-01-01']).toBeLessThan(16)
        })
    })
})
