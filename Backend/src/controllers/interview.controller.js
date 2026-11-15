const pdfParse = require("pdf-parse");
const {
    generateInterviewReport,
    generateResumeHtml,
    generatePdfFromHtml
} = require("../services/ai.service");
const interviewReportModel = require("../models/interviewReport.model");

/**
 * @description Controller to generate interview report based on user self description, resume and job description.
 */
async function generateInterViewReportController(req, res) {
    const { selfDescription, jobDescription } = req.body;

    if (!req.file && !selfDescription?.trim()) {
        return res.status(400).json({ message: "Please upload a PDF resume or enter a self-description." });
    }
    if (!jobDescription?.trim()) {
        return res.status(400).json({ message: "Please provide a target job description." });
    }

    let resumeContent = "";
    if (req.file) {
        try {
            const parsed = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText();
            resumeContent = parsed.text || "";
        } catch (pdfErr) {
            console.error("PDF parsing error:", pdfErr);
            return res.status(400).json({ message: "Could not read text from uploaded PDF. Please ensure it is a valid PDF." });
        }
    }

    try {
        const interViewReportByAi = await generateInterviewReport({
            resume: resumeContent,
            selfDescription: selfDescription || "",
            jobDescription
        });

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeContent,
            selfDescription: selfDescription || "",
            jobDescription,
            ...interViewReportByAi,
            title: interViewReportByAi.title || "Interview Preparation Report"
        });

        res.status(201).json({
            message: "Interview report generated successfully.",
            interviewReport
        });
    } catch (aiErr) {
        console.error("AI report generation failed:", aiErr);
        res.status(500).json({
            message: aiErr.message || "Failed to generate report with AI. Check API key and try again."
        });
    }
}

/**
 * @description Controller to get interview report by interviewId.
 */
async function getInterviewReportByIdController(req, res) {
    const { interviewId } = req.params;

    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user.id });

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        });
    }

    res.status(200).json({
        message: "Interview report fetched successfully.",
        interviewReport
    });
}

/**
 * @description Controller to get all interview reports of logged in user.
 */
async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel
        .find({ user: req.user.id })
        .sort({ createdAt: -1 })
        .select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan -generatedResumeHtml");

    res.status(200).json({
        message: "Interview reports fetched successfully.",
        interviewReports
    });
}

/**
 * @description Controller to retrieve or generate the HTML resume
 */
async function getResumeHtmlController(req, res) {
    const { interviewReportId } = req.params;

    const interviewReport = await interviewReportModel.findOne({ _id: interviewReportId, user: req.user.id });

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        });
    }

    if (interviewReport.generatedResumeHtml) {
        return res.status(200).json({
            message: "Resume HTML retrieved.",
            html: interviewReport.generatedResumeHtml
        });
    }

    try {
        const { resume, jobDescription, selfDescription } = interviewReport;
        const html = await generateResumeHtml({ resume, jobDescription, selfDescription });

        interviewReport.generatedResumeHtml = html;
        await interviewReport.save();

        res.status(200).json({
            message: "Resume HTML generated successfully.",
            html
        });
    } catch (err) {
        console.error("Resume HTML generation error:", err);
        res.status(500).json({
            message: err.message || "Failed to generate resume with AI."
        });
    }
}

/**
 * @description Direct browser view for resume with one-click print button
 */
async function viewResumeHtmlController(req, res) {
    const { interviewReportId } = req.params;

    const interviewReport = await interviewReportModel.findOne({ _id: interviewReportId, user: req.user.id });

    if (!interviewReport) {
        return res.status(404).send("Interview report not found.");
    }

    let html = interviewReport.generatedResumeHtml;
    if (!html) {
        try {
            const { resume, jobDescription, selfDescription } = interviewReport;
            html = await generateResumeHtml({ resume, jobDescription, selfDescription });
            interviewReport.generatedResumeHtml = html;
            await interviewReport.save();
        } catch (err) {
            return res.status(500).send(`Failed to generate resume: ${err.message}`);
        }
    }

    // Inject a clean print toolbar
    const toolbar = `
    <div id="print-toolbar" style="position:fixed;top:15px;right:20px;z-index:999999;display:flex;gap:10px;background:#161b22;padding:8px 14px;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,0.3);font-family:system-ui,-apple-system,sans-serif;">
        <button onclick="window.print()" style="background:#ff2d78;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-weight:600;font-size:14px;display:flex;align-items:center;gap:6px;">
            🖨️ Print / Save as PDF
        </button>
        <button onclick="window.close()" style="background:#2a3348;color:#e6edf3;border:none;padding:8px 14px;border-radius:6px;cursor:pointer;font-size:14px;">
            Close
        </button>
    </div>
    <style>
    @media print {
        #print-toolbar { display: none !important; }
    }
    </style>
    `;

    const fullHtml = html.includes("</body>")
        ? html.replace("</body>", `${toolbar}</body>`)
        : `${html}${toolbar}`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(fullHtml);
}

/**
 * @description Controller to generate resume PDF based on user self description, resume and job description.
 */
async function generateResumePdfController(req, res) {
    const { interviewReportId } = req.params;

    const interviewReport = await interviewReportModel.findOne({ _id: interviewReportId, user: req.user.id });

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found."
        });
    }

    let html = interviewReport.generatedResumeHtml;
    if (!html) {
        try {
            const { resume, jobDescription, selfDescription } = interviewReport;
            html = await generateResumeHtml({ resume, jobDescription, selfDescription });
            interviewReport.generatedResumeHtml = html;
            await interviewReport.save();
        } catch (aiErr) {
            console.error("Resume AI generation error:", aiErr);
            return res.status(500).json({
                message: "Failed to generate resume content with AI. Please try again."
            });
        }
    }

    try {
        const pdfBuffer = await generatePdfFromHtml(html);

        res.set({
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename=resume_${interviewReportId}.pdf`
        });

        res.send(pdfBuffer);
    } catch (pdfErr) {
        console.error("Puppeteer PDF generation failed on host:", pdfErr.message);

        // Return a 422 with the generated HTML so the frontend can offer direct in-browser print/PDF
        return res.status(422).json({
            message: "Server-side PDF renderer unavailable. Please use 'Preview & Print Resume' to save as PDF directly from your browser.",
            html
        });
    }
}

module.exports = {
    generateInterViewReportController,
    getInterviewReportByIdController,
    getAllInterviewReportsController,
    getResumeHtmlController,
    viewResumeHtmlController,
    generateResumePdfController
};
