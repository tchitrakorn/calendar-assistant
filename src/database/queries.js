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
    postUser: (
        email,
        clientId,
        clientSecret,
        accessToken,
        refreshToken,
        openAIKey
    ) => {
        const queryString =
            'INSERT INTO users (email, client_id, client_secret, access_token, refresh_token, openai_key) \
            VALUES ($1, $2, $3, $4, $5, $6) \
            ON CONFLICT (email) DO UPDATE \
            SET client_id = EXCLUDED.client_id, \
            client_secret = EXCLUDED.client_secret, \
            access_token = EXCLUDED.access_token, \
            refresh_token = EXCLUDED.refresh_token, \
            openai_key = EXCLUDED.openai_key'
        const values = [
            email,
            clientId,
            clientSecret,
            accessToken,
            refreshToken,
            openAIKey,
        ]
        return db.client
            .query(queryString, values)
            .then((results) => results.rows)
            .catch((error) => error)
    },
    postUsersOrgs: (email, orgId) => {
        const queryString =
            'INSERT INTO usersOrgs (email, org_id) \
            VALUES ($1, $2)'
        const values = [email, orgId]
        return db.client
            .query(queryString, values)
            .then((results) => results.rows)
            .catch((error) => error)
    },
    getUsersOrgs: (email) => {
        const queryString =
            'SELECT org_id FROM usersOrgs WHERE usersOrgs.email = $1'
        const values = [email]
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
    },
    deleteUser: async (email) => {
        const queryString1 = 'DELETE FROM usersOrgs WHERE usersOrgs.email = $1;'
        const queryString2 = 'DELETE FROM events WHERE events.email = $1'
        const queryString3 = 'DELETE FROM users WHERE users.email = $1'
        const values = [email]
        await db.client.query(queryString1, values)
        await db.client.query(queryString2, values)
        await db.client.query(queryString3, values)
    },
    updateUser: (email, fieldsToUpdate) => {
        const fieldValuePairs = []
        const values = [email]
        let fieldIndex = 2 // first index belongs to the email field
        for (const [field, value] of Object.entries(fieldsToUpdate)) {
            fieldValuePairs.push(field + ' = $' + fieldIndex)
            values.push(value)
            fieldIndex++
        }
        const fieldValueString = fieldValuePairs.join(', ')
        const queryString = `UPDATE users SET ${fieldValueString} WHERE users.email = $1`
        return db.client
            .query(queryString, values)
            .then((results) => results.rows)
            .catch((error) => error)
    },
    logUserEvent: (email, eventType, orgId) => {
        const queryString =
            'INSERT INTO events (email, event_type, org_id) \
        VALUES ($1, $2, $3)'
        const values = [email, eventType, orgId]
        return db.client
            .query(queryString, values)
            .then((results) => results.rows)
            .catch((error) => error)
    },
    getUserEvents: (orgId) => {
        const queryString = 'SELECT * FROM events WHERE events.org_id = $1'
        const values = [orgId]
        return db.client
            .query(queryString, values)
            .then((results) => results.rows)
            .catch((error) => error)
    },
    getOrg: (orgId) => {
        const queryString = 'SELECT * FROM orgs WHERE orgs.id = $1'
        const values = [orgId]
        return db.client
            .query(queryString, values)
            .then((results) => results.rows)
            .catch((error) => error)
    },
}
