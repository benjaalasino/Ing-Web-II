const { db, getNextId } = require('../data/db');
const { comparePassword, hashPassword, signToken } = require('../utils/authUtils');

const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.status(400).json({ statusCode: 400, message: 'Nombre, email y password son obligatorios.' });
        return;
    }

    if (String(name).trim().length < 2) {
        res.status(400).json({ statusCode: 400, message: 'El nombre debe tener al menos 2 caracteres.' });
        return;
    }

    if (String(password).length < 6) {
        res.status(400).json({ statusCode: 400, message: 'La contrasena debe tener al menos 6 caracteres.' });
        return;
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const alreadyExists = db.users.some((user) => user.email.toLowerCase() === normalizedEmail);

    if (alreadyExists) {
        res.status(400).json({ statusCode: 400, message: 'El email ya esta registrado.' });
        return;
    }

    const newUser = {
        id: getNextId('users'),
        name: String(name).trim(),
        email: normalizedEmail,
        password: await hashPassword(String(password)),
        role: 'user',
        createdAt: new Date().toISOString()
    };

    db.users.push(newUser);
    res.status(201).json({
        statusCode: 201,
        message: 'Cuenta creada correctamente.'
    });
};

const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ statusCode: 400, message: 'Email y password son obligatorios.' });
        return;
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = db.users.find((item) => item.email.toLowerCase() === normalizedEmail);

    if (!user) {
        res.status(401).json({ statusCode: 401, message: 'Credenciales invalidas.' });
        return;
    }

    const isValidPassword = await comparePassword(String(password), user.password);
    if (!isValidPassword) {
        res.status(401).json({ statusCode: 401, message: 'Credenciales invalidas.' });
        return;
    }

    const accessToken = signToken({ userId: user.id, role: user.role, name: user.name });

    res.json({
        access_token: accessToken,
        role: user.role,
        userId: user.id,
        name: user.name
    });
};

module.exports = {
    register,
    login
};
