const { google } = require('googleapis')

const getUrl = (clientId, clientSecret) => {
  const redirectUrl = 'urn:ietf:wg:oauth:2.0:oob'
  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    redirectUrl
  )
  const scopes = ['https://www.googleapis.com/auth/calendar']
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes
  })
  return url
}

module.exports = {
  getUrl
}
