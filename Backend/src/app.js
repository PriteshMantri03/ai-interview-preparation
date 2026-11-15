const express = require("express");
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
const allowedOrigins = [
    "http://localhost:5173",
    ...(process.env.FRONTEND_URL || "").split(",")
].map(origin => origin.trim().replace(/\/$/, "")).filter(Boolean);

app.use(cors({
    origin(origin, callback) {
        // Requests without an Origin header (health checks and server-to-server calls) are allowed.
        if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) return callback(null, true);
        return callback(new Error("Origin is not allowed by CORS"));
    },
    credentials: true
}));

app.get("/health", (_req, res) => res.status(200).json({ status: "ok" }));

// Routes
const authRouter = require("./routes/auth.routes");
const interviewRouter = require("./routes/interview.routes")


// Register and Login APIs
app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter)

app.use((error, _req, res, _next) => {
    console.error("Request failed:", error);
    const status = error.status || error.statusCode || 500;
    res.status(status).json({
        message: status >= 500 ? "The server could not complete the request." : error.message
    });
});

module.exports = app;
