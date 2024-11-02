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
    clientEmail: {
        type: String,
        required: true
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
    collection: 'reservations'
});

module.exports = mongoose.models.Reservation || mongoose.model('Reservation', reservationSchema);

