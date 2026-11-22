const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const errorHandler = require('./middleware/error-handler');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ nombre: 'MASI API', version: '1.0.0', salud: '/api/health' });
});

app.use('/api', routes);

app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.use(errorHandler);

module.exports = app;
