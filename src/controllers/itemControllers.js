const calendarModel = require('../models/calendarModel')
const dataModel = require('../models/dataModel')
const db = require('../database/queries')
const { request } = require('express')

// Calendar
const track = async (request) => {
    // await db.logUserEvent(request.email, 'track', request)
    return await calendarModel.readCalendar(request)
}

const manage = async (request) => {
    //await db.logUserEvent(email, 'manage', prompt)
    return calendarModel.writeCalendar(request)
}

const explore = (request) => {
    return calendarModel.readCalendar(request)
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
