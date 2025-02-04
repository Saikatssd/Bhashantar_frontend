import React, { useEffect, useState, useRef, useCallback } from "react";
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
import { formatDate, fetchServerTimestamp } from "../utils/formatDate";
import {
  fetchFileNameById,
  fetchDocumentUrl,
  updateDocumentContent,
  updateFileStatus,
} from "../services/fileServices";
import { toast } from "react-hot-toast";

import "../App.css";
import { kyroCompanyId } from "../services/companyServices";
import EditorContainer from "./Editor/EditorContainer";


const Editor = () => {
  const { projectId, documentId } = useParams();
  const [htmlContent, setHtmlContent] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(true);
  const [kyroId, setKyroId] = useState();
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isInitialContentSet, setIsInitialContentSet] = useState(false);
  const navigate = useNavigate();
  const debouncedHtmlContent = useDebounce(htmlContent, 3000);
  const [companyId, setCompanyId] = useState(null);
  const [companyName, setCompanyName] = useState();
  const [role, setRole] = useState();
  const editorContainerRef = useRef(null);
  const editorMenuBarRef = useRef(null);
  const editorToolbarRef = useRef(null);
  const editorRef = useRef(null);
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  // const LICENSE_KEY =
	// 'eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3MzczMzExOTksImp0aSI6IjdhNDgwYTMxLTE1ZmQtNGRmNi04NGMyLTE2N2Q2Y2E0ZWMzOSIsInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiLCJzaCJdLCJ3aGl0ZUxhYmVsIjp0cnVlLCJsaWNlbnNlVHlwZSI6InRyaWFsIiwiZmVhdHVyZXMiOlsiKiJdLCJ2YyI6ImY5NjVmMmIyIn0.KqwW5jstCXw4ET_VaNupoTIgMSRQDIRTMuHZ4xsyWbGdFcybKV-wBBWlKolBfDRw_n-V8nzp7ONCzaURq6krNg';


const LICENSE_KEY =
'eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3MzczMzExOTksImp0aSI6IjdhNDgwYTMxLTE1ZmQtNGRmNi04NGMyLTE2N2Q2Y2E0ZWMzOSIsInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiLCJzaCJdLCJ3aGl0ZUxhYmVsIjp0cnVlLCJsaWNlbnNlVHlwZSI6InRyaWFsIiwiZmVhdHVyZXMiOlsiKiJdLCJ2YyI6ImY5NjVmMmIyIn0.KqwW5jstCXw4ET_VaNupoTIgMSRQDIRTMuHZ4xsyWbGdFcybKV-wBBWlKolBfDRw_n-V8nzp7ONCzaURq6krNg';

  // Offline alert functionality
  useEffect(() => {
    const handleOffline = () => {
      toast.error("Oops! You're offline 😢. Don't refresh now, or you might lose your progress. Hang tight!", {
        duration: 5000,
      });
    };

    const handleOnline = () => {
      toast.success("You are back online 😍!");
    };

    // Add event listeners for online and offline events
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    // Cleanup event listeners on component unmount
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
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
        // console.log("htmlcontent",htmlContent)
        setPdfUrl(pdfUrl);
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

  useEffect(() => {
    setIsLayoutReady(true);

    return () => setIsLayoutReady(false);
  }, []);

  useEffect(() => {
    const fetchKyroticsCompanyId = async () => {
      try {
        const kyroId = await kyroCompanyId();
        // console.log("Kyrotics company ID:", kyroId);
        setKyroId(kyroId);
      } catch (err) {
        console.error(err);
      }
    };

    fetchKyroticsCompanyId();
  }, []);

  function tabSpacing(editor) {
    editor.editing.view.document.on("keydown", (evt, data) => {
      if (data.keyCode === 9 /* Tab */) {
        editor.model.change((writer) => {
          const insertion = writer.createText(
            "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"
          ); // Four non-breaking spaces
          // const insertion = writer.createText('             '); // Four non-breaking spaces
          // const insertion = writer.createText('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'); // Four non-breaking spaces
          editor.model.insertContent(insertion);
        });
        data.preventDefault();
        evt.stop();
      }
    });
  }

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
        user.roleName = token.claims.roleName;
        setUser(user);
        setCompanyId(user.companyId);
        setRole(user.roleName);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchName = async () => {
      const name = await fetchFileNameById(projectId, documentId);
      setFileName(name);
    };

    fetchName();
  }, [projectId, documentId]);

  const handleSave = async () => {
    try {
      const serverDate = await fetchServerTimestamp();
      const formattedDate = formatDate(serverDate);

      if (companyId === kyroId) {
        if (role === "QA") {
          await updateFileStatus(projectId, documentId, {
            status: 5,
            kyro_completedDate: formattedDate,
          });
        } else {
          await updateFileStatus(projectId, documentId, {
            status: 4,
            kyro_completedDate: formattedDate,
          });
        }
      } else {
        await updateFileStatus(projectId, documentId, {
          status: 7,
          client_completedDate: formattedDate,
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

      // Use toast.promise to handle the download process
      await toast
        .promise(
          axios.get(endpoint, {
            responseType: "blob",
          }),
          {
            loading: "Downloading...",
            success: "Zip File Downloaded!",
            error: "An error occurred while downloading the document.",
          }
        )
        .then((response) => {
          const contentDisposition = response.headers["content-disposition"];
          const filename = contentDisposition
            ? contentDisposition.split("filename=")[1].replace(/"/g, "")
            : "document.zip";

          // Check if the response data is valid
          if (!response.data || response.data.size === 0) {
            throw new Error("File is empty or not valid.");
          }

          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", filename);
          document.body.appendChild(link);
          link.click();
          link.remove();
        });
    } catch (err) {
      console.log("Download error", err);

      // If the file is blank or other error occurs
      toast.error("Error: File can't be downloaded or is blank", {
        position: "top-right",
        style: { background: "#333", color: "#fff" },
      });

      console.error("Error during document download:", err);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };


  const initializeEditor = useCallback(() => {
    if (isInitialContentSet) {
      return (
        <div>

                <div className="">
                  <div ref={editorRef}>
                    {isLayoutReady && (
                      <EditorContainer
                        initialContent={htmlContent}
                        onChange={(newContent) => {
                          setHtmlContent(newContent); // Update the state with the new content
                        }}
                      />
                    )}
                  </div>
                </div>
          </div>
      );
    }
    return null;
  }, [htmlContent, isInitialContentSet]);


  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      <div
        style={{
          flex: 1,
          overflow: "auto",
          padding: "10px",
          borderRight: "1px solid #ccc",
          width: "50%",
        }}
      >
        {fileName ? (
          <>
            <iframe src={pdfUrl} title={fileName} width="100%" height="100%" />
          </>
        ) : (
          <div>Loading...</div>
        )}
        <Button
          onClick={handleBack}
          variant="contained"
          color="primary"
          size="large"
          sx={{
            position: "fixed",
            top: 60,
            right: 120,
            width: "80px",
            height: "29px",
            fontSize: "14px",
            zIndex: 100,
          }}
        >
          <ArrowBackIcon sx={{ marginRight: "3px" }} />
          Back
        </Button>
      </div>
      <div style={{ flex: 1, padding: "10px", overflowY: "auto" }}>
        {initializeEditor()}
        <Button
          onClick={handleOpenDialog}
          variant="contained"
          color="success"
          size="large"
          sx={{
            position: "fixed",
            top: 60,
            right: 30,
            width: "80px",
            height: "29px",
            fontSize: "14px",
            zIndex: 100,
          }}
        >
          Submit
        </Button>
        <Tooltip title="Download">
          <DownloadIcon
            onClick={handleDownload}
            sx={{
              position: "fixed",
              top: 60,
              right: 400,
              fontSize: "20px",
              zIndex: 100,
            }}
            className="text-gray-600 hover:text-blue-600 hover:scale-125 cursor-pointer "
          />
        </Tooltip>
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
