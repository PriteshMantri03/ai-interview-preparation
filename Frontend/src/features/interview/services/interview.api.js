import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? "http://localhost:3000" : "");

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const generateInterviewReport = async ({ jobDescription, selfDescription, resumeFile }) => {
    const formData = new FormData();
    formData.append("jobDescription", jobDescription);
    formData.append("selfDescription", selfDescription || "");
    if (resumeFile) {
        formData.append("resume", resumeFile);
    }

    const response = await api.post("/api/interview/", formData, {
        headers: {
            "Content-Type": "multipart/form-data"
        }
    });

    return response.data;
};

export const getInterviewReportById = async (interviewId) => {
    const response = await api.get(`/api/interview/report/${interviewId}`);
    return response.data;
};

export const getAllInterviewReports = async () => {
    const response = await api.get("/api/interview/");
    return response.data;
};

export const getResumeHtml = async ({ interviewReportId }) => {
    const response = await api.get(`/api/interview/resume/html/${interviewReportId}`);
    return response.data;
};

export const getResumeViewUrl = (interviewReportId) => {
    const token = localStorage.getItem("token") || "";
    const baseUrl = api.defaults.baseURL || window.location.origin;
    return `${baseUrl}/api/interview/resume/view/${interviewReportId}?token=${encodeURIComponent(token)}`;
};

export const generateResumePdf = async ({ interviewReportId }) => {
    try {
        const response = await api.post(`/api/interview/resume/pdf/${interviewReportId}`, null, {
            responseType: "blob"
        });
        return response.data;
    } catch (err) {
        // If Axios responseType is blob, Axios wraps JSON errors into a Blob
        if (err.response?.data instanceof Blob) {
            try {
                const text = await err.response.data.text();
                const json = JSON.parse(text);
                err.response.data = json;
            } catch (e) {
                // ignore parsing failure
            }
        }
        throw err;
    }
};

export default api;
