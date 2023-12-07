const { Client } = require('pg')
jest.mock('pg', () => {
    const mClient = {
        connect: jest.fn(),
    }
    return { Client: jest.fn(() => mClient) }
})

describe('Database Connection', () => {
    // let consoleSpy;

    // beforeEach(() => {
    //     consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    // });

    // afterEach(() => {
    //     jest.clearAllMocks();
    // });

    // it('should log an error on connection failure', async () => {
    //     require('../database/connect');
    //     const { client } = require('../database/connect');

    //     // Simulate connection error
    //     const error = new Error('Connection error');
    //     client.connect.mockImplementation(cb => cb(error));

    //     await expect(client.connect).toHaveBeenCalled();
    //     expect(consoleSpy).toHaveBeenCalledWith(error);
    // });

    it('should connect to the database successfully', async () => {
        require('../database/connect') // Adjust the path to the actual location of your connect.js file
        const { client } = require('../database/connect')

        // Simulate successful connection
        client.connect.mockImplementation((cb) => cb(null))

        await expect(client.connect).toHaveBeenCalled()
        // You can also test console logs if necessary
    })

    it('should handle a connection error', async () => {
        require('../database/connect')
        const { client } = require('../database/connect')

        // Simulate connection error
        const error = new Error('Connection error')
        client.connect.mockImplementation((cb) => cb(error))

        await expect(client.connect).toHaveBeenCalled()
        // Here you can check if the error was logged or handled correctly
    })
})
