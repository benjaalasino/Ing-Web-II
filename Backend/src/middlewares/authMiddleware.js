const { pool } = require('../data/db');
const { verifyToken } = require('../utils/authUtils');

const requireAuth = async (req, res, next) => {
    const header = req.headers.authorization || '';
    const [, token] = header.split(' ');

    if (!token) {
        res.status(401).json({ statusCode: 401, message: 'Token no provisto.' });
        return;
    }

    try {
        const payload = verifyToken(token);
        const { rows } = await pool.query('SELECT id, role, name FROM users WHERE id = $1', [payload.userId]);

        if (rows.length === 0) {
            res.status(401).json({ statusCode: 401, message: 'Sesion invalida.' });
            return;
        }

        const user = rows[0];
        req.auth = {
            userId: user.id,
            role: user.role,
            name: user.name
        };

        next();
    } catch (error) {
        res.status(401).json({ statusCode: 401, message: 'Token invalido o expirado.' });
    }
};

const requireRole = (requiredRole) => {
    return (req, res, next) => {
        if (!req.auth || req.auth.role !== requiredRole) {
            res.status(403).json({ statusCode: 403, message: 'No tienes permisos para esta accion.' });
            return;
        }
        next();
    };
};

module.exports = {
    requireAuth,
    requireRole
};
