const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/blacklist.model");

async function authUser(req, res, next) {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader && authHeader.toLowerCase().startsWith("bearer ")
        ? authHeader.slice(7).trim()
        : null;

    // Support Bearer token, cookie token, or query param token (used for direct browser tab links)
    const token = bearerToken || req.cookies?.token || req.query?.token;

    if (!token) {
        return res.status(401).json({
            message: "Authentication token not provided."
        });
    }

    try {
        const isTokenBlacklisted = await tokenBlacklistModel.findOne({ token });
        if (isTokenBlacklisted) {
            return res.status(401).json({
                message: "Authentication token has been revoked."
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({
            message: "Invalid or expired authentication token."
        });
    }
}

module.exports = { authUser };
