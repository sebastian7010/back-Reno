const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    serviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    clientEmail: {  // Añadido campo de correo del cliente
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    notes: {
        type: String
    }
}, {
    timestamps: true,
    collection: 'reservations' // Fuerza a usar el nombre "reservations" para evitar duplicación
});

module.exports = mongoose.model('Reservation', reservationSchema);
