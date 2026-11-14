const express = require("express");
const cookieParser = require("cookie-parser")
const cors = require("cors")

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

// Routes
const authRouter = require("./routes/auth.routes");
const interviewRouter = require("./routes/interview.routes")


// Register and Login APIs
app.use("/api/auth", authRouter);
app.use("/api/interview", interviewRouter)

module.exports = app;
