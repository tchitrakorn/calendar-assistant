const calendarModel = require('../models/calendarModel');
const dataModel = require('../models/dataModel');

// Calendar
const track = (prompt) => {
    return calendarModel.readCalendar(prompt);
}

const manage = (prompt) => {
    return calendarModel.writeCalendar(prompt);
}

const explore = (prompt) => {
    return calendarModel.readCalendar(prompt);
}

// User data
const getAnalytics = (prompt) => {
    return dataModel.readData(prompt);
}

const getUserData = (prompt) => {
    return dataModel.readData(prompt);
}

const manageUserData = (prompt) => {
    return dataModel.writeData(prompt);
}

module.exports = {
    track,
    manage,
    explore,
    getAnalytics,
    getUserData,
    manageUserData
}