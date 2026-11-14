require("dotenv").config();

const app = require("./src/app");
const connectToDB = require("./src/config/database.js");

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await connectToDB();

        app.listen(PORT, "0.0.0.0", () => {
            console.log(`Server is running on port ${PORT}`);
        });

    } catch (error) {
        console.error("Server startup failed:", error);
        process.exit(1);
    }
}

startServer();