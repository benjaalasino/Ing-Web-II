const { db, getNextId } = require('../data/db');

const getRecommendations = (req, res) => {
    let ownerId = req.auth.userId;

    if (req.auth.role === 'advisor' && req.query.userId) {
        ownerId = Number(req.query.userId);
    }

    const limit = req.query.limit ? Number(req.query.limit) : null;

    let items = db.recommendations
        .filter((item) => item.userId === ownerId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    if (limit) {
        items = items.slice(0, limit);
    }

    res.json(items);
};

const createRecommendation = (req, res) => {
    if (req.auth.role !== 'advisor') {
        res.status(403).json({ statusCode: 403, message: 'Solo asesores pueden crear recomendaciones.' });
        return;
    }

    const { userId, text } = req.body;

    if (!userId || !text) {
        res.status(400).json({ statusCode: 400, message: 'userId y text son obligatorios.' });
        return;
    }

    if (String(text).trim().length < 10) {
        res.status(400).json({ statusCode: 400, message: 'La recomendacion debe tener al menos 10 caracteres.' });
        return;
    }

    const targetUser = db.users.find((item) => item.id === Number(userId) && item.role === 'user');
    if (!targetUser) {
        res.status(404).json({ statusCode: 404, message: 'Usuario destino no encontrado.' });
        return;
    }

    const recommendation = {
        id: getNextId('recommendations'),
        userId: Number(userId),
        advisorId: req.auth.userId,
        text: String(text).trim(),
        createdAt: new Date().toISOString()
    };

    db.recommendations.push(recommendation);
    res.status(201).json(recommendation);
};

module.exports = {
    getRecommendations,
    createRecommendation
};
