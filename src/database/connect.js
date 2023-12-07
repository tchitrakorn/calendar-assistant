const { Client } = require('pg')

const client = new Client({
    database: 'calendar_assistant_db',
})

const connect = async () => {
    await client.connect((err) => {
        if (err) {
            console.log(err)
        } else {
            console.log('Database connected!')
        }
    })
}

connect()

module.exports.client = client
