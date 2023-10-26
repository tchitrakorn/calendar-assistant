const calendarModel = require('../models/calendarModel')
const dataModel = require('../models/dataModel')
const db = require('../database/queries')

// Calendar
const track = async (email, prompt) => {
    return await calendarModel.readCalendar(email, prompt)
}

const manage = (email, prompt, city) => {
    return calendarModel.writeCalendar(email, prompt, city)
}

const explore = (prompt) => {
    return calendarModel.readCalendar(prompt)
}

// User data
const getAnalytics = (prompt) => {
    return dataModel.readData(prompt)
}

const getUserData = (email) => {
    return dataModel.readData(email)
}

const manageUserData = (prompt) => {
    return dataModel.writeData(prompt)
}

const storeCredentials = (email, clientId, clientSecret, openAIKey) => {
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
