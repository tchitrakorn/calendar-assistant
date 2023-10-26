// Models for calendar-related tasks
const { PythonShell } = require('python-shell')
const queries = require('../database/queries')

const readCalendar = async (email, prompt) => {
  try {
    const userArray = await queries.getUser(email)
    // console.log('User data retrieved:', user);

    if (userArray.length === 0) {
      throw new Error('User not found')
    }
    const user = userArray[0]

    const { id, email: userEmail, client_id, client_secret, openai_key, access_token, refresh_token, city} = user;
    // console.log('Access Token:', access_token);  // Log the individual properties
    // console.log('Client ID:', client_id);

    const options = {
      mode: 'text',
      // pythonPath: '/Users/karenwang/.virtualenvs/calendar-assistant/bin/python',  this will be the python path on the server
      pythonOptions: ['-u'], // get print results in real-time
      scriptPath: 'python_scripts',
      args: [client_id, client_secret, access_token, refresh_token, openai_key, prompt]
    }

    // Execute the Python script and capture the output
    const scriptOutput = await new Promise((resolve, reject) => {
      const output = [];

      const pyshell = new PythonShell('get_events.py', options)

      // Collect script print output
      pyshell.on('message', function (message) {
        output.push(message)
      })

      // end the input stream and allow the process to exit
      pyshell.end(function (err) {
        if (err) {
          reject(err)
        } else {
          resolve(output)
        }
      })
    })

    // 'scriptOutput' will contain the full stdout text from the Python script.
    return scriptOutput // return it as the response
  } catch (error) {
    console.error('An error occurred:', error)
    return {
      success: false,
      message: 'An error occurred while running the calendar script.'
    }
  }
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
