const { OAuth2Client } = require('google-auth-library');
const http = require('http');
const url = require('url');
const open = (...args) => import('open').then(({ default: open }) => open(...args));
const db = require('../database/queries')

const destroyer = require('server-destroy');

// Download your OAuth2 configuration from the Google
//const keys = require('./oauth2.keys.json');

/**
* Start by acquiring a pre-authenticated oAuth2 client.
*/
async function authenticate(email, client_id, client_secret, openAIKey) {
    const oAuth2Client = await getAuthenticatedClient(client_id, client_secret);
    // Make a simple request to the People API using our pre-authenticated client. The `request()` method
    // takes an GaxiosOptions object.  Visit https://github.com/JustinBeckwith/gaxios.
    const url = 'https://www.googleapis.com/auth/calendar';
    const res = await oAuth2Client.request({ url });
    // console.log(res.data);

    // After acquiring an access_token, you may want to check on the audience, expiration,
    // or original scopes requested.  You can do that with the `getTokenInfo` method.
    const tokenInfo = await oAuth2Client.getTokenInfo(
        oAuth2Client.credentials.access_token
    );
    //console.log(tokenInfo);
    console.log(oAuth2Client.credentials)

    return db.postUser(
        email,
        client_id,
        client_secret,
        oAuth2Client.credentials.access_token,
        oAuth2Client.credentials.refresh_token,
        openAIKey
    )
        .then(res => res)
        .catch(error => error)
}

/**
* Create a new OAuth2Client, and go through the OAuth2 content
* workflow.  Return the full client to the callback.
*/
function getAuthenticatedClient(client_id, client_secret) {
    return new Promise((resolve, reject) => {
        // create an oAuth client to authorize the API call.  Secrets are kept in a `keys.json` file,
        // which should be downloaded from the Google Developers Console.
        const oAuth2Client = new OAuth2Client(
            client_id,
            client_secret,
            `http://localhost:8080/oauth2callback`
        );

        // Generate the url that will be used for the consent dialog.
        const authorizeUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: 'https://www.googleapis.com/auth/calendar',
        });

        // Open an http server to accept the oauth callback. In this simple example, the
        // only request to our webserver is to /oauth2callback?code=<code>

        const server = http
            .createServer(async (req, res) => {
                try {
                    if (req.url.indexOf('/oauth2callback') > -1) {
                        // acquire the code from the querystring, and close the web server.
                        const qs = new url.URL(req.url, 'http://localhost:8080')
                            .searchParams;
                        const code = qs.get('code');
                        console.log(`Code is ${code}`);
                        res.end('Authentication successful! Please return to the console.');
                        server.destroy();

                        // Now that we have the code, use that to acquire tokens.
                        const r = await oAuth2Client.getToken(code);
                        // Make sure to set the credentials on the OAuth2 client.
                        oAuth2Client.setCredentials(r.tokens);
                        console.info('Tokens acquired.');
                        resolve(oAuth2Client);
                    }
                } catch (e) {
                    reject(e);
                }
            })
            .listen(8080, () => {
                // open the browser to the authorize url to start the workflow
                open(authorizeUrl, { wait: false }).then(cp => cp.unref());
            });
        destroyer(server);
    });
}

module.exports = {
    authenticate
}