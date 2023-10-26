// Models for user-related data from our database
const queries = require('../database/queries')

const readData = async (email) => {
  try {
    const userArray = await queries.getUser(email)
    // console.log('User data retrieved:', user);

    if (userArray.length === 0) {
      throw new Error('User not found')
    }
    const user = userArray[0]
    return user
  } catch (error) {
    console.error('An error occurred:', error)
    return {
      success: false,
      message: 'An error occurred.'
    }
  }
}

const writeData = (prompt) => {
  return 'write user data response'
}

module.exports = {
  readData,
  writeData
}
