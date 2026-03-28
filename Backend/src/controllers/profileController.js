const { pool } = require('../data/db');
const { comparePassword, hashPassword } = require('../utils/authUtils');

const getProfile = async (req, res) => {
    const { rows } = await pool.query('SELECT id, name, email, role, created_at FROM users WHERE id = $1', [req.auth.userId]);
    const user = rows[0];

    res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.created_at
    });
};

const updateProfile = async (req, res) => {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [req.auth.userId]);
    const user = rows[0];
    const { name, email, password, currentPassword } = req.body;

    if (password !== undefined) {
        if (!currentPassword) {
            res.status(400).json({ statusCode: 400, message: 'Debes informar la contrasena actual.' });
            return;
        }

        const validCurrentPassword = await comparePassword(String(currentPassword), user.password);
        if (!validCurrentPassword) {
            res.status(400).json({ statusCode: 400, message: 'Contrasena actual incorrecta.' });
            return;
        }

        if (String(password).length < 6) {
            res.status(400).json({ statusCode: 400, message: 'La nueva contrasena debe tener al menos 6 caracteres.' });
            return;
        }

        const hashedPw = await hashPassword(String(password));
        await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPw, user.id]);
        res.json({ statusCode: 200, message: 'Contrasena actualizada.' });
        return;
    }

    if (!name || !email) {
        res.status(400).json({ statusCode: 400, message: 'Nombre y email son obligatorios.' });
        return;
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const { rows: dupRows } = await pool.query('SELECT id FROM users WHERE LOWER(email) = $1 AND id != $2', [normalizedEmail, user.id]);

    if (dupRows.length > 0) {
        res.status(400).json({ statusCode: 400, message: 'Ese email ya esta en uso.' });
        return;
    }

    const { rows: updated } = await pool.query(
        'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING id, name, email, role',
        [String(name).trim(), normalizedEmail, user.id]
    );

    res.json({
        statusCode: 200,
        message: 'Perfil actualizado.',
        user: updated[0]
    });
};

module.exports = {
    getProfile,
    updateProfile
};
