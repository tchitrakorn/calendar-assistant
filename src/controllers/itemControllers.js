const calendarModel = require('../models/calendarModel')
const dataModel = require('../models/dataModel')
const db = require('../database/queries')

// Calendar
const track = async (request) => {
  await db.logUserEvent(request.email, 'track', request.orgId)
  return await calendarModel.readCalendar(request)
}

const manage = async (request) => {
  await db.logUserEvent(request.email, 'manage', request.orgId)
  return calendarModel.writeCalendar(request)
}

const explore = (prompt) => {
  return calendarModel.readCalendar(prompt)
}

const freeSlots = async (request) => {
  await db.logUserEvent(request.email, 'freeSlots', request.orgId)
  return calendarModel.findFreeSlots(request)
}

// User data
const getAnalytics = async (orgId) => {
  return dataModel.analyzeData(orgId)
}

const getUserData = (email) => {
  return dataModel.readData(email)
}

const manageUserData = (email, fieldsToUpdate) => {
  return dataModel.writeData(email, fieldsToUpdate)
}

const deleteUserData = (email) => {
  return dataModel.deleteData(email)
}

module.exports = {
  track,
  manage,
  explore,
  getAnalytics,
  getUserData,
  manageUserData,
  deleteUserData,
  freeSlots
}
