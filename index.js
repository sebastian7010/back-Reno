const express = require('express');
const app = express();
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const notificationRoutes = require('./routes/notification.routes');
const serviceRoutes = require('./routes/service.routes');
const reservationRoutes = require('./routes/reservation.routes');

// Configuración de variables de entorno
dotenv.config();

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Conectar a MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log("Estamos conectados a la base de datos, ¡soy genial!"))
    .catch((error) => console.error("Error al conectar a MongoDB:", error));

// Rutas
app.use('/services', serviceRoutes);           // Ruta para servicios
app.use('/reservations', reservationRoutes);    // Ruta para reservas
app.use('/notifications', notificationRoutes);  // Ruta para notificaciones

// Puerto del servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`El servidor está conectado al puerto ${port} porque soy increíble`);
});

module.exports = app;





