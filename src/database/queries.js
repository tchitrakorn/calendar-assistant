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
    postUser: (email, clientId, clientSecret, accessToken, refreshToken, openAIKey) => {
        const queryString =
            'INSERT INTO users (email, client_id, client_secret, access_token, refresh_token, openai_key) VALUES ($1, $2, $3, $4, $5, $6)'
        const values = [email, clientId, clientSecret, accessToken, refreshToken, openAIKey]
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
