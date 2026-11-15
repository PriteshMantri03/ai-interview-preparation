const multer = require("multer");

const upload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (_req, file, callback) => {
        if (file.mimetype !== "application/pdf") {
            const error = new Error("Resume must be a PDF file.");
            error.status = 400;
            return callback(error);
        }
        callback(null, true);
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

module.exports = upload;
