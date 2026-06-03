import axios from "axios";
import { server } from "../main";

// Log a revert action
export const logRevertAction = async (
  projectId,
  fileId,
  userId,
  reason,
) => {


  const response = await axios.post(`${server}/api/track/revert`, {
    projectId,
    fileId,
    userId,
    reason,
  });
  return response.data;
};

// Fetch revert history for a project or specific file
export const fetchRevertHistory = async ({ projectId, fileId }) => {
  const params = { projectId };
  if (fileId) params.fileId = fileId;
  const response = await axios.get(`${server}/api/track/revert-history`, {
    params,
  });
  return response.data;
};

// Record file submission details
export const recordFileSubmission = async ({
  projectId,
  documentId,
  userId,
  userName,
  fileName,
  fileUrl,
  companyId,
}) => {
  const response = await axios.post(`${server}/api/track/file-submission`, {
    projectId,
    documentId,
    userId,
    userName,
    fileName,
    fileUrl,
    companyId,
  });
  return response.data;
};

// Fetch submission history for a document
export const fetchSubmissionHistory = async ({ projectId, documentId }) => {
  const params = { projectId, documentId };
  const response = await axios.get(
    `${server}/api/track/file-submission-history`,
    { params }
  );
  return response.data;
};

// Submit feedback for a document
export const submitFeedback = async ({
  projectId,
  documentId,
  fileName,
  userId,
  companyId,
  qualityRating,
  reason,
  notes,
}) => {
  const response = await axios.post(`${server}/api/track/feedback`, {
    projectId,
    documentId,
    fileName,
    userId,
    companyId,
    qualityRating,
    reason,
    notes,
  });
  return response.data;
};

// Fetch feedbacks for a company
export const fetchFeedbacks = async (companyId) => {
  const response = await axios.get(`${server}/api/track/feedbacks`, {
    params: { companyId },
  });
  return response.data;
};

// Update feedback status
export const updateFeedbackStatus = async (feedbackId, status) => {
  const response = await axios.put(`${server}/api/track/feedback/status`, {
    feedbackId,
    status,
  });
  return response.data;
};
