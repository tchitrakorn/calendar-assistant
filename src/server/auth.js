const { google } = require('googleapis')
const db = require('../database/queries')

// WIP
const getAuthClient = (email, clientId, clientSecret) => {
  const redirectUrl = `http://localhost:3000/auth/callback?email=${email}`
  return new google.auth.OAuth2(clientId, clientSecret, redirectUrl)
}

// WIP
const getUrl = (email, clientId, clientSecret, openAIKey) => {
  return db.postUser(email, clientId, clientSecret, openAIKey).then(() => {
    const oauth2Client = getAuthClient(email, clientId, clientSecret)
    const scopes = ['https://www.googleapis.com/auth/calendar']
    return oauth2Client.generateAuthUrl({
      access_type: 'online',
      scope: scopes
    })
  })
}

// WIP
const getCredential = async (email, code) => {
  const result = await db.getUser(email)
  const clientId = result[0].client_id
  const clientSecret = result[0].client_secret
  const oauth2Client = getAuthClient(email, clientId, clientSecret)

  const { tokens } = await oauth2Client.getToken(code)
  const credential = oauth2Client.setCredentials(tokens)

  return credential
}

module.exports = {
  getUrl,
  getCredential
}
