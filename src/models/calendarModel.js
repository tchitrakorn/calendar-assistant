// Models for calendar-related tasks
const { PythonShell } = require('python-shell')
const queries = require('../database/queries')
const { authenticate } = require('@google-cloud/local-auth');
const { google } = require('googleapis');

const EVENT_COLOR_LABELS = {
    1: "Lavender",
    2: "Sage",
    3: "Grape",
    4: "Flamingo",
    5: "Banana",
    6: "Tangerine",
    7: "Peacock",
    8: "Graphite",
    9: "Blueberry",
    10: "Basil",
    11: "Tomato"
}

const listEvents = async (auth, parameters) => {
    const scope = parameters.scope || 7
    let groupBy = parameters.groupBy
    const analysis = parameters.analysis && true
    if (analysis == true && groupBy == null) {
        groupBy = 'event'
    }

    const calendar = google.calendar({ version: 'v3', auth });
    const newDate = new Date()
    newDate.setDate(new Date().getDate() + scope)

    const res = await calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        timeMax: newDate.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
    });

    const events = res.data.items;
    if (!events || events.length === 0) {
        return {
            allEvents: [],
            groupedByType: {},
            analysisByType: {}
        }
    }

    let formattedEvents = {}
    let analysisByType = {}
    let totalScheduledTime = 0

    if (groupBy != null) {
        for (let i = 0; i < events.length; i++) {
            const currEvent = events[i]
            const start = new Date(currEvent.start.dateTime) / 60000  // convert to minutes
            const end = new Date(currEvent.end.dateTime) / 60000
            const elapsedTime = end - start
            totalScheduledTime += elapsedTime
            if (groupBy == 'eventType') {
                if (currEvent.eventType in formattedEvents) {
                    formattedEvents[currEvent.eventType].push(currEvent)
                } else {
                    formattedEvents[currEvent.eventType] = [currEvent]
                }
                if (currEvent.eventType in analysisByType) {
                    analysisByType[currEvent.eventType].minutes += elapsedTime
                    analysisByType[currEvent.eventType].count += 1
                } else {
                    analysisByType[currEvent.eventType] = {}
                    analysisByType[currEvent.eventType].minutes = elapsedTime
                    analysisByType[currEvent.eventType].count = 1
                }
            } else if (groupBy == 'event') {
                if (currEvent.summary in formattedEvents) {
                    formattedEvents[currEvent.summary].push(currEvent)
                } else {
                    formattedEvents[currEvent.summary] = [currEvent]
                }
                if (currEvent.summary in analysisByType) {
                    analysisByType[currEvent.summary].minutes += elapsedTime
                    analysisByType[currEvent.summary].count += 1
                } else {
                    analysisByType[currEvent.summary] = {}
                    analysisByType[currEvent.summary].minutes = elapsedTime
                    analysisByType[currEvent.summary].count = 1
                }
            } else if (groupBy == 'color') {
                const colorLabel = EVENT_COLOR_LABELS[currEvent.colorId]
                if (colorLabel == undefined) {
                    continue
                }
                if (colorLabel in formattedEvents) {
                    formattedEvents[colorLabel].push(currEvent)
                } else {
                    formattedEvents[colorLabel] = [currEvent]
                }
                if (colorLabel in analysisByType) {
                    analysisByType[colorLabel].minutes += elapsedTime
                    analysisByType[colorLabel].count += 1
                } else {
                    analysisByType[colorLabel] = {}
                    analysisByType[colorLabel].minutes = elapsedTime
                    analysisByType[colorLabel].count = 1
                }
            }
        }

        for (const [type, analysis] of Object.entries(analysisByType)) {
            analysis.percentage = analysis.minutes / totalScheduledTime * 100
        }

    }

    const response = {}
    response.allEvents = events
    if (groupBy != null) {
        response.groupedByType = formattedEvents
        if (analysis) {
            response.analysisByType = analysisByType
        }
    }

    return response
}

const readCalendar = async (request) => {
    try {
        const userArray = await queries.getUser(request.email)
        // console.log('User data retrieved:', user);

        if (userArray.length === 0) {
            throw new Error('User not found')
        }
        const user = userArray[0]
        const { id, email: userEmail, client_id, client_secret, openai_key, access_token, refresh_token, city } = user
        const credentials = {
            type: 'authorized_user',
            client_id: client_id,
            client_secret: client_secret,
            refresh_token: refresh_token,
        }
        const client = await google.auth.fromJSON(credentials)
        return listEvents(client, request).catch(console.error);

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

        const { id, email: userEmail, client_id, client_secret, openai_key, access_token, refresh_token, city } = user
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

const writeCalendar = async (email, prompt, city) => {
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
