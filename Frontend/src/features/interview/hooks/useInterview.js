import {
    getAllInterviewReports,
    generateInterviewReport,
    getInterviewReportById,
    generateResumePdf,
    getResumeHtml,
    getResumeViewUrl
} from "../services/interview.api";

import { useContext, useEffect } from "react";
import { InterviewContext } from "../interview.context";
import { useParams } from "react-router";

export const useInterview = () => {
    const context = useContext(InterviewContext);
    const { interviewId } = useParams();

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider");
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context;

    const generateReport = async ({ jobDescription, selfDescription, resumeFile }) => {
        setLoading(true);
        let response = null;
        try {
            response = await generateInterviewReport({ jobDescription, selfDescription, resumeFile });
            if (response?.interviewReport) {
                setReport(response.interviewReport);
                return response.interviewReport;
            }
            return null;
        } catch (error) {
            console.error("Generate report error:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const getReportById = async (id) => {
        setLoading(true);
        try {
            const response = await getInterviewReportById(id);
            setReport(response.interviewReport);
            return response.interviewReport;
        } catch (error) {
            console.error("Get report by ID error:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const getReports = async () => {
        setLoading(true);
        try {
            const response = await getAllInterviewReports();
            setReports(response.interviewReports || []);
            return response.interviewReports || [];
        } catch (error) {
            console.error("Get reports error:", error);
            setReports([]);
            return [];
        } finally {
            setLoading(false);
        }
    };

    const fetchResumeHtml = async (id) => {
        setLoading(true);
        try {
            const response = await getResumeHtml({ interviewReportId: id });
            return response.html;
        } catch (error) {
            console.error("Fetch resume HTML error:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const downloadResumePdf = async (id) => {
        setLoading(true);
        try {
            const response = await generateResumePdf({ interviewReportId: id });
            const url = window.URL.createObjectURL(new Blob([ response ], { type: "application/pdf" }));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `resume_${id}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        } catch (error) {
            console.error("Download resume PDF error:", error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const previewResume = (id) => {
        const url = getResumeViewUrl(id);
        window.open(url, "_blank");
    };

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId).catch(() => {});
        } else {
            getReports().catch(() => {});
        }
    }, [ interviewId ]);

    return {
        loading,
        report,
        reports,
        generateReport,
        getReportById,
        getReports,
        getResumePdf: downloadResumePdf,
        fetchResumeHtml,
        previewResume,
        getResumeViewUrl
    };
};
