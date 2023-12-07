const { authenticate } = require('@google-cloud/local-auth')
const { google } = require('googleapis')

const EVENT_COLOR_LABELS = {
  1: 'Lavender',
  2: 'Sage',
  3: 'Grape',
  4: 'Flamingo',
  5: 'Banana',
  6: 'Tangerine',
  7: 'Peacock',
  8: 'Graphite',
  9: 'Blueberry',
  10: 'Basil',
  11: 'Tomato'
}

const listEvents = async (auth, parameters) => {
  const scope = parameters.scope || 7
  let groupBy = parameters.groupBy
  const analysis = parameters.analysis && true
  if (analysis === true && groupBy == null) {
    groupBy = 'event'
  }

  const calendar = google.calendar({ version: 'v3', auth })
  const newDate = new Date()
  newDate.setDate(new Date().getDate() + scope)

  const res = await calendar.events.list({
    calendarId: 'primary',
    timeMin: new Date().toISOString(),
    timeMax: newDate.toISOString(),
    singleEvents: true,
    orderBy: 'startTime'
  })

  const events = res.data.items
  if (!events || events.length === 0) {
    return {
      allEvents: [],
      groupedByType: {},
      analysisByType: {}
    }
  }

  const formattedEvents = {}
  const analysisByType = {}
  let totalScheduledTime = 0

  if (groupBy != null) {
    for (let i = 0; i < events.length; i++) {
      const currEvent = events[i]
      const start = new Date(currEvent.start.dateTime) / 60000 // convert to minutes
      const end = new Date(currEvent.end.dateTime) / 60000
      const elapsedTime = end - start
      totalScheduledTime += elapsedTime
      if (groupBy === 'eventType') {
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
      } else if (groupBy === 'event') {
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
      } else if (groupBy === 'color') {
        const colorLabel = EVENT_COLOR_LABELS[currEvent.colorId]
        if (colorLabel === undefined) {
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
      analysis.percentage = (analysis.minutes / totalScheduledTime) * 100
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

const insertEvent = async (auth, parameters) => {
  const calendar = google.calendar({ version: 'v3', auth })
  const event = {
    start: {
      dateTime: new Date(parameters.startTime),
      timezone: parameters.timezone
    },
    end: {
      dateTime: new Date(parameters.endTime),
      timezone: parameters.timezone
    }
  }
  if (parameters.summary) {
    event.summary = parameters.summary
  }
  if (parameters.location) {
    event.location = parameters.location
  }
  if (parameters.description) {
    event.description = parameters.description
  }

  const res = await calendar.events.insert({
    calendarId: 'primary',
    resource: event
  })

  const response = {
    type: 'insert',
    eventDetails: res.data
  }

  return response
}

const deleteEvent = async (auth, parameters) => {
  const calendar = google.calendar({ version: 'v3', auth })

  const getRes = await calendar.events.get({
    calendarId: 'primary',
    eventId: parameters.eventId
  })

  const deleteRes = await calendar.events.delete({
    calendarId: 'primary',
    eventId: parameters.eventId
  })

  const response = {
    type: 'delete',
    eventDetails: getRes.data
  }

  return response
}

const updateEvent = async (auth, parameters) => {
  const calendar = google.calendar({ version: 'v3', auth })

  const getRes = await calendar.events.get({
    calendarId: 'primary',
    eventId: parameters.eventId
  })

  const event = {}

  event.summary = parameters.summary
    ? parameters.summary
    : getRes.data.summary
  event.location = parameters.location
    ? parameters.location
    : getRes.data.location
  event.description = parameters.description
    ? parameters.description
    : getRes.data.description
  if (parameters.start) {
    event.start = {
      dateTime: new Date(parameters.startTime),
      timezone: parameters.timezone
    }
  } else {
    event.start = getRes.data.start
  }
  if (parameters.end) {
    event.end = {
      dateTime: new Date(parameters.endTime),
      timezone: parameters.timezone
    }
  } else {
    event.end = getRes.data.end
  }

  const res = await calendar.events.update({
    calendarId: 'primary',
    eventId: parameters.eventId,
    resource: event
  })

  const response = {
    type: 'update',
    eventDetails: res.data
  }

  return response
}

/**
 * Calculate the free time available each day based on calendar events.
 * @param {Array} events Array of calendar event objects.
 * @return {Object} Object containing free time per day.
 */
const calculateFreeTime = (events, scope) => {
  const hoursInDay = 16 // assuming 16 hours of waking time per day
  const freeTimeByDay = {}

  // Initialize every day in the scope with the maximum free hours
  for (let i = 0; i < scope; i++) {
    const date = new Date()
    date.setDate(date.getDate() + i)
    const dateKey = date.toISOString().split('T')[0] // format as 'YYYY-MM-DD'
    freeTimeByDay[dateKey] = hoursInDay
  }

  events.forEach((event) => {
    const startDate = new Date(event.start.dateTime)
    const endDate = new Date(event.end.dateTime)
    const dateKey = startDate.toISOString().split('T')[0] // format as 'YYYY-MM-DD'

    const durationHours = (endDate - startDate) / (1000 * 60 * 60) // event duration in hours

    if (!freeTimeByDay[dateKey]) {
      freeTimeByDay[dateKey] = hoursInDay // initialize with total available hours
    }
    freeTimeByDay[dateKey] -= durationHours // subtract event duration
  })

  return freeTimeByDay
}

module.exports = {
  listEvents,
  insertEvent,
  deleteEvent,
  updateEvent,
  calculateFreeTime
}
