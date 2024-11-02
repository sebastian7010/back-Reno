const fs = require('fs');
const path = require('path');
const { google } = require('googleapis');
const http = require('http');
const url = require('url');

const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const CREDENTIALS_PATH = path.join(__dirname, 'client_secret.json'); // Ajusta la ruta si es necesario
const TOKEN_PATH = path.join(__dirname, 'token.json'); // Ajusta la ruta si es necesario

async function authorize() {
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
    const { client_secret, client_id, redirect_uris } = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);

    // Usar importación dinámica para cargar el módulo `open`
    const open = (await import('open')).default;
    open(authUrl);

    const server = http.createServer(async (req, res) => {
        if (req.url.startsWith('/oauth2callback')) {
            const query = new url.URL(req.url, 'http://localhost:3000').searchParams;
            const code = query.get('code');
            res.end('Authentication successful! You can close this tab.');
            server.close();
            
            const { tokens } = await oAuth2Client.getToken(code);
            oAuth2Client.setCredentials(tokens);
            fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
            console.log('Token stored to', TOKEN_PATH);
        }
    }).listen(3000, () => {
        console.log('Server listening on http://localhost:3000');
    });
}

authorize();
