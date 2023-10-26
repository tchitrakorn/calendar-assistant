const calendarModel = require('../models/calendarModel')
const dataModel = require('../models/dataModel')
const db = require('../database/queries')

// Calendar
const track = async (email, prompt) => {
    await db.logUserEvent(email, 'track', prompt)
    return await calendarModel.readCalendar(email, prompt)
}

const manage = async (email, prompt, city) => {
    await db.logUserEvent(email, 'manage', prompt)
    return calendarModel.writeCalendar(email, prompt, city)
}

const explore = (prompt) => {
    return calendarModel.readCalendar(prompt)
}

// User data
const getAnalytics = (email) => {
    return dataModel.analyzeData(email)
}

const getUserData = (email) => {
    return dataModel.readData(email)
}

const manageUserData = (email, fieldsToUpdate) => {
    return dataModel.writeData(email, fieldsToUpdate)
}

const deleteUserData = (email) => {
    return dataModel.deleteData(email);
}

module.exports = {
    track,
    manage,
    explore,
    getAnalytics,
    getUserData,
    manageUserData,
    deleteUserData
}
