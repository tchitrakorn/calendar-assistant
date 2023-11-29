const calendarModel = require('../models/calendarModel')
const dataModel = require('../models/dataModel')
const db = require('../database/queries')

// Calendar
const track = async (request) => {
    const userArray = await db.getUser(request.email)
    const user = userArray[0]
    const { id, email: userEmail, org_id, client_id, client_secret, openai_key, access_token, refresh_token, city } = user
    await db.logUserEvent(request.email, 'track', org_id)
    return await calendarModel.readCalendar(request)
}

const manage = async (request) => {
    const orgId = request.orgId || 0  // 'UNKNOWN' if not provided (This is an option for end-users who call our service directly)
    await db.logUserEvent(request.email, 'manage', orgId)
    return calendarModel.writeCalendar(request)
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
