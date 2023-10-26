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
app.get('/track', [
  body('email').notEmpty().escape(),
  body('prompt').notEmpty().escape()
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).send({ errors: errors.array() }) // 400 for bad input
  }

  try {
    const data = matchedData(req)
    const response = await itemController.track(data.email, data.prompt)
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
app.get('/data', body('email').notEmpty().escape(), (req, res) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) {
    const data = matchedData(req)
    return itemController.getUserData(data.email)
      .then((resp) => res.send(resp))
      .catch((err) => res.status(500).send({ errors: err }))
  }
  res.status(500).send({ errors: errors.array() })
})

// Manage client information
app.post('/data/manage', body('email').notEmpty().escape(), (req, res) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) {
    const data = matchedData(req)
    console.log(data)
    console.log(Object.keys(data))
    const response = itemController.manageUserData(data)
    return res.send(response)
  }
  res.status(500).send({ errors: errors.array() })
})

// Delete client information
app.post('/data/delete', body('email').notEmpty().escape(), (req, res) => {
  const errors = validationResult(req)
  if (errors.isEmpty()) {
    const data = matchedData(req)
    return itemController.deleteUserData(data.email)
      .then((resp) => res.send('Successfully deleted your data from our database!'))
      .catch((err) => res.status(500).send({ errors: err }))
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
