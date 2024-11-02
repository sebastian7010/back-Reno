const mongoose = require('mongoose');
const Reservation = require('../models/Reservation'); // Asegúrate de tener un modelo Reservation
const Client = require('../models/Client');


// Crear una nueva reserva
const createReservation = async (req, res) => {
    try {
        const { serviceId, clientId, clientEmail, date, time, notes } = req.body;

        const newReservation = new Reservation({
            serviceId,
            clientId,
            clientEmail,
            date,
            time,
            notes
        });

        const savedReservation = await newReservation.save();
        res.status(201).json({
            message: "Reserva creada exitosamente",
            reservation: savedReservation
        });
    } catch (error) {
        console.error("Error al crear la reserva:", error);
        res.status(500).json({ message: "Error al crear la reserva", error: error.message });
    }
};




const getAllReservations = async (req, res) => {
    try {
        // Buscar todas las reservas y popular los datos del servicio y el cliente
        const reservations = await Reservation.find()
            .populate('serviceId', 'name description price') // Muestra el nombre, la descripción y el precio del servicio
            .populate('clientId', 'name email'); // Muestra solo el nombre y el correo del cliente

        res.status(200).json(reservations);
    } catch (error) {
        console.error("Error al obtener las reservas:", error);
        res.status(500).json({ message: "Error al obtener las reservas", error: error.message });
    }
};


// Obtener una reserva específica por su ID
const getReservationById = async (req, res) => {
    try {
        const { id } = req.params;
        const reservation = await Reservation.findById(id)
            .populate('serviceId', 'name description price')
            .populate('clientId', 'name email');
        
        if (!reservation) {
            return res.status(404).json({ message: "Reserva no encontrada" });
        }

        res.json(reservation);
    } catch (error) {
        console.error("Error al obtener la reserva:", error);
        res.status(500).json({ message: "Error al obtener la reserva", error: error.message });
    }
};



// controllers/reservationController.js
const deleteReservation = async (req, res) => {
    try {
        const { id } = req.params;

        // Paso 4.1: Verificar que el ID se recibe correctamente
        console.log("ID recibido en deleteReservation:", id);

        // Paso 4.2: Intentar buscar la reserva antes de eliminarla
        const reservation = await Reservation.findById(id);
        console.log("Reserva encontrada:", reservation);

        if (!reservation) {
            return res.status(404).json({ message: "Reserva no encontrada" });
        }

        // Eliminar la reserva si existe
        await Reservation.findByIdAndDelete(id);
        res.status(200).json({ message: "Reserva eliminada exitosamente" });
    } catch (error) {
        console.error("Error al eliminar la reserva:", error);
        res.status(500).json({ message: "Error al eliminar la reserva", error: error.message });
    }
};


module.exports = {
    createReservation,
    getAllReservations,
    getReservationById,
    deleteReservation
};
