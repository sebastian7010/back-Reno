const readline = require('readline');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const CREDENTIALS_PATH = path.join(__dirname, 'config/client_secret.json');
const TOKEN_PATH = path.join(__dirname, 'config/token.json');

function authorize(callback) {
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
    const { client_secret, client_id, redirect_uris } = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    const token = JSON.parse(fs.readFileSync(TOKEN_PATH));
    oAuth2Client.setCredentials(token);
    callback(oAuth2Client);
}

function createGoogleCalendarEvent(auth, reservation) {
    const calendar = google.calendar({ version: 'v3', auth });
    const event = {
        summary: reservation.serviceName,
        description: reservation.notes || 'Sin notas adicionales',
        start: {
            dateTime: `${reservation.date}T${reservation.time}:00`,
            timeZone: 'America/Bogota',
        },
        end: {
            dateTime: `${reservation.date}T${reservation.time}:30`,
            timeZone: 'America/Bogota',
        },
        attendees: [{ email: reservation.clientEmail }],
    };

    calendar.events.insert({
        calendarId: 'primary',
        resource: event,
    }, (err, event) => {
        if (err) {
            console.log('Error al crear el evento en Google Calendar:', err);
            return;
        }
        console.log('Evento creado en Google Calendar:', event.data.htmlLink);
    });
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(query) {
    return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
    console.log("Iniciando el proceso de reserva...");
    
    const serviceName = await askQuestion("Nombre del servicio: ");
    const clientEmail = await askQuestion("Email del cliente: ");
    const date = await askQuestion("Fecha (YYYY-MM-DD): ");
    const time = await askQuestion("Hora (HH:MM, 24 horas): ");
    const notes = await askQuestion("Notas adicionales (opcional): ");

    const reservation = { serviceName, clientEmail, date, time, notes };

    rl.close();

    authorize((auth) => {
        createGoogleCalendarEvent(auth, reservation);
    });
}

main();
