const calendarModel = require('../models/calendarModel')
const dataModel = require('../models/dataModel')
const db = require('../database/queries')

// Calendar
const track = (prompt) => {
  return calendarModel.readCalendar(prompt)
}

const manage = (prompt) => {
  return calendarModel.writeCalendar(prompt)
}

const explore = (prompt) => {
  return calendarModel.readCalendar(prompt)
}

// User data
const getAnalytics = (prompt) => {
  return dataModel.readData(prompt)
}

const getUserData = (prompt) => {
  return dataModel.readData(prompt)
}

const manageUserData = (prompt) => {
  return dataModel.writeData(prompt)
}

const storeCredentials = (email, clientId, clientSecret, openAIKey) => {
  console.log('Inside storeCredentials')
  return db.postUser(email, clientId, clientSecret, openAIKey)
}

module.exports = {
  track,
  manage,
  explore,
  getAnalytics,
  getUserData,
  manageUserData,
  storeCredentials
}
