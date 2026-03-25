const { db } = require('../data/db');
const { comparePassword, hashPassword } = require('../utils/authUtils');

const getProfile = (req, res) => {
    const user = db.users.find((item) => item.id === req.auth.userId);

    res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
    });
};

const updateProfile = async (req, res) => {
    const user = db.users.find((item) => item.id === req.auth.userId);
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

        user.password = await hashPassword(String(password));
        res.json({ statusCode: 200, message: 'Contrasena actualizada.' });
        return;
    }

    if (!name || !email) {
        res.status(400).json({ statusCode: 400, message: 'Nombre y email son obligatorios.' });
        return;
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const duplicatedEmail = db.users.some((item) => item.id !== user.id && item.email.toLowerCase() === normalizedEmail);

    if (duplicatedEmail) {
        res.status(400).json({ statusCode: 400, message: 'Ese email ya esta en uso.' });
        return;
    }

    user.name = String(name).trim();
    user.email = normalizedEmail;

    res.json({
        statusCode: 200,
        message: 'Perfil actualizado.',
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
        }
    });
};

module.exports = {
    getProfile,
    updateProfile
};
