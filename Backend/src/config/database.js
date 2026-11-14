// const mongoose = require("mongoose")



// async function connectToDB() {

//     try {
//         await mongoose.connect(process.env.MONGO_URI)

//         console.log("Connected to Database")
//     }
//     catch (err) {
//         console.log(err)
//     }
// }

// module.exports = connectToDB

const mongoose = require("mongoose");
const dns = require("node:dns");

// Use reliable DNS servers
dns.setServers(["8.8.8.8", "1.1.1.1"]);

const connectToDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB Connected Successfully");
    } catch (error) {
        console.error("MongoDB Connection Error:", error);
        process.exit(1);
    }
};

module.exports = connectToDB;