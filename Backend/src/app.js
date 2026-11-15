require("dotenv").config();
const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:4173",
    ...(process.env.FRONTEND_URL || "").split(",")
].map(origin => origin.trim().replace(/\/$/, "")).filter(Boolean);

app.use(cors({
    origin(origin, callback) {
        // Requests without an Origin header (health checks, server-to-server, curl)
        if (!origin) return callback(null, true);

        const cleanOrigin = origin.replace(/\/$/, "");

        // Allow localhost and local IP addresses on any port
        if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(cleanOrigin)) {
            return callback(null, true);
        }

        // Allow any Vercel deployment (preview branches, production domains)
        if (/^https:\/\/[a-zA-Z0-9_\-.]+\.vercel\.app$/.test(cleanOrigin)) {
            return callback(null, true);
        }

        // Allow explicitly listed frontend URLs
        if (allowedOrigins.includes(cleanOrigin) || process.env.FRONTEND_URL === "*") {
            return callback(null, true);
        }

        // Reject cleanly without crashing Express
        return callback(null, false);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

// Routes
const authRouter = require("./routes/auth.routes");
const interviewRouter = require("./routes/interview.routes");

app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter);

app.use((error, _req, res, _next) => {
    console.error("Request failed:", error);
    const status = error.status || error.statusCode || 500;
    res.status(status).json({
        message: status >= 500 ? (error.message || "The server could not complete the request.") : error.message
    });
});

module.exports = app;
