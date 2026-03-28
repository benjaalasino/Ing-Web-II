const { pool } = require('../data/db');

const mapRec = (row) => ({
    id: row.id,
    userId: row.user_id,
    advisorId: row.advisor_id,
    text: row.text,
    createdAt: row.created_at
});

const getRecommendations = async (req, res) => {
    let ownerId = req.auth.userId;
    if (req.auth.role === 'advisor' && req.query.userId) {
        ownerId = Number(req.query.userId);
    }

    let sql = 'SELECT * FROM recommendations WHERE user_id = $1 ORDER BY created_at DESC';
    const params = [ownerId];

    if (req.query.limit) {
        sql += ' LIMIT $2';
        params.push(Number(req.query.limit));
    }

    const { rows } = await pool.query(sql, params);
    res.json(rows.map(mapRec));
};

const createRecommendation = async (req, res) => {
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

    const { rows: userRows } = await pool.query("SELECT id FROM users WHERE id = $1 AND role = 'user'", [Number(userId)]);
    if (userRows.length === 0) {
        res.status(404).json({ statusCode: 404, message: 'Usuario destino no encontrado.' });
        return;
    }

    const { rows } = await pool.query(
        'INSERT INTO recommendations (user_id, advisor_id, text) VALUES ($1, $2, $3) RETURNING *',
        [Number(userId), req.auth.userId, String(text).trim()]
    );

    res.status(201).json(mapRec(rows[0]));
};

module.exports = {
    getRecommendations,
    createRecommendation
};
