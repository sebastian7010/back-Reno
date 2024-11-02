// controllers/serviceController.js
const mongoose = require('mongoose');

const Service = require('../models/service'); // Asegúrate de tener un modelo de Service


// Crear un nuevo servicio
const createService = async (req, res) => {
    try {
        const { name, description, duration, price } = req.body;
        const newService = new Service({ name, description, duration, price });
        await newService.save();
        res.status(201).json(newService);
    } catch (error) {
        res.status(500).json({ message: "Error al crear el servicio", error });
    }
};

// Obtener todos los servicios
const getAllServices = async (req, res) => {
    try {
        const services = await Service.find();
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: "Error al obtener los servicios", error });
    }
};

// Obtener un servicio específico por su ID
const getServiceById = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("ID recibido:", id); // Log para verificar el ID

        // Realiza la búsqueda en la base de datos
        const reservation = await Reservation.findById(id).populate('serviceId').populate('clientId');

        if (!reservation) {
            console.log("Reserva no encontrada en la base de datos"); // Log adicional
            return res.status(404).json({ message: "Reserva no encontrada" });
        }

        res.json(reservation);
    } catch (error) {
        console.error("Error al obtener la reserva:", error);
        res.status(500).json({ message: "Error al obtener la reserva", error: error.message });
    }
};



// Actualizar un servicio existente
const updateService = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, duration, price } = req.body;
        const updatedService = await Service.findByIdAndUpdate(
            id,
            { name, description, duration, price },
            { new: true }
        );
        if (!updatedService) {
            return res.status(404).json({ message: "Servicio no encontrado" });
        }
        res.json(updatedService);
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar el servicio", error });
    }
};

// Eliminar un servicio
const deleteService = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedService = await Service.findByIdAndDelete(id);
        if (!deletedService) {
            return res.status(404).json({ message: "Servicio no encontrado" });
        }
        res.json({ message: "Servicio eliminado correctamente" });
    } catch (error) {
        res.status(500).json({ message: "Error al eliminar el servicio", error });
    }
};

module.exports = {
    createService,
    getAllServices,
    getServiceById,
    updateService,
    deleteService,
};
