const db = require('./connect.js')

module.exports = {
  getUser: (email) => {
    const queryString = 'SELECT * FROM users WHERE users.email = $1'
    const values = [email]
    return db.client
      .query(queryString, values)
      .then((results) => results.rows)
      .catch((error) => error)
  },
  postUser: (email, clientId, clientSecret, openAIKey) => {
    const queryString =
            'INSERT INTO users (email, client_id, client_secret, openai_key) VALUES ($1, $2, $3, $4)'
    const values = [email, clientId, clientSecret, openAIKey]
    return db.client
      .query(queryString, values)
      .then((results) => results.rows)
      .catch((error) => error)
  },
  postUserAccessToken: (email, accessToken) => {
    const queryString =
            'INSERT INTO users (access_token) VALUES ($1) WHERE users.email = $2'
    const values = [accessToken, email]
    return db.client
      .query(queryString, values)
      .then((results) => results.rows)
      .catch((error) => error)
  }
}
