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
  body('email').notEmpty().escape()
], async (req, res) => {
  const expressValidatorErrors = validationResult(req)
  if (!expressValidatorErrors.isEmpty()) {
    return res.status(400).send({ errors: expressValidatorErrors.array() }) // 400 for bad input
  }
  const validationErrors = v.validateTrackRequest(req.body)
  if (validationErrors.lenght > 0) {
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
  body('email').notEmpty().escape(),
  body('prompt').notEmpty().escape(),
  body('city').notEmpty().escape()
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() }) // 400 for bad input
  }

  try {
    const data = matchedData(req)
    const response = await itemController.manage(data.email, data.prompt)
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
