import React, { useEffect, useState, useRef, useCallback } from "react";
import { Editor as TinyMCEEditor } from "@tinymce/tinymce-react";
import {
  fetchDocumentUrl,
  updateDocumentContent,
  updateFileStatus,
} from "../utils/firestoreUtil";
import useDebounce from "../hooks/useDebounce";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import { auth } from "../utils/firebase";
import ConfirmationDialog from "./ConfirmationDialog";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
import Tooltip from "@mui/material/Tooltip";
import { server } from "../main";
import axios from "axios";

const Editor = () => {
  const { projectId, documentId } = useParams();
  const editorRef = useRef(null);
  const [htmlContent, setHtmlContent] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isInitialContentSet, setIsInitialContentSet] = useState(false);
  const navigate = useNavigate();
  const debouncedHtmlContent = useDebounce(htmlContent, 3000);
  const [companyId, setCompanyId] = useState(null);

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const token = await user.getIdTokenResult();
        user.companyId = token.claims.companyId;
        setUser(user);
        setCompanyId(user.companyId);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { htmlUrl, pdfUrl } = await fetchDocumentUrl(
          projectId,
          documentId
        );
        const response = await fetch(htmlUrl);
        const text = await response.text();
        setHtmlContent(text);
        setPdfUrl(pdfUrl);
        const extractedFileName = pdfUrl.split("/").pop();
        setFileName(extractedFileName);
        setIsInitialContentSet(true);
      } catch (err) {
        setError("Error fetching document");
        console.error("Error fetching document:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [projectId, documentId]);

  useEffect(() => {
    const saveContent = async () => {
      if (!debouncedHtmlContent) return;

      try {
        const blob = new Blob([debouncedHtmlContent], {
          type: "text/html; charset=utf-8",
        });
        await updateDocumentContent(projectId, documentId, blob);
      } catch (err) {
        console.error("Error saving document (debounced save):", err);
      }
    };

    saveContent();
  }, [debouncedHtmlContent, projectId, documentId]);

  const handleSave = async () => {
    try {
      if (companyId === "cvy2lr5H0CUVH8o2vsVk") {
        await updateFileStatus(projectId, documentId, {
          status: 4,
          kyro_completedDate: new Date().toISOString(),
        });
      } else {
        await updateFileStatus(projectId, documentId, {
          status: 7,
          client_completedDate: new Date().toISOString(),
        });
      }
      navigate(-1);
      console.log("Document status updated to 4 or 7");
    } catch (err) {
      console.error("Error updating document status:", err);
    }
  };

  const handleDownload = async () => {
    setError(null); // Clear any previous error

    try {
      const endpoint = `${server}/api/document/${projectId}/${documentId}/downloadDocx`;
      const response = await axios.get(endpoint, {
        responseType: "blob",
      });

      // Extract filename from headers or use a fallback
      const contentDisposition = response.headers["content-disposition"];
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1].replace(/"/g, "")
        : "document.zip";

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();

    } catch (err) {
      setError("An error occurred while downloading the document."); // Set a descriptive error message
      console.error("Error during document download:", err); // Log the actual error
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const initializeEditor = useCallback(() => {
    if (isInitialContentSet) {
      return (
        <TinyMCEEditor
          key={documentId}
          apiKey="b49qe47leuw15e45amyl6s8hh2wojjif4ka6kfptu0tt0v1w"
          value={htmlContent}
          init={{
            height: "calc(100vh)",
            menubar: 'edit insert view format table tools',
            // plugins:
            // "anchor fullscreen autolink charmap codesample image link lists media searchreplace table visualblocks wordcount linkchecker tableofcontents mergetags autocorrect typography inlinecss markdown pagebreak",
            plugins:
              "anchor fullscreen autolink charmap codesample image link lists media searchreplace table visualblocks wordcount linkchecker pagebreak",
            toolbar:
              "bold italic underline | fontfamily fontsize fontselect fontsizeselect | align lineheight | numlist bullist indent outdent | paragraphSpacing ",
            tinycomments_mode: "embedded",
            pagebreak_split_block: true,
            pagebreak_separator: "<!-- my page break -->",
            fontsize_formats: "8pt 9pt 10pt 11pt 12pt 13pt 14pt 15pt 16pt 18pt 20pt 22pt 24pt 26pt 28pt 30pt 32pt 36pt 38pt 40pt 42pt 44pt 48pt 50pt 52pt 54pt 56pt 58pt 60pt 64pt 68pt 72pt 76pt 80pt 84pt 88pt 92pt 96pt",
            tinycomments_author: "Author name",
            fullscreen_native: true,

            setup: (editor) => {
              editor.ui.registry.addButton("paragraphSpacing", {
                text: "Paragraph Spacing",
                onAction: () => {
                  editor.execCommand("FormatBlock", false, "p");
                  editor
                    .getBody()
                    .querySelectorAll("p")
                    .forEach((paragraph) => {
                      paragraph.style.textIndent = "80px";
                    });
                },
              });
            },
          }}
          onInit={(evt, editor) => {
            editorRef.current = editor;
          }}
          onEditorChange={(content, editor) => setHtmlContent(content)}
        />
      );
    }
    return null;
  }, [htmlContent, isInitialContentSet, documentId]);



  useEffect(() => {
    return () => {
      if (editorRef.current) {
        editorRef.current.remove();
        editorRef.current = null;
      }
    };
  }, [documentId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "10px",
          borderRight: "1px solid #ccc",
        }}
      >
        <div>
          <iframe src={pdfUrl} title="pdf" width="100%" height="988px" />
        </div>
        <Button
          onClick={handleBack}
          variant="contained"
          color="primary"
          size="large"
          sx={{
            position: "fixed",
            top: 15,
            right: 110,
            width: "80px",
            height: "36px",
            fontSize: "14px",
            zIndex: 10,
          }}
        >
          <ArrowBackIcon sx={{ marginRight: "3px" }} />
          Back
        </Button>

        <Tooltip title="Download">
          <DownloadIcon
            onClick={handleDownload}
            sx={{
              position: "fixed",
              top: 26,
              right: 350,
              fontSize: "20px",
              zIndex: 10,
            }}
            className="text-gray-600 hover:text-blue-600 hover:scale-125 cursor-pointer "
          />
        </Tooltip>
      </div>
      <div style={{ flex: 1, padding: "10px" }}>
        {initializeEditor()}
        <Button
          onClick={handleOpenDialog}
          variant="contained"
          color="success"
          size="large"
          sx={{
            position: "fixed",
            top: 15,
            right: 17,
            width: "80px",
            height: "36px",
            fontSize: "14px",
            zIndex: 10,
          }}
        >
          Submit
        </Button>
        <ConfirmationDialog
          open={dialogOpen}
          handleClose={handleCloseDialog}
          handleConfirm={handleSave}
          title="Confirm Submission"
          message="Are you sure you want to submit?"
        />
      </div>
    </div>
  );
};

export default Editor;
