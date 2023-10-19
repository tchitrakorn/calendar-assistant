const express = require('express')
const { body, matchedData, validationResult } = require('express-validator')
const path = require('path')
const bodyParser = require('body-parser')
const itemController = require('./src/controllers/itemControllers')
const db = require('./src/database/queries')

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use('/public', express.static(path.join(__dirname, 'public')))

// Answers questions related to the user's current calendar
app.get('/track', body('prompt').notEmpty().escape(), (req, res) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) {
    const data = matchedData(req)
    const response = itemController.track(data.prompt)
    return res.send(response)
  }
  res.send({ errors: errors.array() })
})

// Creates, modifies, or deletes an event based on user requirements
app.post('/manage', body('prompt').notEmpty().escape(), (req, res) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) {
    const data = matchedData(req)
    const response = itemController.manage(data.prompt)
    return res.send(response)
  }
  res.send({ errors: errors.array() })
})

// Retrieves online information and personalized recommendations
app.get('/explore', body('prompt').notEmpty().escape(), (req, res) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) {
    const data = matchedData(req)
    const response = itemController.explore(data.prompt)
    return res.send(response)
  }
  res.send({ errors: errors.array() })
})

// Retrieves non-sensitive information from users’ conversation log for Google Analytics
app.get('/analytics', body('prompt').notEmpty().escape(), (req, res) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) {
    const data = matchedData(req)
    const response = itemController.getAnalytics(data.prompt)
    return res.send(response)
  }
  res.send({ errors: errors.array() })
})

// Retrieves user information
app.get('/data', body('prompt').notEmpty().escape(), (req, res) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) {
    const data = matchedData(req)
    const response = itemController.getUserData(data.prompt)
    return res.send(response)
  }
  res.send({ errors: errors.array() })
})

// Stores/manages user information
app.post('/data', body('prompt').notEmpty().escape(), (req, res) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) {
    const data = matchedData(req)
    const response = itemController.manageUserData(data.prompt)
    return res.send(response)
  }
  res.send({ errors: errors.array() })
})

// Stores user initial credentials (client ID, client secret, openAI key)
app.post(
  '/credentials',
  body(['email', 'clientId', 'clientSecret', 'openAIKey'])
    .notEmpty()
    .escape(),
  (req, res) => {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      const data = matchedData(req)
      const results = db
        .postUser(
          data.email,
          data.clientId,
          data.clientSecret,
          data.openAIKey
        )
        .then((resp) => resp)
        .catch((error) => error)
      return res.send(results)
    }
    res.send({ errors: errors.array() })
  }
)

// Stores user secondary credential (access token)
app.post(
  '/credentials/access-token',
  body(['email', 'accessToken']).notEmpty().escape(),
  (req, res) => {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      const data = matchedData(req)
      const results = db
        .postUserAccessToken(data.email, data.accessToken)
        .then((resp) => resp)
        .catch((error) => error)
      return res.send(results)
    }
    res.send({ errors: errors.array() })
  }
)

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})
