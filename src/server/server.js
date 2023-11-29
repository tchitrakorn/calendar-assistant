const cors = require('cors')
const express = require('express')
const {
  body,
  query,
  matchedData,
  validationResult
} = require('express-validator')
const path = require('path')
const bodyParser = require('body-parser')
const itemController = require('../controllers/itemControllers')
const auth = require('./auth')
const v = require('./validation.js')

const app = express()
app.use(cors())
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use('/public', express.static(path.join(__dirname, 'public')))

// Answers questions related to the user's current calendar
app.get('/track', [
  body('email').notEmpty().escape(),
 // body('type').notEmpty().escape()
], async (req, res) => {
  const expressValidatorErrors = validationResult(req)
  if (!expressValidatorErrors.isEmpty()) {
    return res.status(400).send({ errors: expressValidatorErrors.array() }) // 400 for bad input
  }
  const validationErrors = v.validateTrackRequest(req.body)
  if (validationErrors.length > 0) {
    return res.status(400).send({ errors: validationErrors }) // 400 for bad input
  }
  try {
    const response = await itemController.track(req.body)
    // Check if the response is what you expect, for example, not null or undefined
    if (response) {
      return res.send(response)
    } else {
      // Handle the case when response is not what you expect
      return res.status(500).send({ error: 'Unexpected response' })
    }
  } catch (error) {
    console.error(error)
    return res.status(500).send({ error: error.message }) // Internal Server Error for other cases
  }
})

// Creates, modifies, or deletes an event based on user requirements
app.post('/manage', [
  body('email').notEmpty().escape()
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() }) // 400 for bad input
  }
  const validationErrors = v.validateManageRequest(req.body)
  if (validationErrors.length > 0) {
    return res.status(400).send({ errors: validationErrors }) // 400 for bad input
  }
  try {
    const response = await itemController.manage(req.body)
    // Check if the response is what you expect, for example, not null or undefined
    if (response) {
      return res.send(response)
    } else {
      // Handle the case when response is not what you expect
      return res.status(500).send({ error: 'Unexpected response' })
    }
  } catch (error) {
    console.error(error)
    return res.status(500).send({ error: error.message }) // Internal Server Error for other cases
  }
})

// Retrieves online information and personalized recommendations
const findMatchingEvents = async (preferences, calendarEvents) => {
  const { location, interests, timeRange, maxResults } = preferences;

  // Fetch events from an external source or database based on preferences
  // This is a placeholder logic
  const allAvailableEvents = await fetchEventsFromSource(location, interests);

  // Filter out events that clash with the user's existing calendar
  const filteredEvents = allAvailableEvents.filter(event => {
    const eventStart = new Date(event.start);
    const eventEnd = new Date(event.end);

    // Check if the event falls within the user's preferred time range
    const isInTimeRange = eventStart >= new Date(timeRange.start) && eventEnd <= new Date(timeRange.end);

    // Check for clashes with existing events
    const hasNoClashes = !calendarEvents.some(calendarEvent => {
      const calendarEventStart = new Date(calendarEvent.start.dateTime);
      const calendarEventEnd = new Date(calendarEvent.end.dateTime);

      return (eventStart < calendarEventEnd && eventEnd > calendarEventStart);
    });

    return isInTimeRange && hasNoClashes;
  });

  // Return the filtered list, limited to the maxResults specified
  return filteredEvents.slice(0, maxResults);
};

const fetchEventsFromSource = async (location, interests) => {
  // Implement the logic to fetch events based on location and interests
  // Return an array of events
  // Placeholder implementation
  return [
    {
      event_id: "event101",
      name: "Jazz Music Festival",
      start: "2023-12-05T18:00:00",
      end: "2023-12-05T21:00:00",
      location: "Central Park, New York",
      description: "An evening of delightful jazz music.",
      interest: "music"
    },
    {
      event_id: "event102",
      name: "Art & Design Exhibition",
      start: "2023-12-06T10:00:00",
      end: "2023-12-06T17:00:00",
      location: "Modern Art Museum, New York",
      description: "Explore contemporary art and design.",
      interest: "art"
    },
    {
      event_id: "event103",
      name: "Technology Conference",
      start: "2023-12-07T09:00:00",
      end: "2023-12-07T15:00:00",
      location: "Tech Hub, New York",
      description: "A conference on the latest trends in technology.",
      interest: "technology"
    },
    // ... more events
  ];
};

app.get('/explore', [
  query('email').isEmail().normalizeEmail(),
  query('preferences').custom(v.validateExplorePreferences)
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() });
  }

  try {
    const userEmail = req.query.email;
    const preferences = JSON.parse(req.query.preferences);

    // Get calendar events using the track function
    const calendarEvents = await itemController.track({
      email: userEmail,
      // Add any other parameters needed for the track function
    });

    if (!calendarEvents) {
      return res.status(500).send({ error: 'Error fetching calendar events' });
    }

    // Find matching events based on preferences and calendar events
    const matchedEvents = await findMatchingEvents(preferences, calendarEvents);

    return res.send({ status: "success", events: matchedEvents });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: error.message });
  }
});



// Retrieves non-sensitive information from users’ conversation log for Google Analytics
app.get('/analytics', body('email').notEmpty().escape(), (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() }) // Bad input
  }
  try {
    const data = matchedData(req)
    return itemController.getAnalytics(data.email)
      .then((resp) => res.send(resp))
      .catch((err) => res.status(500).send({ errors: err }))
  } catch (error) {
    res.status(500).send({ errors: errors.array() }) // Internal server errors
  }
})

// Retrieves user information
app.get('/data', body('email').notEmpty().escape(), (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() }) // Bad input
  }
  try {
    const data = matchedData(req)
    return itemController.getUserData(data.email)
      .then((resp) => res.send(resp))
      .catch((err) => res.status(500).send({ errors: err }))
  } catch (error) {
    res.status(500).send({ errors: errors.array() }) // Internal server errors
  }
})

// Update client information
app.patch('/data', body('email').notEmpty().escape(), (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() }) // Bad input
  }
  try {
    const email = req.body.email
    delete req.body.email
    return itemController.manageUserData(email, req.body)
      .then(() => res.send('Successfully updated your data in our database!'))
      .catch((err) => res.status(500).send({ errors: err }))
  } catch (error) {
    res.status(500).send({ errors: errors.array() }) // Internal server errors
  }
})

// Delete client information
app.delete('/data', body('email').notEmpty().escape(), (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() }) // Bad input
  }
  try {
    const data = matchedData(req)
    return itemController.deleteUserData(data.email)
      .then(() => res.send('Successfully deleted your data from our database!'))
      .catch((err) => res.status(500).send({ errors: err }))
  } catch (error) {
    res.status(500).send({ errors: errors.array() }) // Internal server errors
  }
})

// Stores client's info and authenticate clients
app.post(
  '/authenticate',
  body(['email', 'clientId', 'clientSecret', 'openAIKey'])
    .notEmpty()
    .escape(),
  (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() }) // Bad input
    }
    try {
      const data = matchedData(req)
      return auth
        .authenticate(
          data.email,
          data.clientId,
          data.clientSecret,
          data.openAIKey
        )
        .then(() => res.send('Successfully stored your credentials!'))
        .catch((err) => res.status(500).send({ errors: err }))
    } catch (error) {
      res.status(500).send({ errors: errors.array() }) // Internal server errors
    }
  }
)

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})
