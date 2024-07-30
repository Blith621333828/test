const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const querystring = require('querystring');

const app = express();
const port = 8888;

const client_id = '2f8d6e5dfe1f4a6b805ef4b39e63cf8d'; // Twój Client ID
const client_secret = 'da49fa08506441d98db03f18dfb11f2a'; // Twój Client Secret
const redirect_uri = 'http://localhost:8888/callback'; // Twój Redirect URI

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Endpoint do logowania i autoryzacji
app.get('/login', (req, res) => {
    const scope = 'user-read-playback-state user-read-currently-playing';
    res.redirect('https://accounts.spotify.com/authorize?' +
        'response_type=code' +
        '&client_id=' + client_id +
        '&scope=' + encodeURIComponent(scope) +
        '&redirect_uri=' + encodeURIComponent(redirect_uri));
});

// Endpoint do obsługi callbacku
app.get('/callback', async (req, res) => {
    const code = req.query.code || null;
    if (code) {
        try {
            const tokenResponse = await axios.post('https://accounts.spotify.com/api/token', querystring.stringify({
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirect_uri,
                client_id: client_id,
                client_secret: client_secret
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const access_token = tokenResponse.data.access_token;
            res.redirect('/?access_token=' + access_token);
        } catch (error) {
            res.send('Error while fetching access token');
        }
    } else {
        res.send('Failed to authorize');
    }
});

// Endpoint do pobierania aktualnie odtwarzanego utworu
app.get('/get-now-playing', async (req, res) => {
    const access_token = req.query.access_token || null;
    if (access_token) {
        try {
            const response = await axios.get('https://api.spotify.com/v1/me/player/currently-playing', {
                headers: { 'Authorization': 'Bearer ' + access_token }
            });

            res.send(response.data);
        } catch (error) {
            res.send('Error while fetching now playing data');
        }
    } else {
        res.send('No access token provided');
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
