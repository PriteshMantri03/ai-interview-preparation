const { z } = require("zod");
const puppeteer = require("puppeteer");
const Groq = require("groq-sdk");

function getGroqClient() {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        throw new Error("GROQ_API_KEY environment variable is missing. Please set it in your environment variables.");
    }
    return new Groq({ apiKey });
}

// Zod schema for validation
const interviewReportSchema = z.object({
    matchScore: z.number().min(0).max(100),

    technicalQuestions: z.array(z.object({
        question: z.string(),
        intention: z.string(),
        answer: z.string()
    })).length(4),

    behavioralQuestions: z.array(z.object({
        question: z.string(),
        intention: z.string(),
        answer: z.string()
    })).length(2),

    skillGaps: z.array(z.object({
        skill: z.string(),
        severity: z.enum(["low", "medium", "high"])
    })),

    preparationPlan: z.array(z.object({
        day: z.number().int().min(1).max(7),
        focus: z.string(),
        tasks: z.array(z.string()).min(2)
    })).length(7),

    title: z.string().min(1)
});

const GROQ_REPORT_SCHEMA = {
    type: "object",
    properties: {
        matchScore: {
            type: "number"
        },
        technicalQuestions: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    question: { type: "string" },
                    intention: { type: "string" },
                    answer: { type: "string" }
                },
                required: ["question", "intention", "answer"],
                additionalProperties: false
            }
        },
        behavioralQuestions: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    question: { type: "string" },
                    intention: { type: "string" },
                    answer: { type: "string" }
                },
                required: ["question", "intention", "answer"],
                additionalProperties: false
            }
        },
        skillGaps: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    skill: { type: "string" },
                    severity: {
                        type: "string",
                        enum: ["low", "medium", "high"]
                    }
                },
                required: ["skill", "severity"],
                additionalProperties: false
            }
        },
        preparationPlan: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    day: { type: "integer" },
                    focus: { type: "string" },
                    tasks: {
                        type: "array",
                        items: { type: "string" }
                    }
                },
                required: ["day", "focus", "tasks"],
                additionalProperties: false
            }
        },
        title: {
            type: "string"
        }
    },
    required: [
        "matchScore",
        "technicalQuestions",
        "behavioralQuestions",
        "skillGaps",
        "preparationPlan",
        "title"
    ],
    additionalProperties: false
};

const AI_MODEL = process.env.GROQ_MODEL || "openai/gpt-oss-120b";

/**
 * Generate interview report using Groq
 */
async function generateInterviewReport({
    resume,
    selfDescription,
    jobDescription
}) {
    const prompt = `Generate an interview report for a candidate with the following details:

Resume: ${resume || "Not provided"}

Self Description: ${selfDescription || "Not provided"}

Job Description: ${jobDescription}

STRICT REQUIREMENTS:
1. Generate exactly 4 technical questions.
2. Generate exactly 2 behavioral questions.
3. Every question must contain question, intention and answer.
4. Identify relevant skill gaps with severity.
5. Generate exactly 7 days in the preparation roadmap.
6. Every day must contain a focus and at least 2 tasks.
7. Match score must be between 0 and 100.
8. Generate a meaningful job-specific title.
9. Do not invent candidate experience or skills.
10. Make questions relevant to the given job description.
`;

    const groq = getGroqClient();
    const response = await groq.chat.completions.create({
        model: AI_MODEL,
        messages: [
            {
                role: "system",
                content: "You are an expert technical interviewer and career coach. Generate accurate and useful interview preparation reports."
            },
            {
                role: "user",
                content: prompt
            }
        ],
        response_format: {
            type: "json_schema",
            json_schema: {
                name: "interview_report",
                strict: true,
                schema: GROQ_REPORT_SCHEMA
            }
        }
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
        throw new Error("Groq returned an empty response.");
    }

    const generatedReport = JSON.parse(content);
    return interviewReportSchema.parse(generatedReport);
}

/**
 * Generate tailored ATS-friendly HTML resume using Groq
 */
async function generateResumeHtml({
    resume,
    selfDescription,
    jobDescription
}) {
    const prompt = `
You are an expert resume designer and HTML/CSS developer.

Generate a professional ATS-friendly resume using the candidate information below.

CANDIDATE RESUME:
${resume || "Not provided"}

SELF DESCRIPTION:
${selfDescription || "Not provided"}

JOB DESCRIPTION:
${jobDescription}

CONTENT RULES:
1. Tailor the resume to the target job description.
2. Never invent skills, experience, education or achievements.
3. Preserve genuine projects, technical skills and achievements.
4. Use concise, natural, professional language.
5. Avoid duplicate information.
6. Keep the resume ideally within 1-2 A4 pages.
7. Do not remove important candidate information.

DESIGN REFERENCE:
Create a resume with a clean, compact, professional design similar to a traditional modern software engineer resume.

STRICT LAYOUT RULES:
1. Use SINGLE COLUMN layout throughout.
2. Never use two-column layouts.
3. Never use CSS Grid or multi-column layouts.
4. Never use flex-direction: row for the main resume content.
5. Do not use justify-content: space-between to distribute sections vertically.
6. Use normal document flow.
7. Keep all sections aligned to the left.
8. Put candidate name at the top in bold, prominent text.
9. Put contact information in one compact row below the name.
10. Section headings should have a thin horizontal bottom border.
11. Keep section headings close to their content.
12. Project titles, technology stacks and descriptions should remain compact.
13. Use small, consistent bullet spacing.
14. Avoid unnecessary empty spaces between sections.
15. Do not use fixed heights, min-height or 100vh.
16. Do not use absolute or fixed positioning.
17. Do not use empty divs or unnecessary br tags.
18. Do not insert manual page breaks.
19. Do not vertically stretch content to fill pages.
20. Keep project headings together with their bullet descriptions.

TYPOGRAPHY:
- Font: Arial, Helvetica, sans-serif.
- Body font: 10pt.
- Main name: 22pt bold.
- Section headings: 13pt bold.
- Project headings: 10.5pt bold.
- Body line-height: 1.35.
- Compact and consistent margins.
- Professional dark colors (#111, #333) with subtle accents.
- White background.

SECTION ORDER:
1. Name and Contact Information
2. Professional Summary
3. Education
4. Technical Skills
5. Work Experience & Projects
6. Achievements and Leadership
7. Certifications

PAGE SETTINGS:
- Paper: A4.
- Margin: 12mm vertical, 14mm horizontal.
- Allow natural content flow across pages.

OUTPUT RULES:
Return ONLY valid HTML5 starting with <!DOCTYPE html> and ending with </html>.
Do not wrap in Markdown code blocks (no \`\`\`html or \`\`\`).
Do not add conversational text or commentary.
`;

    const groq = getGroqClient();
    const response = await groq.chat.completions.create({
        model: AI_MODEL,
        messages: [
            {
                role: "system",
                content: "You are a professional resume layout designer. Always generate clean, compact, ATS-friendly single-column HTML resumes."
            },
            {
                role: "user",
                content: prompt
            }
        ],
        temperature: 0.2,
        max_completion_tokens: 12000
    });

    let htmlContent = response.choices[0]?.message?.content;
    if (!htmlContent) {
        throw new Error("Groq returned an empty resume response.");
    }

    htmlContent = htmlContent
        .replace(/^```html\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

    if (!htmlContent.toLowerCase().includes("<!doctype html") && !htmlContent.toLowerCase().includes("<html")) {
        // Wrap with html boilerplate if missing
        htmlContent = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Resume</title><style>body{font-family:Arial,sans-serif;padding:20px;}</style></head><body>${htmlContent}</body></html>`;
    }

    return htmlContent;
}

/**
 * Generate PDF buffer from HTML string using Puppeteer
 */
async function generatePdfFromHtml(htmlContent) {
    const launchOptions = {
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--no-first-run",
            "--no-zygote",
            "--single-process"
        ]
    };

    if (process.env.PUPPETEER_EXECUTABLE_PATH) {
        launchOptions.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
    }

    const browser = await puppeteer.launch(launchOptions);

    try {
        const page = await browser.newPage();

        await page.setViewport({
            width: 794,
            height: 1123,
            deviceScaleFactor: 1
        });

        // Clean any code fences
        const cleanHtml = htmlContent
            .replace(/^```html\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/\s*```$/i, "")
            .trim();

        await page.setContent(cleanHtml, {
            waitUntil: "networkidle0"
        });

        await page.emulateMediaType("print");

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            preferCSSPageSize: true,
            displayHeaderFooter: false,
            scale: 1,
            margin: {
                top: "12mm",
                bottom: "12mm",
                left: "14mm",
                right: "14mm"
            }
        });

        return pdfBuffer;
    } finally {
        await browser.close();
    }
}

/**
 * Combined function to generate PDF from candidate data
 */
async function generateResumePdf({
    resume,
    selfDescription,
    jobDescription
}) {
    const htmlContent = await generateResumeHtml({ resume, selfDescription, jobDescription });
    return await generatePdfFromHtml(htmlContent);
}

module.exports = {
    generateInterviewReport,
    generateResumeHtml,
    generatePdfFromHtml,
    generateResumePdf
};
