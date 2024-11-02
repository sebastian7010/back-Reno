// routes/service.routes.js

const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');

// Ruta para crear un nuevo servicio
router.post('/', serviceController.createService);

// Ruta para obtener todos los servicios
router.get('/', serviceController.getAllServices);

// Ruta para obtener un servicio específico por su ID
router.get('/:id', serviceController.getServiceById);

// Ruta para actualizar un servicio existente
router.put('/:id', serviceController.updateService);

// Ruta para eliminar un servicio específico
router.delete('/:id', serviceController.deleteService);

module.exports = router;

