const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Invalid token.'
        });
    }
};

const optionalAuthMiddleware = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
        }
    } catch (error) {
        req.user = null;
    }
    next();
};

const adminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin privileges required.'
        });
    }
    next();
};

const companyMiddleware = (req, res, next) => {
    if (req.user.role !== 'company') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Company privileges required.'
        });
    }
    next();
};

const companyOrAdminMiddleware = (req, res, next) => {
    if (req.user.role !== 'admin' && req.user.role !== 'company') {
        return res.status(403).json({
            success: false,
            message: 'Access denied. Admin or company privileges required.'
        });
    }
    next();
};

module.exports = { authMiddleware, optionalAuthMiddleware, adminMiddleware, companyMiddleware, companyOrAdminMiddleware };
