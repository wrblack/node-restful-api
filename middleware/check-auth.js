const jwt = require('jsonwebtoken');

const JWT_KEY = 'super-secret';

module.exports = (req, res, next) => {
    try {
        // "Bearer <actual token>"
        // Split removes the "Bearer " substring
        const token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, JWT_KEY);
        req.userData = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Auth failed.' });
    }
};