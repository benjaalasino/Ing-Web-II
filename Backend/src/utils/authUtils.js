const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/env');

const signToken = ({ userId, role, name }) => {
    return jwt.sign({ userId, role, name }, jwtSecret, { expiresIn: '12h' });
};

const verifyToken = (token) => {
    return jwt.verify(token, jwtSecret);
};

const hashPassword = async (password) => {
    return bcrypt.hash(password, 10);
};

const comparePassword = async (password, hashedPassword) => {
    return bcrypt.compare(password, hashedPassword);
};

module.exports = {
    signToken,
    verifyToken,
    hashPassword,
    comparePassword
};
