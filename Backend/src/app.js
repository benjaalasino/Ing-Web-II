const express = require('express');
const cors = require('cors');
const path = require('path');
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const userRoutes = require('./routes/userRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();
const frontendRoot = path.resolve(__dirname, '../../Frontend/public/src');

app.use(cors());
app.use(express.json());
app.use(express.static(frontendRoot));

app.get('/', (req, res) => {
	res.redirect('/pages/index.html');
});

app.get('/api', (req, res) => {
	res.status(200).json({
		ok: true,
		message: 'API desplegada correctamente',
		docs: '/api/health'
	});
});

app.use('/api', healthRoutes);
app.use('/api', authRoutes);
app.use('/api', profileRoutes);
app.use('/api', expenseRoutes);
app.use('/api', budgetRoutes);
app.use('/api', recommendationRoutes);
app.use('/api', userRoutes);
app.use('/api', ticketRoutes);
app.use(errorHandler);

module.exports = app;
