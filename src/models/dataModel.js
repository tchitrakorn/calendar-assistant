const db = require('../database/queries')

// Models for user-related data from our database

const readData = (email) => {
  return db.getUser(email)
    .then(res => res)
    .catch(err => err)
}

const writeData = (prompt) => {
  return 'write user data response'
}

const deleteData = (email) => {
  return db.deleteUser(email)
    .then(res => res)
    .catch(err => err)
}

module.exports = {
  readData,
  writeData,
  deleteData
}
