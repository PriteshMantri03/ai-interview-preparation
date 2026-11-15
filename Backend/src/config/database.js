const mongoose = require("mongoose");
const dns = require("node:dns");

// Apply custom DNS only if explicitly requested in environment variables
if (process.env.CUSTOM_DNS) {
    try {
        dns.setServers(process.env.CUSTOM_DNS.split(",").map(s => s.trim()));
    } catch (e) {
        console.warn("Could not apply CUSTOM_DNS:", e.message);
    }
}

const connectToDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI environment variable is missing.");
        }

        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected Successfully");
    } catch (error) {
        console.error("MongoDB Connection Error:", error);

        // If DNS SRV lookup failed (common on some local ISPs like Jio/Airtel),
        // try fallback to public Google/Cloudflare DNS once before giving up
        if (error.message && (error.message.includes("querySrv") || error.message.includes("ENOTFOUND"))) {
            console.log("Attempting MongoDB connection with fallback DNS servers (8.8.8.8, 1.1.1.1)...");
            try {
                dns.setServers(["8.8.8.8", "1.1.1.1"]);
                await mongoose.connect(process.env.MONGO_URI);
                console.log("MongoDB Connected Successfully via fallback DNS");
                return;
            } catch (fallbackError) {
                console.error("Fallback MongoDB Connection Error:", fallbackError);
            }
        }

        process.exit(1);
    }
};

module.exports = connectToDB;
