const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');

// Configuración de OAuth2
const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const CREDENTIALS_PATH = path.join(__dirname, '../config/client_secret.json');

function authorize() {
    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
    const { client_secret, client_id, redirect_uris } = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
    oAuth2Client.setCredentials(JSON.parse(fs.readFileSync(path.join(__dirname, '../config/token.json'))));
    return oAuth2Client;
}

async function createGoogleCalendarEvent(auth, reservation, serviceName) {
    const calendar = google.calendar({ version: 'v3', auth });
    const event = {
        summary: `Reserva para ${serviceName}`, // Aquí incluimos el nombre del servicio
        description: `Hora: ${reservation.time}\nNotas: ${reservation.notes || 'Sin notas adicionales'}`, // Incluimos la hora y las notas
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

async function sendConfirmation(req, res) {
    try {
        const { serviceId, clientEmail, date, time, notes } = req.body;

        if (!serviceId || !clientEmail || !date || !time) {
            return res.status(400).json({ message: "Faltan datos para crear la reserva en Google Calendar" });
        }

        // Obtén el nombre del servicio desde la base de datos (este paso depende de cómo tengas configurada tu base de datos)
        const service = await Service.findById(serviceId); // Asegúrate de tener el modelo `Service` importado
        const serviceName = service ? service.name : 'Servicio';

        const auth = authorize();
        const event = await createGoogleCalendarEvent(auth, { clientEmail, date, time, notes }, serviceName);

        res.status(200).json({
            message: "Reserva agregada al calendario de Google",
            event: event
        });
    } catch (error) {
        console.error("Error al enviar la confirmación:", error);
        res.status(500).json({ message: "Error al enviar la confirmación", error: error.message });
    }
}

module.exports = { sendConfirmation };

