const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

// Definir la ruta de los archivos
const TOKEN_PATH = path.join(__dirname, '../config/token.json');
const CREDENTIALS_PATH = path.join(__dirname, '../config/client_secret.json');

// Cargar las credenciales de Google API
function loadCredentials() {
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf-8'));
    const { client_secret, client_id, redirect_uris } = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf-8'));
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
}

// Crear el evento en Google Calendar
async function createGoogleCalendarEvent(auth, reservation) {
    const calendar = google.calendar({ version: 'v3', auth });
    const event = {
        summary: 'Confirmación de Reserva',
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

    try {
        const response = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
        });
        console.log('Evento creado en Google Calendar');
        return response.data;
    } catch (error) {
        console.error('Error al crear el evento en Google Calendar:', error);
        throw error;
    }
}

// Controlador para enviar la confirmación de la reserva
async function sendConfirmation(req, res) {
    try {
        const { clientEmail, date, time, notes } = req.body;

        // Validar que los campos necesarios estén presentes
        if (!clientEmail || !date || !time) {
            return res.status(400).json({ message: "Faltan datos para crear la reserva en Google Calendar" });
        }

        const auth = loadCredentials();
        // Crear el evento en Google Calendar
        const event = await createGoogleCalendarEvent(auth, { clientEmail, date, time, notes });
        
        res.status(200).json({ message: "Reserva agregada al calendario de Google", event });
    } catch (error) {
        console.error("Error al enviar la confirmación:", error);
        res.status(500).json({ message: "Error al enviar la confirmación", error: error.message });
    }
}

module.exports = { sendConfirmation };

