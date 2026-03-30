const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const healthRoutes = require('./routes/healthRoutes');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const expenseRoutes = require('./routes/expenseRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const userRoutes = require('./routes/userRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const mercadoPagoRoutes = require('./routes/mercadoPagoRoutes');
const savingsRoutes = require('./routes/savingsRoutes');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

const frontendPathCandidates = [
	path.resolve(process.cwd(), 'Frontend/public/src'),
	path.resolve(process.cwd(), '../Frontend/public/src'),
	path.resolve(__dirname, '../../Frontend/public/src'),
	path.resolve(__dirname, '../public/src')
];

const frontendRoot = frontendPathCandidates.find((candidate) => fs.existsSync(candidate));
const frontendIndex = frontendRoot ? path.join(frontendRoot, 'pages', 'index.html') : null;

app.use(cors());
app.use(express.json());

if (frontendRoot) {
	app.use(express.static(frontendRoot));

	if (fs.existsSync(frontendIndex)) {
		app.get('/pages/index.html', (req, res) => {
			res.sendFile(frontendIndex);
		});

		app.get('/:page.html', (req, res, next) => {
			const requestedPage = req.params.page;

			if (!requestedPage) {
				return next();
			}

			const requestedPath = path.join(frontendRoot, 'pages', `${requestedPage}.html`);

			if (fs.existsSync(requestedPath)) {
				return res.sendFile(requestedPath);
			}

			return next();
		});
	}
}

app.get('/', (req, res) => {
	if (frontendIndex && fs.existsSync(frontendIndex)) {
		return res.redirect('/pages/index.html');
	}

	return res.status(200).json({
		ok: true,
		message: 'API desplegada correctamente',
		docs: '/api/health'
	});
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
app.use('/api', mercadoPagoRoutes);
app.use('/api', savingsRoutes);
app.use(errorHandler);

module.exports = app;
