// Models for calendar-related tasks
const { PythonShell } = require('python-shell');

const readCalendar = async (prompt) => {
    let options = {
        mode: 'text',
        // pythonPath: '/Users/karenwang/.virtualenvs/calendar-assistant/bin/python',  this will be the python path on the server
        pythonOptions: ['-u'], // get print results in real-time
        scriptPath: 'python-scripts',
    };

    try {
        // Wait for the result of the Python script
        let results = await new Promise((resolve, reject) => {
            PythonShell.run('auth_get_events.py', options, function (err, results) {
                if (err) reject(err);
                resolve(results);
            });
        });

        return results;
        // return `${prompt} read calendar response`;  

    } catch (error) {
        console.error("An error occurred: ", error);
        // Instead of throwing the error, we return dummy data
        return {
            success: false,
            events: [],  // or any other dummy data structure you need
            message: "Still under testing, this is dummy data.",
    }
};
}

const writeCalendar = async (prompt) => {
    let options = {
        mode: 'text',
        // pythonPath: '/Users/karenwang/.virtualenvs/calendar-assistant/bin/python',  this will be the python path on the server
        pythonOptions: ['-u'], // get print results in real-time
        scriptPath: 'python-scripts',
    };

    try {
        // Wait for the result of the Python script
        let results = await new Promise((resolve, reject) => {
            PythonShell.run('auth_manage_events.py', options, function (err, results) {
                if (err) reject(err);
                resolve(results);
            });
        });

        return results;
        // return `${prompt} write calendar response`; 

    } catch (error) {
        console.error("An error occurred: ", error);
        // Instead of throwing the error, we return dummy data
        return {
            success: false,
            events: [],  // or any other dummy data structure you need
            message: "This is under testing, here's my dummy data.",
    }
};
}

module.exports = {
    readCalendar,
    writeCalendar
};