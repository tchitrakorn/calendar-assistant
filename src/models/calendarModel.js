// Models for calendar-related tasks
const { PythonShell } = require('python-shell')
const queries = require('../database/queries')
const helpers = require('./helpers')
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');

const readCalendar = async (request) => {
    try {
        const userArray = await queries.getUser(request.email)

        if (userArray.length === 0) {
            throw new Error('User not found')
        }
        const user = userArray[0]
        const { id, email: userEmail, org_id, client_id, client_secret, openai_key, access_token, refresh_token, city } = user
        const credentials = {
            type: 'authorized_user',
            client_id: client_id,
            client_secret: client_secret,
            refresh_token: refresh_token,
        }
        const client = await google.auth.fromJSON(credentials)
        return helpers.listEvents(client, request).catch(console.error);

    } catch (error) {
        console.error('An error occurred:', error)
        return {
            success: false,
            message: 'An error occurred while running the calendar script.'
        }
    }

}

const readCalendarDeprecated = async (email, prompt) => {
    try {
        const userArray = await queries.getUser(email)
        // console.log('User data retrieved:', user);

        if (userArray.length === 0) {
            throw new Error('User not found')
        }
        const user = userArray[0]

        const { id, email: userEmail, org_id, client_id, client_secret, openai_key, access_token, refresh_token, city } = user
        // console.log('Access Token:', access_token);  // Log the individual properties
        // console.log('Client ID:', client_id);

        const options = {
            mode: 'text',
            // pythonPath: '/Users/karenwang/.virtualenvs/calendar-assistant/bin/python',  this will be the python path on the server
            pythonOptions: ['-u'], // get print results in real-time
            scriptPath: 'python_scripts',
            args: [client_id, client_secret, access_token, refresh_token, openai_key, prompt]
        }

        // Execute the Python script and capture the output
        const scriptOutput = await new Promise((resolve, reject) => {
            const output = [];

            const pyshell = new PythonShell('get_events.py', options)

            // Collect script print output
            pyshell.on('message', function (message) {
                output.push(message)
            })

            // end the input stream and allow the process to exit
            pyshell.end(function (err) {
                if (err) {
                    reject(err)
                } else {
                    resolve(output)
                }
            })
        })

        // 'scriptOutput' will contain the full stdout text from the Python script.
        return scriptOutput // return it as the response
    } catch (error) {
        console.error('An error occurred:', error)
        return {
            success: false,
            message: 'An error occurred while running the calendar script.'
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

        const { id, email: userEmail, org_id, client_id, client_secret, openai_key, access_token, refresh_token, city: userCity } = user
        const credentials = {
            type: 'authorized_user',
            client_id: client_id,
            client_secret: client_secret,
            refresh_token: refresh_token,
        }
        const client = await google.auth.fromJSON(credentials)

        if (request.type == 'insert') {
            return helpers.insertEvent(client, request).catch(console.error);
        } else if (request.type == 'delete') {
            return helpers.deleteEvent(client, request).catch(console.error);
        } else if (request.type == 'update') {
            return helpers.updateEvent(client, request).catch(console.error);
        }

    } catch (error) {
        console.error('An error occurred:', error)
        return {
            success: false,
            message: 'An error occurred while running the calendar script.'
        }
    }
}

const writeCalendarDeprecated = async (email, prompt, city) => {
    try {
        const userArray = await queries.getUser(email)

        if (userArray.length === 0) {
            throw new Error('User not found')
        }
        const user = userArray[0]

        const { id, email: userEmail, client_id, client_secret, openai_key, access_token, refresh_token, city: userCity } = user

        const options = {
            mode: 'text',
            // pythonPath: '/Users/karenwang/.virtualenvs/calendar-assistant/bin/python',  this will be the python path on the server
            pythonOptions: ['-u'], // get print results in real-time
            scriptPath: 'python_scripts',
            args: [client_id, client_secret, access_token, refresh_token, openai_key, city, prompt]
        }

        // Execute the Python script and capture the output
        const scriptOutput = await new Promise((resolve, reject) => {
            const output = []

            const pyshell = new PythonShell('manage_events.py', options)

            // Collect script print output
            pyshell.on('message', function (message) {
                output.push(message)
            })

            // end the input stream and allow the process to exit
            pyshell.end(function (err) {
                if (err) {
                    reject(err)
                } else {
                    resolve(output)
                }
            })
        })

        // 'scriptOutput' will contain the full stdout text from the Python script.
        return scriptOutput // return it as the response
    } catch (error) {
        console.error('An error occurred:', error)
        return {
            success: false,
            message: 'An error occurred while running the calendar script.'
        }
    }
}

module.exports = {
    readCalendar,
    writeCalendar
}
