const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const Service = require('../models/service'); // Importar el modelo Service

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

    // Obtener el servicio para obtener su duración
    const service = await Service.findById(reservation.serviceId);
    if (!service) {
        throw new Error("Servicio no encontrado");
    }

    // Definir la hora de inicio y calcular la hora de fin usando la duración del servicio
    const eventStart = new Date(`${reservation.date}T${reservation.time}:00`);
    const eventEnd = new Date(eventStart.getTime() + service.duration * 60000); // duración en minutos a milisegundos

    const event = {
        summary: service.name, // Usa el nombre del servicio como título del evento
        description: reservation.notes || 'Sin notas adicionales',
        start: {
            dateTime: eventStart.toISOString(),
            timeZone: 'America/Bogota',
        },
        end: {
            dateTime: eventEnd.toISOString(),
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
        const { serviceId, clientEmail, date, time, notes } = req.body;

        // Validar que los campos necesarios estén presentes
        if (!serviceId || !clientEmail || !date || !time) {
            return res.status(400).json({ message: "Faltan datos para crear la reserva en Google Calendar" });
        }

        const auth = loadCredentials();
        // Crear el evento en Google Calendar
        const event = await createGoogleCalendarEvent(auth, { serviceId, clientEmail, date, time, notes });
        
        res.status(200).json({ message: "Reserva agregada al calendario de Google", event });
    } catch (error) {
        console.error("Error al enviar la confirmación:", error);
        res.status(500).json({ message: "Error al enviar la confirmación", error: error.message });
    }
}

module.exports = { sendConfirmation };
