// Models for calendar-related tasks
const { PythonShell } = require('python-shell')
const queries = require('../database/queries')
const helpers = require('./helpers')
const { authenticate } = require('@google-cloud/local-auth')
const { google } = require('googleapis')

const readCalendar = async (request) => {
    try {
        const userArray = await queries.getUser(request.email)

        if (userArray.length === 0) {
            throw new Error('User not found')
        }
        const user = userArray[0]
        const {
            id,
            email: userEmail,
            org_id,
            client_id,
            client_secret,
            openai_key,
            access_token,
            refresh_token,
            city,
        } = user
        const credentials = {
            type: 'authorized_user',
            client_id,
            client_secret,
            refresh_token,
        }
        const client = await google.auth.fromJSON(credentials)
        return helpers.listEvents(client, request).catch(console.error)
    } catch (error) {
        console.error('An error occurred:', error)
        return {
            success: false,
            message: 'An error occurred while running the calendar script.',
        }
    }
}

const writeCalendar = async (request) => {
    try {
        const userArray = await queries.getUser(request.email)

        if (userArray.length === 0) {
            throw new Error('User not found')
        }
        const user = userArray[0]

        const {
            id,
            email: userEmail,
            org_id,
            client_id,
            client_secret,
            openai_key,
            access_token,
            refresh_token,
            city: userCity,
        } = user
        const credentials = {
            type: 'authorized_user',
            client_id,
            client_secret,
            refresh_token,
        }
        const client = await google.auth.fromJSON(credentials)

        if (request.type == 'insert') {
            return helpers.insertEvent(client, request).catch(console.error)
        } else if (request.type == 'delete') {
            return helpers.deleteEvent(client, request).catch(console.error)
        } else if (request.type == 'update') {
            return helpers.updateEvent(client, request).catch(console.error)
        }
    } catch (error) {
        console.error('An error occurred:', error)
        return {
            success: false,
            message: 'An error occurred while running the calendar script.',
        }
    }
}

const findFreeSlots = async (request) => {
    try {
        // Retrieve user data from the database
        const userArray = await queries.getUser(request.email)

        if (userArray.length === 0) {
            throw new Error('User not found')
        }

        const user = userArray[0]
        const { client_id, client_secret, refresh_token } = user

        // Set up credentials for Google API
        const credentials = {
            type: 'authorized_user',
            client_id,
            client_secret,
            refresh_token,
        }

        // Authenticate with Google
        const client = await google.auth.fromJSON(credentials)

        // Get calendar events using the authenticated client
        const eventsResponse = await helpers.listEvents(client, request)
        if (!eventsResponse || !eventsResponse.allEvents) {
            throw new Error('Failed to retrieve calendar events')
        }

        const scope = request.scope || 7 // default to 20 if no scope is provided

        // Calculate free time slots
        const freeTimeSlots = helpers.calculateFreeTime(
            eventsResponse.allEvents,
            scope
        )

        // Convert freeTimeSlots object into an array and sort it
        const freeSlots = Object.keys(freeTimeSlots).map((date) => ({
            date,
            freeTime: freeTimeSlots[date],
        }))

        // Sort the array based on freeTime, from most to least
        freeSlots.sort((a, b) => b.freeTime - a.freeTime)

        // Convert freeTime back to a string with 'hours' for readability
        freeSlots.forEach((slot) => (slot.freeTime = `${slot.freeTime} hours`))

        return { freeSlots }
    } catch (error) {
        console.error('An error occurred in findFreeSlots:', error)
        throw error // Rethrow the error to be handled by the caller
    }
}

module.exports = {
    readCalendar,
    writeCalendar,
    findFreeSlots,
}
