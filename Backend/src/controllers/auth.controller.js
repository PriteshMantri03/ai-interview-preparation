const userModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const tokenBlacklistModel = require("../models/blacklist.model");

const isProduction = process.env.NODE_ENV === "production";

const cookieOptions = {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000,
    path: "/"
};

/**
 * @name registerUserController
 * @description register a new user, expects username, email and password in request body
 * @access Public
 */
async function registerUserController(req, res) {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({
            message: "Please provide username, email and password."
        });
    }

    const trimmedUsername = username.trim();
    const trimmedEmail = email.trim().toLowerCase();

    const isUserAlreadyExists = await userModel.findOne({
        $or: [{ username: trimmedUsername }, { email: trimmedEmail }]
    });

    if (isUserAlreadyExists) {
        return res.status(400).json({
            message: "An account already exists with this email address or username."
        });
    }

    const hash = await bcrypt.hash(password, 10);

    const user = await userModel.create({
        username: trimmedUsername,
        email: trimmedEmail,
        password: hash
    });

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    res.cookie("token", token, cookieOptions);

    res.status(201).json({
        message: "User registered successfully.",
        token,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    });
}

/**
 * @name loginUserController
 * @description login a user, expects email and password in request body
 * @access Public
 */
async function loginUserController(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Please provide email and password."
        });
    }

    const trimmedEmail = email.trim().toLowerCase();

    const user = await userModel.findOne({ email: trimmedEmail });
    if (!user) {
        return res.status(400).json({
            message: "Invalid email or password."
        });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        return res.status(400).json({
            message: "Invalid email or password."
        });
    }

    const token = jwt.sign(
        { id: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );

    res.cookie("token", token, cookieOptions);

    res.status(200).json({
        message: "User logged in successfully.",
        token,
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    });
}

/**
 * @name logoutUserController
 * @description clear token from cookies and blacklist it
 * @access Public
 */
async function logoutUserController(req, res) {
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader && authHeader.toLowerCase().startsWith("bearer ")
        ? authHeader.slice(7).trim()
        : null;
    const token = bearerToken || req.cookies?.token;

    if (token) {
        try {
            await tokenBlacklistModel.create({ token });
        } catch (e) {
            // ignore if already blacklisted
        }
    }

    res.clearCookie("token", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        path: "/"
    });

    res.status(200).json({
        message: "User logged out successfully."
    });
}

/**
 * @name getMeController
 * @description get current logged-in user details
 * @access Private
 */
async function getMeController(req, res) {
    const user = await userModel.findById(req.user.id).select("-password");

    if (!user) {
        return res.status(404).json({
            message: "User not found."
        });
    }

    res.status(200).json({
        message: "User details fetched successfully.",
        user: {
            id: user._id,
            username: user.username,
            email: user.email
        }
    });
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
};
