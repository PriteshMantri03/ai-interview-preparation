// // const { GoogleGenAI } = require("@google/genai")
// // const { z } = require("zod")
// // const { zodToJsonSchema } = require("zod-to-json-schema")
// // const puppeteer = require("puppeteer")

// // const Groq = require("groq-sdk");
// // const groq = new Groq({
// //     apiKey: process.env.GROQ_API_KEY
// // });

// // const ai = new GoogleGenAI({
// //     apiKey: process.env.GOOGLE_GENAI_API_KEY,
// //     httpOptions: {
// //         apiVersion: "v1beta"
// //     }
// // });


// // const interviewReportSchema = z.object({
// //     matchScore: z.number().min(0).max(100),

// //     technicalQuestions: z.array(z.object({
// //         question: z.string(),
// //         intention: z.string(),
// //         answer: z.string()
// //     })).min(4),

// //     behavioralQuestions: z.array(z.object({
// //         question: z.string(),
// //         intention: z.string(),
// //         answer: z.string()
// //     })).min(2),

// //     skillGaps: z.array(z.object({
// //         skill: z.string(),
// //         severity: z.enum(["low", "medium", "high"])
// //     })),

// //     preparationPlan: z.array(z.object({
// //         day: z.number().int().min(1).max(7),
// //         focus: z.string(),
// //         tasks: z.array(z.string()).min(2)
// //     })).length(7),

// //     title: z.string().min(1)
// // });

// // const GROQ_REPORT_SCHEMA = {
// //     type: "object",
// //     properties: {
// //         matchScore: { type: "number" },

// //         technicalQuestions: {
// //             type: "array",
// //             items: {
// //                 type: "object",
// //                 properties: {
// //                     question: { type: "string" },
// //                     intention: { type: "string" },
// //                     answer: { type: "string" }
// //                 },
// //                 required: ["question", "intention", "answer"],
// //                 additionalProperties: false
// //             }
// //         },

// //         behavioralQuestions: {
// //             type: "array",
// //             items: {
// //                 type: "object",
// //                 properties: {
// //                     question: { type: "string" },
// //                     intention: { type: "string" },
// //                     answer: { type: "string" }
// //                 },
// //                 required: ["question", "intention", "answer"],
// //                 additionalProperties: false
// //             }
// //         },

// //         skillGaps: {
// //             type: "array",
// //             items: {
// //                 type: "object",
// //                 properties: {
// //                     skill: { type: "string" },
// //                     severity: {
// //                         type: "string",
// //                         enum: ["low", "medium", "high"]
// //                     }
// //                 },
// //                 required: ["skill", "severity"],
// //                 additionalProperties: false
// //             }
// //         },

// //         preparationPlan: {
// //             type: "array",
// //             items: {
// //                 type: "object",
// //                 properties: {
// //                     day: { type: "integer" },
// //                     focus: { type: "string" },
// //                     tasks: {
// //                         type: "array",
// //                         items: { type: "string" }
// //                     }
// //                 },
// //                 required: ["day", "focus", "tasks"],
// //                 additionalProperties: false
// //             }
// //         },

// //         title: { type: "string" }
// //     },

// //     required: [
// //         "matchScore",
// //         "technicalQuestions",
// //         "behavioralQuestions",
// //         "skillGaps",
// //         "preparationPlan",
// //         "title"
// //     ],

// //     additionalProperties: false
// // };



// // async function generateInterviewReport({
// //     resume,
// //     selfDescription,
// //     jobDescription
// // }) {

// //     const prompt = `
// // Generate a detailed interview preparation report.

// // RESUME:
// // ${resume}

// // SELF DESCRIPTION:
// // ${selfDescription}

// // JOB DESCRIPTION:
// // ${jobDescription}

// // STRICT REQUIREMENTS:

// // 1. Generate exactly 4 technical questions.
// // 2. Generate exactly 2 behavioral questions.
// // 3. Every question must contain question, intention and answer.
// // 4. Identify relevant skill gaps with severity.
// // 5. Generate exactly 7 days in the preparation roadmap.
// // 6. Every day must contain a focus and at least 2 tasks.
// // 7. Match score must be between 0 and 100.
// // 8. Generate a meaningful job-specific title.
// // 9. Do not invent candidate experience or skills.
// // 10. Make the questions relevant to the given job description.
// // `;

// //     const response = await groq.chat.completions.create({
// //         model: "openai/gpt-oss-120b",

// //         messages: [
// //             {
// //                 role: "system",
// //                 content: "You are an expert technical interviewer and career coach. Generate accurate, detailed and useful interview preparation reports."
// //             },
// //             {
// //                 role: "user",
// //                 content: prompt
// //             }
// //         ],

// //         response_format: {
// //             type: "json_schema",
// //             json_schema: {
// //                 name: "interview_report",
// //                 strict: true,
// //                 schema: GROQ_REPORT_SCHEMA
// //             }
// //         }
// //     });

// //     const content = response.choices[0]?.message?.content;

// //     if (!content) {
// //         throw new Error("Groq returned an empty response");
// //     }

// //     const generatedReport = JSON.parse(content);

// //     return interviewReportSchema.parse(generatedReport);
// // }


// // async function generatePdfFromHtml(htmlContent) {
// //     const browser = await puppeteer.launch()
// //     const page = await browser.newPage();
// //     await page.setContent(htmlContent, { waitUntil: "networkidle0" })

// //     const pdfBuffer = await page.pdf({
// //         format: "A4", margin: {
// //             top: "20mm",
// //             bottom: "20mm",
// //             left: "15mm",
// //             right: "15mm"
// //         }
// //     })

// //     await browser.close()

// //     return pdfBuffer
// // }

// // async function generateResumePdf({ resume, selfDescription, jobDescription }) {

// //     const resumePdfSchema = z.object({
// //         html: z.string()
// //     })

// //     const prompt = `Generate resume for a candidate with the following details:
// //                         Resume: ${resume}
// //                         Self Description: ${selfDescription}
// //                         Job Description: ${jobDescription}

// //                         the response should be a JSON object with a single field "html" which contains the HTML content of the resume which can be converted to PDF using any library like puppeteer.
// //                         The resume should be tailored for the given job description and should highlight the candidate's strengths and relevant experience. The HTML content should be well-formatted and structured, making it easy to read and visually appealing.
// //                         The content of resume should be not sound like it's generated by AI and should be as close as possible to a real human-written resume.
// //                         you can highlight the content using some colors or different font styles but the overall design should be simple and professional.
// //                         The content should be ATS friendly, i.e. it should be easily parsable by ATS systems without losing important information.
// //                         The resume should not be so lengthy, it should ideally be 1-2 pages long when converted to PDF. Focus on quality rather than quantity and make sure to include all the relevant information that can increase the candidate's chances of getting an interview call for the given job description.
// //                     `

// //     const response = await groq.chat.completions.create({
// //         model: "openai/gpt-oss-120b",

// //         messages: [
// //             {
// //                 role: "user",
// //                 content: prompt
// //             }
// //         ],

// //         response_format: {
// //             type: "json_schema",
// //             json_schema: {
// //                 name: "resume_pdf",
// //                 strict: true,
// //                 schema: {
// //                     type: "object",
// //                     properties: {
// //                         html: {
// //                             type: "string"
// //                         }
// //                     },
// //                     required: ["html"],
// //                     additionalProperties: false
// //                 }
// //             }
// //         }
// //     })

// //     const jsonContent = JSON.parse(response.choices[0].message.content)

// //     const validatedContent = resumePdfSchema.parse(jsonContent)

// //     const pdfBuffer = await generatePdfFromHtml(validatedContent.html)

// //     return pdfBuffer
// // }

// // module.exports = { generateInterviewReport, generateResumePdf }

// const { z } = require("zod");
// const puppeteer = require("puppeteer");

// const Groq = require("groq-sdk");

// const groq = new Groq({
//     apiKey: process.env.GROQ_API_KEY
// });


// const interviewReportSchema = z.object({
//     matchScore: z.number().min(0).max(100),

//     technicalQuestions: z.array(z.object({
//         question: z.string(),
//         intention: z.string(),
//         answer: z.string()
//     })).length(4),

//     behavioralQuestions: z.array(z.object({
//         question: z.string(),
//         intention: z.string(),
//         answer: z.string()
//     })).length(2),

//     skillGaps: z.array(z.object({
//         skill: z.string(),
//         severity: z.enum(["low", "medium", "high"])
//     })),

//     preparationPlan: z.array(z.object({
//         day: z.number().int().min(1).max(7),
//         focus: z.string(),
//         tasks: z.array(z.string()).min(2)
//     })).length(7),

//     title: z.string().min(1)
// });


// const GROQ_REPORT_SCHEMA = {
//     type: "object",
//     properties: {
//         matchScore: {
//             type: "number"
//         },

//         technicalQuestions: {
//             type: "array",
//             items: {
//                 type: "object",
//                 properties: {
//                     question: { type: "string" },
//                     intention: { type: "string" },
//                     answer: { type: "string" }
//                 },
//                 required: ["question", "intention", "answer"],
//                 additionalProperties: false
//             }
//         },

//         behavioralQuestions: {
//             type: "array",
//             items: {
//                 type: "object",
//                 properties: {
//                     question: { type: "string" },
//                     intention: { type: "string" },
//                     answer: { type: "string" }
//                 },
//                 required: ["question", "intention", "answer"],
//                 additionalProperties: false
//             }
//         },

//         skillGaps: {
//             type: "array",
//             items: {
//                 type: "object",
//                 properties: {
//                     skill: { type: "string" },
//                     severity: {
//                         type: "string",
//                         enum: ["low", "medium", "high"]
//                     }
//                 },
//                 required: ["skill", "severity"],
//                 additionalProperties: false
//             }
//         },

//         preparationPlan: {
//             type: "array",
//             items: {
//                 type: "object",
//                 properties: {
//                     day: { type: "integer" },
//                     focus: { type: "string" },
//                     tasks: {
//                         type: "array",
//                         items: { type: "string" }
//                     }
//                 },
//                 required: ["day", "focus", "tasks"],
//                 additionalProperties: false
//             }
//         },

//         title: {
//             type: "string"
//         }
//     },

//     required: [
//         "matchScore",
//         "technicalQuestions",
//         "behavioralQuestions",
//         "skillGaps",
//         "preparationPlan",
//         "title"
//     ],

//     additionalProperties: false
// };


// async function generateInterviewReport({
//     resume,
//     selfDescription,
//     jobDescription
// }) {

//     const prompt = `
// Generate a detailed interview preparation report.

// RESUME:
// ${resume}

// SELF DESCRIPTION:
// ${selfDescription}

// JOB DESCRIPTION:
// ${jobDescription}

// STRICT REQUIREMENTS:

// 1. Generate exactly 4 technical questions.
// 2. Generate exactly 2 behavioral questions.
// 3. Every question must contain question, intention and answer.
// 4. Identify relevant skill gaps with severity.
// 5. Generate exactly 7 days in the preparation roadmap.
// 6. Every day must contain a focus and at least 2 tasks.
// 7. Match score must be between 0 and 100.
// 8. Generate a meaningful job-specific title.
// 9. Do not invent candidate experience or skills.
// 10. Make the questions relevant to the given job description.
// `;

//     const response = await groq.chat.completions.create({
//         model: "openai/gpt-oss-120b",

//         messages: [
//             {
//                 role: "system",
//                 content: "You are an expert technical interviewer and career coach. Generate accurate, detailed and useful interview preparation reports."
//             },
//             {
//                 role: "user",
//                 content: prompt
//             }
//         ],

//         response_format: {
//             type: "json_schema",
//             json_schema: {
//                 name: "interview_report",
//                 strict: true,
//                 schema: GROQ_REPORT_SCHEMA
//             }
//         }
//     });

//     const content = response.choices[0]?.message?.content;

//     if (!content) {
//         throw new Error("Groq returned an empty response");
//     }

//     const generatedReport = JSON.parse(content);

//     return interviewReportSchema.parse(generatedReport);
// }





// async function generatePdfFromHtml(htmlContent) {

//     const browser = await puppeteer.launch({
//         headless: true,
//         args: [
//             "--no-sandbox",
//             "--disable-setuid-sandbox"
//         ]
//     });

//     try {

//         const page = await browser.newPage();

//         await page.setContent(htmlContent, {
//             waitUntil: "networkidle0"
//         });

//         await page.emulateMediaType("print");

//         // Improve readability without destroying original design
//         await page.addStyleTag({
//             content: `
//                 * {
//                     box-sizing: border-box;
//                 }

//                 body {
//                     font-family: Arial, Helvetica, sans-serif !important;
//                     font-size: 10.5pt !important;
//                     line-height: 1.4 !important;
//                     color: #222 !important;
//                 }

//                 p, li {
//                     font-size: 10pt !important;
//                     line-height: 1.4 !important;
//                 }

//                 h1 {
//                     font-size: 20pt !important;
//                     margin-bottom: 6pt !important;
//                 }

//                 h2 {
//                     font-size: 14pt !important;
//                     margin-top: 12pt !important;
//                     margin-bottom: 5pt !important;
//                 }

//                 h3 {
//                     font-size: 11.5pt !important;
//                     margin-top: 8pt !important;
//                     margin-bottom: 4pt !important;
//                 }

//                 li {
//                     margin-bottom: 3pt !important;
//                 }

//                 @media print {
//                     * {
//                         -webkit-print-color-adjust: exact;
//                         print-color-adjust: exact;
//                     }
//                 }
//             `
//         });

//         const pdfBuffer = await page.pdf({

//             format: "A4",

//             printBackground: true,

//             preferCSSPageSize: false,

//             displayHeaderFooter: false,

//             scale: 1,

//             margin: {
//                 top: "12mm",
//                 bottom: "12mm",
//                 left: "14mm",
//                 right: "14mm"
//             }

//         });

//         return pdfBuffer;

//     } finally {

//         await browser.close();

//     }
// }




// async function generateResumePdf({
//     resume,
//     selfDescription,
//     jobDescription
// }) {

//     const prompt = `
// You are an expert professional resume writer and HTML/CSS developer.

// Generate a professional, ATS-friendly resume using the following candidate details.

// RESUME:
// ${resume}

// SELF DESCRIPTION:
// ${selfDescription}

// JOB DESCRIPTION:
// ${jobDescription}

// CONTENT REQUIREMENTS:

// 1. Tailor the resume according to the given job description.
// 2. Highlight relevant skills, projects and experience.
// 3. Use professional, natural, human-written language.
// 4. Do not invent candidate experience, education, skills or achievements.
// 5. Keep the resume concise and ideally 1-2 A4 pages.
// 6. Include relevant projects, technical skills, education and achievements.
// 7. Prioritize information relevant to the target job.
// 8. Do not add unnecessary sections or duplicate information.

// IMPORTANT HTML LAYOUT REQUIREMENTS:

// 1. Generate a complete HTML5 document.
// 2. Use a simple, professional, single-column layout.
// 3. Use normal HTML document flow.
// 4. Keep all sections close together with consistent spacing.
// 5. Do not create unnecessary blank spaces between sections.
// 6. Do not use fixed heights or min-height.
// 7. Do not use height: 100vh or min-height: 100vh.
// 8. Do not use justify-content: space-between.
// 9. Do not use absolute or fixed positioning for resume content.
// 10. Do not use empty divs or unnecessary br tags.
// 11. Do not use forced page breaks.
// 12. Do not use large margins or padding.
// 13. Keep project headings together with their descriptions.
// 14. Keep achievements and certifications close to their headings.
// 15. Allow content to flow naturally across pages.
// 16. Do not vertically distribute content to fill the page.

// CSS REQUIREMENTS:

// - Use Arial or Helvetica font.
// - Body font size should be approximately 10px-11px.
// - Use compact line-height between 1.3 and 1.5.
// - Use section heading font size between 12px and 14px.
// - Use consistent section spacing of approximately 8px-12px.
// - Use normal block layout.
// - Use subtle professional colors.
// - Use print-friendly CSS.
// - Keep the layout ATS-friendly.

// OUTPUT REQUIREMENTS:

// Return ONLY a complete HTML document.
// Do not return JSON.
// Do not use Markdown code fences.
// Do not include explanations before or after the HTML.

// The HTML must start with <!DOCTYPE html>.
// `;

//     try {

//         const response = await groq.chat.completions.create({

//             model: "openai/gpt-oss-120b",

//             messages: [
//                 {
//                     role: "system",
//                     content: `
// You are an expert resume designer.
// Generate valid, clean and professional HTML resumes.
// Follow all layout requirements strictly.
// Never generate unnecessary vertical spacing.
// `
//                 },
//                 {
//                     role: "user",
//                     content: prompt
//                 }
//             ],

//             temperature: 0.3,

//             max_completion_tokens: 12000
//         });

//         let htmlContent = response.choices[0]?.message?.content;

//         if (!htmlContent) {
//             throw new Error("Groq returned an empty resume response");
//         }

//         // Remove accidental Markdown code fences
//         htmlContent = htmlContent
//             .replace(/^```html\s*/i, "")
//             .replace(/^```\s*/i, "")
//             .replace(/\s*```$/, "")
//             .trim();

//         // Validate generated HTML
//         if (!htmlContent.toLowerCase().includes("<html")) {
//             throw new Error("Groq did not return valid HTML");
//         }

//         if (!htmlContent.toLowerCase().includes("</html>")) {
//             throw new Error("Generated HTML document is incomplete");
//         }

//         // Generate PDF
//         const pdfBuffer = await generatePdfFromHtml(htmlContent);

//         return pdfBuffer;

//     } catch (error) {

//         console.error("Resume PDF Generation Error:", error);

//         throw error;
//     }
// }





// module.exports = {
//     generateInterviewReport,
//     generateResumePdf
// };


const { z } = require("zod");
const puppeteer = require("puppeteer");

const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});


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


async function generateInterviewReport({
    resume,
    selfDescription,
    jobDescription
}) {

    const prompt = `Generate an interview report for a candidate with the following details:

Resume: ${resume}

Self Description: ${selfDescription}

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

    const response = await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",

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
        throw new Error("Groq returned an empty response");
    }

    const generatedReport = JSON.parse(content);

    return interviewReportSchema.parse(generatedReport);
}



async function generatePdfFromHtml(htmlContent) {
    const browser = await puppeteer.launch({
        headless: true,
        args: [
            "--no-sandbox",
            "--disable-setuid-sandbox"
        ]
    });

    try {
        const page = await browser.newPage();

        await page.setViewport({
            width: 794,
            height: 1123,
            deviceScaleFactor: 1
        });

        // Remove accidental markdown fences
        htmlContent = htmlContent
            .replace(/^```html\s*/i, "")
            .replace(/^```\s*/i, "")
            .replace(/\s*```$/i, "")
            .trim();

        await page.setContent(htmlContent, {
            waitUntil: "networkidle0"
        });

        await page.emulateMediaType("print");

        // Enforce consistent resume styling
        await page.addStyleTag({
            content: `
                @page {
                    size: A4;
                    margin: 12mm 13mm;
                }

                * {
                    box-sizing: border-box !important;
                }

                html, body {
                    width: 100% !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    font-family: Arial, Helvetica, sans-serif !important;
                    font-size: 10pt !important;
                    line-height: 1.3 !important;
                    color: #222 !important;
                }

                body {
                    display: block !important;
                }

                h1 {
                    font-size: 23pt !important;
                    line-height: 1.15 !important;
                    margin: 0 0 7px 0 !important;
                }

                h2 {
                    font-size: 13pt !important;
                    font-weight: 500 !important;
                    margin: 10px 0 5px 0 !important;
                    padding-bottom: 3px !important;
                    border-bottom: 1px solid #777 !important;
                    page-break-after: avoid !important;
                }

                h3 {
                    font-size: 10.5pt !important;
                    margin: 5px 0 2px 0 !important;
                    line-height: 1.25 !important;
                    page-break-after: avoid !important;
                }

                p {
                    margin: 2px 0 4px 0 !important;
                    line-height: 1.3 !important;
                }

                ul, ol {
                    margin: 2px 0 5px 0 !important;
                    padding-left: 20px !important;
                }

                li {
                    margin: 0 0 2px 0 !important;
                    padding: 0 !important;
                    line-height: 1.3 !important;
                }

                section, article {
                    margin-top: 5px !important;
                    margin-bottom: 5px !important;
                    page-break-inside: auto;
                }

                img {
                    max-width: 100% !important;
                }

                a {
                    color: #0645ad !important;
                    text-decoration: none !important;
                }

                br {
                    line-height: 1 !important;
                }

                @media print {
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }

                    h2, h3 {
                        page-break-after: avoid !important;
                    }

                    li {
                        page-break-inside: avoid !important;
                    }
                }

/* FIX UNNECESSARY VERTICAL SPACING */

html,
body {
    height: auto !important;
    min-height: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
}

/* Remove unwanted flex/grid spacing */
div,
section,
article,
main,
ul,
ol {
    height: auto !important;
    min-height: 0 !important;
    justify-content: flex-start !important;
    align-content: flex-start !important;
    gap: 0 !important;
}

/* Force normal single-column document flow */
div,
section,
article,
main {
    display: block !important;
}

/* Fix bullet lists */
ul,
ol {
    display: block !important;
    margin-top: 2px !important;
    margin-bottom: 5px !important;
    padding-left: 20px !important;
}

li {
    display: list-item !important;
    margin-top: 0 !important;
    margin-bottom: 2px !important;
    padding: 0 !important;
}

/* Prevent artificial vertical distribution */
.resume,
.container,
.wrapper,
.content {
    height: auto !important;
    min-height: 0 !important;
    justify-content: flex-start !important;
    align-content: flex-start !important;
}

/* Natural PDF pagination */
@media print {
    section,
    article,
    ul,
    ol {
        page-break-inside: auto !important;
        break-inside: auto !important;
    }
}

            `
        });

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            preferCSSPageSize: true,
            displayHeaderFooter: false,
            scale: 1,
            margin: {
                top: "0",
                bottom: "0",
                left: "0",
                right: "0"
            }
        });

        return pdfBuffer;

    } finally {
        await browser.close();
    }
}

async function generateResumePdf({
    resume,
    selfDescription,
    jobDescription
}) {

    const prompt = `
You are an expert resume designer and HTML/CSS developer.

Generate a professional ATS-friendly resume using the candidate information below.

CANDIDATE RESUME:
${resume}

SELF DESCRIPTION:
${selfDescription}

JOB DESCRIPTION:
${jobDescription}

CONTENT RULES:

1. Tailor the resume to the job description.
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

- Font: Arial or Helvetica.
- Body font: 10pt.
- Main name: 23pt bold.
- Section headings: 13pt.
- Project headings: 10.5pt bold.
- Body line-height: 1.3.
- Compact and consistent margins.
- Professional black, dark grey and subtle blue accents.
- White background.

SECTION ORDER:

1. Name and Contact Information
2. Summary
3. Education
4. Projects
5. Technical Skills
6. Achievements and Leadership
7. Certifications

HTML REQUIREMENTS:

1. Return a complete HTML5 document.
2. Include CSS inside a style tag.
3. Use semantic HTML elements.
4. Use a maximum content width of 100%.
5. Use consistent section spacing.
6. Use print-friendly CSS.
7. Use only one main content column.
8. Make the document responsive.
9. Avoid excessive padding and margins.
10. Do not add decorative elements that affect ATS readability.

PAGE SETTINGS:

- Paper: A4.
- Page content should use available printable width.
- Keep approximately 12mm vertical and 13mm horizontal page margins.
- Allow natural content flow across pages.

OUTPUT RULES:

Return ONLY valid HTML.
Start with <!DOCTYPE html>.
Do not use Markdown code fences.
Do not add explanations.
Do not return JSON.
`;

    const response = await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",

        messages: [
            {
                role: "system",
                content: `
You are a professional resume layout designer.

Your priority is consistent layout, compact spacing,
readability and ATS compatibility.

Always generate a single-column resume.
Never introduce unnecessary vertical whitespace.
Follow the requested HTML and CSS structure strictly.
`
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
        throw new Error("Groq returned an empty resume response");
    }

    htmlContent = htmlContent
        .replace(/^```html\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

    if (
        !htmlContent.toLowerCase().includes("<!doctype html") ||
        !htmlContent.toLowerCase().includes("</html>")
    ) {
        throw new Error("Groq did not return a complete HTML document");
    }

    const pdfBuffer = await generatePdfFromHtml(htmlContent);

    return pdfBuffer;
}



module.exports = {
    generateInterviewReport,
    generateResumePdf
};
