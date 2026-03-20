const express = require('express');
const cors = require('cors');
const healthRoutes = require('./routes/healthRoutes');
const receiptRoutes = require('./routes/receiptRoutes');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api', healthRoutes);
app.use('/api', receiptRoutes);
app.use(errorHandler);

module.exports = app;
