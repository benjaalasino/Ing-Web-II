const crypto = require('crypto');
const { pool } = require('../data/db');
const { comparePassword, hashPassword, signToken } = require('../utils/authUtils');
const { sendVerificationCode } = require('../services/emailService');

const generateCode = () => crypto.randomInt(100000, 999999).toString();

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
    const { rows: existing } = await pool.query('SELECT id FROM users WHERE LOWER(email) = $1', [normalizedEmail]);

    if (existing.length > 0) {
        res.status(400).json({ statusCode: 400, message: 'El email ya esta registrado.' });
        return;
    }

    const hashedPw = await hashPassword(String(password));
    const code = generateCode();
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await pool.query(
        `INSERT INTO users (name, email, password, role, email_verified, verification_token, verification_token_expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [String(name).trim(), normalizedEmail, hashedPw, 'user', false, code, tokenExpires]
    );

    try {
        await sendVerificationCode(normalizedEmail, code);
    } catch (err) {
        console.error('[Register] Failed to send verification code:', err.message);
    }

    res.status(201).json({
        statusCode: 201,
        message: 'Cuenta creada. Te enviamos un código de 6 dígitos a tu email.',
        email: normalizedEmail
    });
};

const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ statusCode: 400, message: 'Email y password son obligatorios.' });
        return;
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const { rows } = await pool.query('SELECT * FROM users WHERE LOWER(email) = $1', [normalizedEmail]);
    const user = rows[0];

    if (!user) {
        res.status(401).json({ statusCode: 401, message: 'Credenciales invalidas.' });
        return;
    }

    const isValidPassword = await comparePassword(String(password), user.password);
    if (!isValidPassword) {
        res.status(401).json({ statusCode: 401, message: 'Credenciales invalidas.' });
        return;
    }

    if (!user.email_verified) {
        res.status(403).json({
            statusCode: 403,
            message: 'Debés verificar tu email antes de ingresar. Revisá tu casilla o solicitá un nuevo código.',
            unverified: true,
            email: user.email
        });
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

const verifyEmail = async (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
        res.status(400).json({ statusCode: 400, message: 'Email y código son obligatorios.' });
        return;
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const { rows } = await pool.query(
        'SELECT id, email_verified, verification_token, verification_token_expires_at FROM users WHERE LOWER(email) = $1',
        [normalizedEmail]
    );
    const user = rows[0];

    if (!user) {
        res.status(400).json({ statusCode: 400, message: 'Código incorrecto.' });
        return;
    }

    if (user.email_verified) {
        res.status(200).json({ statusCode: 200, message: 'Tu email ya fue verificado. Podés iniciar sesión.' });
        return;
    }

    if (new Date(user.verification_token_expires_at) < new Date()) {
        res.status(400).json({ statusCode: 400, message: 'El código expiró. Solicitá uno nuevo.' });
        return;
    }

    if (String(code).trim() !== user.verification_token) {
        res.status(400).json({ statusCode: 400, message: 'Código incorrecto.' });
        return;
    }

    await pool.query(
        'UPDATE users SET email_verified = TRUE, verification_token = NULL, verification_token_expires_at = NULL WHERE id = $1',
        [user.id]
    );

    res.status(200).json({ statusCode: 200, message: 'Email verificado correctamente. Ya podés iniciar sesión.' });
};

const resendVerification = async (req, res) => {
    const { email } = req.body;
    const genericMessage = 'Si el email existe en nuestro sistema, te enviamos un nuevo código de verificación.';

    if (!email) {
        res.status(200).json({ statusCode: 200, message: genericMessage });
        return;
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const { rows } = await pool.query('SELECT id, email_verified FROM users WHERE LOWER(email) = $1', [normalizedEmail]);
    const user = rows[0];

    if (!user || user.email_verified) {
        res.status(200).json({ statusCode: 200, message: genericMessage });
        return;
    }

    const code = generateCode();
    const tokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await pool.query(
        'UPDATE users SET verification_token = $1, verification_token_expires_at = $2 WHERE id = $3',
        [code, tokenExpires, user.id]
    );

    try {
        await sendVerificationCode(normalizedEmail, code);
    } catch (err) {
        console.error('[Email] Failed to send verification code:', err.message);
    }

    res.status(200).json({ statusCode: 200, message: genericMessage });
};

module.exports = {
    register,
    login,
    verifyEmail,
    resendVerification
};
