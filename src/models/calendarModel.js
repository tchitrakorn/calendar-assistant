// Models for calendar-related tasks
const { PythonShell } = require('python-shell')

const readCalendar = (prompt) => {
  // The code commented out uses pythonShell to run python scripts, which handles
  // the logic of retrieving events from the user's calendar. However, we are actively
  // developing the authorization process to enable this functionality, so for now we
  // are just returning dummy data.

  // const options = {
  //   mode: 'text',
  //   // pythonPath: '/Users/karenwang/.virtualenvs/calendar-assistant/bin/python',  this will be the python path on the server
  //   pythonOptions: ['-u'], // get print results in real-time
  //   scriptPath: 'python_scripts'
  // }

  // try {
  //   // Wait for the result of the Python script
  //   const results = await new Promise((resolve, reject) => {
  //     PythonShell.run('auth_get_events.py', options, function (err, results) {
  //       if (err) reject(err)
  //       resolve(results)
  //     })
  //   })

  //   return results
  return `${prompt} read calendar response`
  // } catch (error) {
  //   console.error('An error occurred: ', error)
  //   // Instead of throwing the error, we return dummy data
  //   return {
  //     success: false,
  //     events: [], // or any other dummy data structure you need
  //     message: 'Still under testing, this is dummy data.'
  //   }
  // };
}

const writeCalendar = (prompt) => {
  // The code commented out uses pythonShell to run python scripts, which handles
  // the logic of managing events from the user's calendar. However, we are actively
  // developing the authorization process to enable this functionality, so for now we
  // are just returning dummy data.

  // const options = {
  //   mode: 'text',
  //   // pythonPath: '/Users/karenwang/.virtualenvs/calendar-assistant/bin/python',  this will be the python path on the server
  //   pythonOptions: ['-u'], // get print results in real-time
  //   scriptPath: 'python_scripts'
  // }

  // try {
  //   // Wait for the result of the Python script
  //   const results = await new Promise((resolve, reject) => {
  //     PythonShell.run('auth_manage_events.py', options, function (err, results) {
  //       if (err) reject(err)
  //       resolve(results)
  //     })
  //   })

  //   return results
  return `${prompt} write calendar response`
  // } catch (error) {
  //   console.error('An error occurred: ', error)
  //   // Instead of throwing the error, we return dummy data
  //   return {
  //     success: false,
  //     events: [], // or any other dummy data structure you need
  //     message: "This is under testing, here's my dummy data."
  //   }
  // };
}

module.exports = {
  readCalendar,
  writeCalendar
}
