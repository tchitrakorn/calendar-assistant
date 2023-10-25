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
  res.status(500).send({ errors: errors.array() })
})

// Creates, modifies, or deletes an event based on user requirements
app.post('/manage', body('prompt').notEmpty().escape(), (req, res) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) {
    const data = matchedData(req)
    const response = itemController.manage(data.prompt)
    return res.send(response)
  }
  res.status(500).send({ errors: errors.array() })
})

// Retrieves online information and personalized recommendations
app.get('/explore', body('prompt').notEmpty().escape(), (req, res) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) {
    const data = matchedData(req)
    const response = itemController.explore(data.prompt)
    return res.send(response)
  }
  res.status(500).send({ errors: errors.array() })
})

// Retrieves non-sensitive information from users’ conversation log for Google Analytics
app.get('/analytics', body('prompt').notEmpty().escape(), (req, res) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) {
    const data = matchedData(req)
    const response = itemController.getAnalytics(data.prompt)
    return res.send(response)
  }
  res.status(500).send({ errors: errors.array() })
})

// Retrieves user information
app.get('/data', body('prompt').notEmpty().escape(), (req, res) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) {
    const data = matchedData(req)
    const response = itemController.getUserData(data.prompt)
    return res.send(response)
  }
  res.status(500).send({ errors: errors.array() })
})

// Stores/manages user information
app.post('/data', body('prompt').notEmpty().escape(), (req, res) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) {
    const data = matchedData(req)
    const response = itemController.manageUserData(data.prompt)
    return res.send(response)
  }
  res.status(500).send({ errors: errors.array() })
})

// Stores client's info and authenticate clients
app.post(
  '/authenticate',
  body(['email', 'clientId', 'clientSecret', 'openAIKey'])
    .notEmpty()
    .escape(),
  (req, res) => {
    const errors = validationResult(req)
    if (errors.isEmpty()) {
      const data = matchedData(req)
      return auth
        .authenticate(
          data.email,
          data.clientId,
          data.clientSecret,
          data.openAIKey
        )
        .then((resp) => res.send('Successfully stored your credentials!'))
        .catch((err) => res.status(500).send({ errors: err }))
    }
    res.status(500).send({ errors: errors.array() })
  }
)

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})
