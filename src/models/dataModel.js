const db = require('../database/queries')

// Models for user-related data from our database

const analyzeData = async (orgId) => {
  const events = await db.getUserEvents(orgId)
  let analysis = {}
  for (let i = 0; i < events.length; i++) {
    const currEvent = events[i]
    if (!analysis.hasOwnProperty(currEvent.email)) {
      analysis[currEvent.email] = {
        "track": 0,
        "manage": 0,
        "explore": 0
      }
    }
    analysis[currEvent.email][currEvent.event_type] += 1
  }
  return analysis
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
