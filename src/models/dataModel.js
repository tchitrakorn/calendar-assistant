const db = require('../database/queries')

// Models for user-related data from our database

const analyzeData = async (email) => {
  const events = await db.getUserEvents(email)
  const filteredEvents = events.map((event) => {
    return {
      eventType: event.event_type,
      prompt: event.prompt
    }
  })
  return filteredEvents
}

const readData = (email) => {
  return db.getUser(email)
    .then(res => res)
    .catch(err => err)
}

const writeData = (email, fieldsToUpdate) => {
  return db.updateUser(email, fieldsToUpdate)
    .then(res => res)
    .catch(err => err)
}

const deleteData = (email) => {
  return db.deleteUser(email)
    .then(res => res)
    .catch(err => err)
}

module.exports = {
  analyzeData,
  readData,
  writeData,
  deleteData
}
