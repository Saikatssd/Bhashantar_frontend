import React, { useCallback, useEffect, useRef, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";

import QuillTableBetter from "quill-table-better";
import "quill-table-better/dist/quill-table-better.css";

import useDebounce from "../hooks/useDebounce";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Button, IconButton, Typography, FormControl, InputLabel, Select, MenuItem, Menu, ListItemIcon, ListItemText } from "@mui/material"; // Keep Button for other uses if any
import { useAuth } from "../context/AuthContext";
import { useInstance } from "../context/InstanceContext";
import ConfirmationDialog from "./ConfirmationDialog";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
import CloseIcon from "@mui/icons-material/Close";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import RateReviewIcon from "@mui/icons-material/RateReview";
import NoteAddIcon from "@mui/icons-material/NoteAdd";
import axios from "axios";
import { toast } from "react-hot-toast";
import { server } from "../main";
import Tooltip from "@mui/material/Tooltip";

import {
  fetchFileNameById,
  fetchDocumentUrl,
  updateDocumentContent,
  updateFileStatus,
} from "../services/fileServices";
import { formatDate, fetchServerTimestamp } from "../utils/formatDate";
import "../App.css";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Loader from "./common/Loader";
import FindInPageIcon from "@mui/icons-material/FindInPage";
import QuillResizeImage from "quill-resize-image";
import "../config/quillConfig";
import "../config/pageBreakBlot";
import { InsertPageBreak } from "@mui/icons-material";
import Searcher from "../config/Searcher";
import SearchedStringBlot from "../config/SearchBlot";
import { recordFileSubmission, submitFeedback } from "../services/trackFileServices";

Quill.register("modules/resize", QuillResizeImage);
Quill.register(SearchedStringBlot);
Quill.register("modules/Searcher", Searcher);

Quill.register(
  {
    "modules/table-better": QuillTableBetter,
  },
  true
);

const Font = Quill.import("attributors/style/font");
Font.whitelist = ["calibri", "times-new-roman", "arial", "nirmala-ui"];
Quill.register(Font, true);

const SizeStyle = Quill.import("attributors/style/size");
SizeStyle.whitelist = [
  "8pt",
  "9pt",
  "10pt",
  "11pt",
  "12pt",
  "14pt",
  "16pt",
  "18pt",
  "20pt",
  "22pt",
  "24pt",
  "26pt",
  "28pt",
  "36pt",
  "48pt",
  "72pt",
];
Quill.register(SizeStyle, true);

const TableDialog = ({
  open,
  onClose,
  onInsert,
  tableRows,
  setTableRows,
  tableCols,
  setTableCols,
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Insert Table</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Number of Rows"
          type="number"
          fullWidth
          value={tableRows}
          onChange={(e) => setTableRows(Number(e.target.value))}
        />
        <TextField
          margin="dense"
          label="Number of Columns"
          type="number"
          fullWidth
          value={tableCols}
          onChange={(e) => setTableCols(Number(e.target.value))}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>{" "}
        {/* MUI Button is fine here */}
        <Button onClick={onInsert} variant="contained" color="primary">
          Insert
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const DEFAULT_DOWNLOAD_ERROR =
  "We couldn't prepare the download right now. Please try again in a moment.";

const getDownloadErrorMessage = async (err) => {
  const fallbackMessage = DEFAULT_DOWNLOAD_ERROR;
  const responseData = err?.response?.data;

  if (responseData instanceof Blob) {
    try {
      const text = await responseData.text();
      if (!text) return fallbackMessage;

      try {
        const parsed = JSON.parse(text);
        return parsed.message || parsed.error || fallbackMessage;
      } catch {
        return text;
      }
    } catch {
      return fallbackMessage;
    }
  }

  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    fallbackMessage
  );
};

const Editor = () => {
  const { projectId, documentId } = useParams();
  const navigate = useNavigate();

  const [htmlContent, setHtmlContent] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(true);
  const [fileStatus, setFileStatus] = useState(null);
  const [error, setError] = useState(null);
  const { currentUser: user } = useAuth();
  const { kyroId } = useInstance();
  const companyId = user?.companyId;
  const role = user?.roleName;
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isInitialContentSet, setIsInitialContentSet] = useState(false);
  const debouncedHtmlContent = useDebounce(htmlContent, 3000);
  // const [isLayoutReady, setIsLayoutReady] = useState(false); // Not strictly needed for this layout

  const [showTableDialog, setShowTableDialog] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  const [isFindReplaceDialogOpen, setIsFindReplaceDialogOpen] = useState(false);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const [matches, setMatches] = useState([]);

  // const [pageCount, setPageCount] = useState(1); // Not currently used
  const editorContainerRef = useRef(null);
  const quillRef = useRef(null);

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState("");
  const [feedbackReason, setFeedbackReason] = useState("");
  const [feedbackCategory, setFeedbackCategory] = useState("");
  const [feedbackSeverity, setFeedbackSeverity] = useState("");
  const [feedbackAdditional, setFeedbackAdditional] = useState("");
  const [submitFeedbackAttempted, setSubmitFeedbackAttempted] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [hasExistingFeedback, setHasExistingFeedback] = useState(false);
  
  const [isNotesPanelOpen, setIsNotesPanelOpen] = useState(false);
  const [notesContent, setNotesContent] = useState("");
  const [downloadAnchorEl, setDownloadAnchorEl] = useState(null);

  useEffect(() => {
    const handleOffline = () => {
      setIsOnline(false);
      toast.error(
        "You're offline 😢. Don't refresh the page or you may lose unsaved changes. We'll auto-save when connection returns.",
        {
          duration: 10000,
          id: "offline-toast",
        }
      );
      const submitButton = document.getElementById("submit-button-editor"); // Use ID for submit button
      if (submitButton) submitButton.disabled = true;
    };

    const handleOnline = () => {
      setIsOnline(true);
      toast.success("You're back online! Your changes will now be saved.", {
        id: "online-toast",
      });
      const submitButton = document.getElementById("submit-button-editor"); // Use ID for submit button
      if (submitButton) submitButton.disabled = false;
      if (hasUnsavedChanges) {
        saveContent()
          .then(() => {
            setHasUnsavedChanges(false);
            toast.success("Your changes have been saved successfully!");
          })
          .catch((err) => {
            console.error("Error saving changes after reconnection:", err);
            toast.error(
              "Failed to save your changes. Please try saving manually."
            );
          });
      }
    };

    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges || !isOnline) {
        e.preventDefault();
        const message =
          "You have unsaved changes. Are you sure you want to leave?";
        e.returnValue = message;
        return message;
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges, isOnline]);

  useEffect(() => {
    if (quillRef.current) {
      const trackChanges = () => {
        quillRef.current.on("text-change", () => {
          setHasUnsavedChanges(true);
        });
      };
      trackChanges();
      return () => {
        if (quillRef.current) {
          quillRef.current.off("text-change");
        }
      };
    }
  }, [quillRef.current]);

  useEffect(() => {
    if (hasUnsavedChanges) {
      document.title = `* ${fileName || "Document"} (Unsaved changes)`;
    } else {
      document.title = fileName || "Document";
    }
  }, [hasUnsavedChanges, fileName]);

  useEffect(() => {
    let pingInterval;
    if (navigator.onLine) {
      pingInterval = setInterval(async () => {
        try {
          const response = await fetch(`${server}`, {
            method: "GET",
            signal: AbortSignal.timeout(3000),
          });
          if (!response.ok && isOnline) {
            setIsOnline(false);
            toast.warning(
              "Connection to server is unstable. Your changes will be backed up locally.",
              {
                id: "connection-warning",
                duration: 5000,
              }
            );
          } else if (response.ok && !isOnline) {
            setIsOnline(true);
          }
        } catch (error) {
          if (error.name !== "AbortError" && isOnline) {
            setIsOnline(false);
            toast.warning(
              "Server connection lost. Changes will be saved locally until connection returns.",
              {
                id: "connection-warning",
                duration: 5000,
              }
            );
          }
        }
      }, 30000);
    }
    return () => clearInterval(pingInterval);
  }, [isOnline]);

  const saveContent = async () => {
    const currentEditorHtml = quillRef.current
      ? quillRef.current.root.innerHTML
      : htmlContent;
    if (!currentEditorHtml && htmlContent === "") {
      // Allow saving empty content if it was intentionally cleared
      // If htmlContent is also empty, it means the editor was cleared.
    } else if (!currentEditorHtml) {
      return; // Don't save if quill isn't ready or htmlContent is null/undefined but not explicitly empty
    }

    try {
      if (!navigator.onLine) {
        localStorage.setItem(`editor_backup_${documentId}`, currentEditorHtml);
        setHasUnsavedChanges(true);
        toast.info("Offline: Changes saved to local backup.", {
          id: "local-backup-save",
        });
        return;
      }

      const blob = new Blob([currentEditorHtml], {
        type: "text/html; charset=utf-8",
      });

      await updateDocumentContent(projectId, documentId, blob);
      setHasUnsavedChanges(false);
      localStorage.removeItem(`editor_backup_${documentId}`);
    } catch (err) {
      console.error("Error saving document:", err);
      localStorage.setItem(`editor_backup_${documentId}`, currentEditorHtml);
      setHasUnsavedChanges(true);
      toast.error("Save failed. Changes backed up locally.", {
        id: "remote-save-fail",
      });
    }
  };

  useEffect(() => {
    // Save if debouncedHtmlContent exists (even if empty string) and initial content is set
    if (typeof debouncedHtmlContent === "string" && isInitialContentSet) {
      saveContent();
    }
  }, [debouncedHtmlContent, isInitialContentSet]);

  useEffect(() => {
    const checkForLocalBackup = () => {
      const backupContent = localStorage.getItem(`editor_backup_${documentId}`);
      if (backupContent && quillRef.current) {
        toast(
          (t) => (
            <span>
              Found a local backup. Recover it?
              <Button
                sx={{ ml: 1 }}
                size="small"
                variant="outlined"
                onClick={() => {
                  quillRef.current.clipboard.dangerouslyPasteHTML(
                    0,
                    backupContent
                  );
                  toast.dismiss(t.id);
                  toast.success("Backup content restored!");
                  localStorage.removeItem(`editor_backup_${documentId}`);
                  setHasUnsavedChanges(true);
                }}
              >
                Yes
              </Button>
              <Button
                sx={{ ml: 1 }}
                size="small"
                variant="outlined"
                color="error"
                onClick={() => {
                  localStorage.removeItem(`editor_backup_${documentId}`);
                  toast.dismiss(t.id);
                }}
              >
                No
              </Button>
            </span>
          ),
          { duration: Infinity, id: "backup-recovery-toast" }
        );
      }
    };
    if (isInitialContentSet && quillRef.current) {
      checkForLocalBackup();
    }
  }, [isInitialContentSet, documentId]);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const { htmlUrl, pdfUrl: fetchedPdfUrl } = await fetchDocumentUrl(
          projectId,
          documentId
        );
        const response = await fetch(htmlUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch HTML: ${response.statusText}`);
        }
        const text = await response.text();
        setHtmlContent(text);
        setPdfUrl(fetchedPdfUrl);
      } catch (err) {
        setError("Error fetching document");
        console.error("Error fetching document:", err);
        toast.error("Could not load document content.");
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [projectId, documentId]);

  useEffect(() => {
    if (
      editorContainerRef.current &&
      !quillRef.current &&
      htmlContent !== null &&
      typeof htmlContent === "string"
    ) {
      const Inline = Quill.import("blots/inline");
      class SearchedStringBlot extends Inline {}
      SearchedStringBlot.blotName = "SearchedString";
      SearchedStringBlot.className = "ql-searched-string";
      SearchedStringBlot.tagName = "span";
      Quill.register(SearchedStringBlot);

      const modules = {
        toolbar: {
          container: "#toolbar",
          handlers: {
            pageBreak: function () {
              const range = this.quill.getSelection(true);
              if (range) {
                this.quill.insertEmbed(
                  range.index,
                  "pageBreak",
                  true,
                  Quill.sources.USER
                );
                this.quill.setSelection(range.index + 1, Quill.sources.SILENT);
              }
            },
          },
        },
        history: {
          delay: 1000,
          maxStack: 500,
          userOnly: true,
        },
        Searcher: true,
        table: false,
        "table-better": {
          language: "en_US",
          menus: [
            "column",
            "row",
            "merge",
            "table",
            "cell",
            "wrap",
            "copy",
            "delete",
          ],
          toolbarTable: true,
        },
        resize: {
          locale: {},
        },
        keyboard: {
          bindings: {
            tab: {
              key: 9,
              handler: function (range) {
                this.quill.insertText(
                  range.index,
                  "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0",
                  "user"
                );
                this.quill.setSelection(range.index + 8);
                return false;
              },
            },
            backspace: {
              key: 8,
              handler: function (range) {
                const textBefore = this.quill.getText(range.index - 8, 8);
                if (
                  textBefore ===
                  "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"
                ) {
                  this.quill.deleteText(range.index - 8, 8, "user");
                  this.quill.setSelection(range.index - 8);
                  return false;
                }
                return true;
              },
            },
            delete: {
              key: 46,
              handler: function (range) {
                const textAfter = this.quill.getText(range.index, 8);
                if (
                  textAfter ===
                  "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"
                ) {
                  this.quill.deleteText(range.index, 8, "user");
                  return false;
                }
                return true;
              },
            },
            undo: {
              key: "z",
              shortKey: true,
              handler: function (range, context) {
                const beforeContents = this.quill.getContents();
                const beforeLength = this.quill.getLength();
                const history = this.quill.history;
                if (
                  !history ||
                  !history.stack ||
                  !history.stack.undo ||
                  history.stack.undo.length === 0
                ) {
                  console.log("Nothing to undo");
                  return false;
                }
                this.quill.history.undo();
                if (this.quill.getLength() <= 1 && beforeLength > 1) {
                  this.quill.setContents(beforeContents);
                  this.quill.history.clear();
                  console.log(
                    "You've reached the beginning of your edit history"
                  );
                }
                return false;
              },
            },
            ...QuillTableBetter.keyboardBindings,
          },
        },
      };

      quillRef.current = new Quill(editorContainerRef.current, {
        theme: "snow",
        modules,
      });

      if (htmlContent) {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = htmlContent;

        const textNodes = [];
        const findTextNodes = (node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            textNodes.push(node);
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            Array.from(node.childNodes).forEach(findTextNodes);
          }
        };
        findTextNodes(tempDiv);

        textNodes.forEach((node) => {
          if (
            node.textContent.includes(
              "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0"
            )
          ) {
            node.textContent = node.textContent.replace(
              /\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0/g,
              "§TAB§"
            );
          }
        });
        const processedContentWithMarkers = tempDiv.innerHTML;

        const deltaWithMarkers = quillRef.current.clipboard.convert({
          html: processedContentWithMarkers,
        });

        const Delta = Quill.import("delta");
        const finalDelta = new Delta();
        deltaWithMarkers.ops.forEach((op) => {
          if (typeof op.insert === "string" && op.insert.includes("§TAB§")) {
            const parts = op.insert.split("§TAB§");
            for (let i = 0; i < parts.length; i++) {
              if (i > 0) {
                finalDelta.insert(
                  "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0",
                  op.attributes
                );
              }
              if (parts[i]) {
                finalDelta.insert(parts[i], op.attributes);
              }
            }
          } else {
            if (op.insert) {
              finalDelta.insert(op.insert, op.attributes);
            } else if (op.delete) {
              finalDelta.delete(op.delete);
            } else if (op.retain) {
              finalDelta.retain(op.retain, op.attributes);
            }
          }
        });

        quillRef.current.updateContents(finalDelta, Quill.sources.USER);

        const newLength = quillRef.current.getLength();
        quillRef.current.setSelection(newLength, 0, Quill.sources.SILENT);

        if (quillRef.current.history) {
          quillRef.current.history.clear();
        }
      }

      setIsInitialContentSet(true);

      quillRef.current.on("text-change", (delta, oldDelta, source) => {
        if (source === "user") {
          const editorHtml =
            editorContainerRef.current.querySelector(".ql-editor").innerHTML;
          const preservedHtml = editorHtml.replace(
            /(\u00A0){8}/g,
            '<span class="ql-tab-space">\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0</span>'
          );
          setHtmlContent(preservedHtml);
          setHasUnsavedChanges(true);
        }
      });
    }
  }, [htmlContent]);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .ql-tab-space {
        white-space: pre !important;
        display: inline-block;
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);


  // useEffect(() => { // This useEffect for isLayoutReady is not strictly necessary for the restored layout
  //   setIsLayoutReady(true);
  //   return () => setIsLayoutReady(false);
  // }, []);



  useEffect(() => {
    const fetchFileInfo = async () => {
      try {
        const name = await fetchFileNameById(projectId, documentId);
        setFileName(name);
        // Fetch file status from Firestore
        const { doc: docRef, getDoc } = await import("firebase/firestore");
        const { db } = await import("../utils/firebase");
        const fileDocRef = docRef(db, "projects", projectId, "files", documentId);
        const fileDoc = await getDoc(fileDocRef);
        if (fileDoc.exists()) {
          setFileStatus(fileDoc.data().status);
        }
      } catch (err) {
        console.error("Error fetching file info:", err);
      }
    };
    fetchFileInfo();
  }, [projectId, documentId]);

  useEffect(() => {
    const checkExistingFeedback = async () => {
      if (!user?.uid) return;
      try {
        const { collection, query, where, getDocs } = await import("firebase/firestore");
        const { db } = await import("../utils/firebase");
        const feedbacksQuery = query(
          collection(db, "feedbacks"),
          where("documentId", "==", documentId),
          where("userId", "==", user.uid),
          where("status", "in", ["pending", "under_review"])
        );
        const feedbackSnapshot = await getDocs(feedbacksQuery);
        setHasExistingFeedback(!feedbackSnapshot.empty);
      } catch (err) {
        console.error("Error checking existing feedback:", err);
      }
    };
    checkExistingFeedback();
  }, [projectId, documentId, user]);

  const handleInsertTable = () => {
    if (quillRef.current) {
      const tableModule = quillRef.current.getModule("table-better");
      if (tableModule) {
        tableModule.insertTable(tableRows, tableCols);
      } else {
        console.error("Quill 'table-better' module not found.");
        toast.error("Could not insert table. Module not available.");
      }
    }
    setShowTableDialog(false);
  };

  const handleSave = async () => {
    await saveContent();
    if (hasUnsavedChanges && isOnline) {
      toast.error("Please ensure changes are saved before submitting.");
      return;
    }
    if (!isOnline) {
      toast.error("You are offline. Cannot submit now.");
      return;
    }

    try {
      const serverDate = await fetchServerTimestamp();
      const formattedDate = formatDate(serverDate);
      // Record file submission before updating status
      await recordFileSubmission({
        projectId,
        documentId,
        userId: user?.uid,
        userName: user?.displayName || user?.name|| user?.email || "Unknown",
        fileName: fileName || "Document",
        fileUrl: pdfUrl || "",
        companyId,
      });
      if (companyId === kyroId) {
        if (role === "QA") {
          await updateFileStatus(projectId, documentId, {
            status: 5,
            kyro_deliveredDate: formattedDate,
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
      toast.success("Document status updated successfully!");
    } catch (err) {
      console.error("Error updating document status:", err);
      toast.error("Failed to update document status.");
    }
  };

  const handleDownload = async (format = 'pdf') => {
    setError(null);
    setDownloadAnchorEl(null);
    if (hasUnsavedChanges) {
      if (!isOnline) {
        toast.error("Cannot save changes while offline. Download will not include your latest edits.");
      } else {
        await toast.promise(saveContent(), {
          loading: "Saving latest changes before download...",
          success: "Changes saved.",
          error: "Failed to save changes."
        });
      }
    }

    try {
      const endpoint = `${server}/api/document/${projectId}/${documentId}/download${format === 'docx' ? 'Docx' : 'Pdf'}`;
      const downloadPromise = axios
        .get(endpoint, { responseType: "blob" })
        .then(async (response) => {
          const contentDisposition = response.headers["content-disposition"];
          const filename = contentDisposition
            ? contentDisposition.split("filename=")[1].replace(/"/g, "")
            : "document.zip";

          if (!response.data || response.data.size === 0) {
            throw new Error(
              "The download file was empty. Please save the document and try again."
            );
          }

          const url = window.URL.createObjectURL(new Blob([response.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", filename);
          document.body.appendChild(link);
          link.click();
          link.remove();
          window.URL.revokeObjectURL(url);
        })
        .catch(async (err) => {
          throw new Error(await getDownloadErrorMessage(err));
        });

      await toast.promise(downloadPromise, {
        loading: "Preparing download...",
        success: "Download ready.",
        error: (err) => err.message || DEFAULT_DOWNLOAD_ERROR,
      });
    } catch (err) {
      console.error("Error during document download:", err);
    }
  };

  const handleOpenFeedbackDialog = () => {
    if (!isOnline) {
      toast.error("You are offline. Cannot submit feedback now.");
      return;
    }
    setFeedbackRating("");
    setFeedbackReason("");
    setFeedbackCategory("");
    setFeedbackSeverity("");
    setFeedbackAdditional("");
    setSubmitFeedbackAttempted(false);
    setIsFeedbackOpen(true);
  };

  const handleFeedbackSubmit = async () => {
    if (!isOnline) {
      toast.error("You are offline. Cannot submit feedback now.");
      return;
    }
    
    setSubmitFeedbackAttempted(true);

    if (!feedbackRating) {
      toast.error("Please select a quality review rating.");
      return;
    }

    if ((feedbackRating === "poor" || feedbackRating === "average") && (!feedbackReason.trim() || !feedbackCategory || !feedbackSeverity)) {
      return;
    }

    setSubmittingFeedback(true);
    try {
      await submitFeedback({
        projectId,
        documentId,
        fileName: fileName || "Document",
        userId: user?.uid,
        companyId,
        qualityRating: feedbackRating,
        reason: feedbackReason,
        category: feedbackCategory,
        severity: feedbackSeverity,
        additionalComments: feedbackAdditional,
        notes: notesContent,
      });
      toast.success("Feedback submitted successfully!");
      setHasExistingFeedback(true);
      setIsFeedbackOpen(false);
      setFeedbackRating("");
      setFeedbackReason("");
      setNotesContent("");
      setIsNotesPanelOpen(false);
      setSubmitFeedbackAttempted(false);
      await handleSave();
    } catch (err) {
      console.error("Error submitting feedback:", err);
      toast.error("Failed to submit feedback.");
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const handleBack = () => {
    if (hasUnsavedChanges) {
      toast(
        (t) => (
          <span>
            You have unsaved changes. Are you sure you want to go back?
            {/* Using MUI Buttons here for consistency with other toasts, but could be plain HTML */}
            <Button
              sx={{ ml: 1 }}
              size="small"
              variant="outlined"
              onClick={() => {
                toast.dismiss(t.id);
                navigate(-1);
              }}
            >
              Yes
            </Button>
            <Button
              sx={{ ml: 1 }}
              size="small"
              variant="outlined"
              color="error"
              onClick={() => toast.dismiss(t.id)}
            >
              No
            </Button>
          </span>
        ),
        { duration: 10000, id: "back-confirm-toast" }
      );
    } else {
      navigate(-1);
    }
  };

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleOpenFindReplaceDialog = () => {
    setIsFindReplaceDialogOpen(true);
    setCurrentMatchIndex(-1);
    setMatches([]);
    if (quillRef.current) {
      const selection = quillRef.current.getSelection();
      if (selection && selection.length > 0) {
        const selectedText = quillRef.current.getText(
          selection.index,
          selection.length
        );
        setFindText(selectedText);
      }
    }
  };
  const handleCloseFindReplaceDialog = () => {
    setIsFindReplaceDialogOpen(false);
    setFindText("");
    setReplaceText("");
    setCurrentMatchIndex(-1);
    setMatches([]);
    if (quillRef.current) {
      const searcher = quillRef.current.getModule("Searcher");
      if (searcher && typeof searcher.constructor.removeStyle === "function") {
        searcher.constructor.removeStyle(quillRef.current);
      } else {
        quillRef.current.formatText(
          0,
          quillRef.current.getText().length,
          { SearchedString: false },
          Quill.sources.SILENT
        );
      }
      quillRef.current.blur();
    }
  };

  const handleFind = useCallback(() => {
    if (!quillRef.current || !findText.trim()) {
      toast.error("Please enter text to find.");
      return;
    }
    const searcher = quillRef.current.getModule("Searcher");
    const matchCount = searcher.search(findText);
    if (matchCount > 0) {
      setMatches(new Array(matchCount).fill(null));
      setCurrentMatchIndex(0);
      toast.success(`Found ${matchCount} occurrence(s)`);
    } else {
      setMatches([]);
      setCurrentMatchIndex(-1);
      toast.error("No matches found");
    }
  }, [findText]);

  const handleNextMatch = useCallback(() => {
    if (!quillRef.current || matches.length === 0) return;
    const searcher = quillRef.current.getModule("Searcher");
    if (searcher.goToNextMatch()) {
      setCurrentMatchIndex((prevIndex) => (prevIndex + 1) % matches.length);
    }
  }, [matches]);

  const handlePrevMatch = useCallback(() => {
    if (!quillRef.current || matches.length === 0) return;
    const searcher = quillRef.current.getModule("Searcher");
    if (searcher.goToPrevMatch()) {
      setCurrentMatchIndex(
        (prevIndex) => (prevIndex - 1 + matches.length) % matches.length
      );
    }
  }, [matches]);

  const handleReplace = useCallback(() => {
    if (!quillRef.current || matches.length === 0 || currentMatchIndex === -1) {
      toast.error("No match selected to replace.");
      return;
    }
    const searcher = quillRef.current.getModule("Searcher");
    if (!searcher) {
      toast.error("Search module not available");
      return;
    }
    try {
      const success = searcher.replace(replaceText);
      if (success) {
        toast.success("Replaced one occurrence");
        const newMatchCount = searcher.search(findText);
        setMatches(new Array(newMatchCount).fill(null));
        if (newMatchCount === 0) {
          setCurrentMatchIndex(-1);
          toast("All occurrences of current find text replaced");
        } else {
          setCurrentMatchIndex((prev) => Math.min(prev, newMatchCount - 1));
        }
      } else {
        toast.error("Failed to replace");
      }
    } catch (error) {
      console.error("Replace error:", error);
      toast.error("Error during replace operation");
    }
  }, [findText, replaceText, matches, currentMatchIndex]);

  const handleReplaceAll = useCallback(() => {
    if (!quillRef.current || !findText.trim()) {
      toast.error("Please enter text to find for replace all.");
      return;
    }
    const searcher = quillRef.current.getModule("Searcher");
    if (!searcher) {
      toast.error("Search module not available");
      return;
    }
    try {
      if (matches.length === 0) {
        const initialMatchCount = searcher.search(findText);
        if (initialMatchCount === 0) {
          toast("No matches found to replace all.");
          return;
        }
      }

      const replacedCount = searcher.replaceAll(replaceText);
      if (replacedCount > 0) {
        toast.success(`Replaced ${replacedCount} occurrence(s)`);
        setFindText("");
        setReplaceText("");
        setMatches([]);
        setCurrentMatchIndex(-1);
      } else {
        toast.error("No replacements were made by replace all");
      }
    } catch (error) {
      console.error("Replace all error:", error);
      toast.error("Error during replace all operation");
    }
  }, [findText, replaceText, matches]);

  useEffect(() => {
    const handleKeyDownGlobal = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        if (matches.length > 0 && quillRef.current) {
          setTimeout(() => {
            if (quillRef.current) {
              const searcher = quillRef.current.getModule("Searcher");
              if (searcher) {
                searcher.constructor.removeStyle(quillRef.current);
                if (findText && isFindReplaceDialogOpen) {
                  try {
                    const matchCount = searcher.search(findText);
                    setMatches(new Array(matchCount).fill(null));
                    setCurrentMatchIndex(matchCount > 0 ? 0 : -1);
                  } catch (error) {
                    console.error("Re-search after undo error:", error);
                  }
                } else {
                  setMatches([]);
                  setCurrentMatchIndex(-1);
                }
              }
            }
          }, 0);
        }
      }
    };
    document.addEventListener("keydown", handleKeyDownGlobal);
    return () => {
      document.removeEventListener("keydown", handleKeyDownGlobal);
    };
  }, [matches, findText, isFindReplaceDialogOpen]);

  if (loading && !isInitialContentSet) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Loader />{" "}
      </div>
    );
  }
  if (error) {
    return (
      <div className="h-screen flex justify-center items-center text-red-500 p-4">
        {error}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      {/* Left Side: PDF Viewer */}
      <div
        style={{
          flex: 1,
          overflow: "auto", // Scroll for PDF if it's too long
          padding: "10px",
          borderRight: "1px solid #ccc",
          width: "50%",
        }}
      >
        {pdfUrl ? (
          <iframe
            src={pdfUrl}
            title={fileName || "Document Preview"}
            width="100%"
            height="100%"
            frameBorder="0"
          />
        ) : (
          <div className="flex justify-center items-center h-full">
            Loading PDF preview...
          </div>
        )}
      </div>

      {/* Right Side: Editor with Custom Toolbar - Reverted to original layout structure */}
      <div style={{ flex: 1, padding: "10px", overflowY: "auto" }}>
        {" "}
        {/* This div handles the scrolling for the right panel */}
        {/* Fixed Toolbar - using original sticky positioning */}
        <div
          style={{
            position: "sticky", // Sticky toolbar
            top: 0,
            zIndex: 10, // Ensure toolbar is above content
            backgroundColor: "#f8f9fa", // Give toolbar a background to prevent content showing through
            paddingBottom: "10px", // Space below toolbar before editor starts
            marginBottom: "10px", // Space below toolbar before editor starts (original had this)
            borderBottom: "1px solid #ccc", // Separator for toolbar
          }}
        >
          <div
            id="toolbar"
            style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}
          >
            <select className="ql-font" defaultValue="calibri">
              <option value="calibri">Calibri</option>
              <option value="times-new-roman">Times New Roman</option>
              <option value="arial">Arial</option>
              <option value="nirmala-ui">Nirmala UI</option>
            </select>
            <select className="ql-size" defaultValue="11pt">
              <option value="8pt">8pt</option>
              <option value="9pt">9pt</option>
              <option value="10pt">10pt</option>
              <option value="11pt">11pt</option>
              <option value="12pt">12pt</option>
              <option value="14pt">14pt</option>
              <option value="72pt">72pt</option>
            </select>
            <Tooltip title="Bold" arrow>
              <button className="ql-bold" />
            </Tooltip>
            <Tooltip title="Italic" arrow>
              <button className="ql-italic" />
            </Tooltip>
            <Tooltip title="Underline" arrow>
              <button className="ql-underline" />
            </Tooltip>
            <Tooltip title="Subscript" arrow>
              <button className="ql-script" value="sub" />
            </Tooltip>
            <Tooltip title="Superscript" arrow>
              <button className="ql-script" value="super" />
            </Tooltip>
            <Tooltip title="Text Color" arrow>
              <select className="ql-color" />
            </Tooltip>
            <Tooltip title="Background Color" arrow>
              <select className="ql-background" />
            </Tooltip>
            <Tooltip title="Align" arrow>
              <select className="ql-align" />
            </Tooltip>
            <Tooltip title="Ordered List" arrow>
              <button className="ql-list" value="ordered" />
            </Tooltip>
            <Tooltip title="Bullet List" arrow>
              <button className="ql-list" value="bullet" />
            </Tooltip>
            <Tooltip title="Decrease Indent" arrow>
              <button className="ql-indent" value="-1" />
            </Tooltip>
            <Tooltip title="Increase Indent" arrow>
              <button className="ql-indent" value="+1" />
            </Tooltip>
            <Tooltip title="Insert Image" arrow>
              <button className="ql-image" />
            </Tooltip>
            <Tooltip title="Insert Table" placement="top-end" arrow>
              <button
                className="ql-table-better"
                onClick={() => setShowTableDialog(true)}
              />
            </Tooltip>
            <Tooltip title="Page Break" arrow>
              <button className="ql-pageBreak">
                <InsertPageBreak />
              </button>
            </Tooltip>
            <Tooltip title="Find & Replace" arrow>
              <IconButton onClick={handleOpenFindReplaceDialog} size="small">
                <FindInPageIcon sx={{ fontSize: "20px" }} />
              </IconButton>
            </Tooltip>
            <>
              <Tooltip title="Download" arrow>
                <IconButton 
                  onMouseEnter={(e) => setDownloadAnchorEl(e.currentTarget)}
                  onClick={(e) => setDownloadAnchorEl(e.currentTarget)}
                  size="small"
                >
                  <DownloadIcon sx={{ fontSize: "20px" }} />
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={downloadAnchorEl}
                open={Boolean(downloadAnchorEl)}
                onClose={() => setDownloadAnchorEl(null)}
                MenuListProps={{
                  onMouseLeave: () => setDownloadAnchorEl(null)
                }}
              >
                <MenuItem onClick={() => handleDownload('pdf')}>
                  <ListItemIcon>
                    <PictureAsPdfIcon fontSize="small" sx={{ color: '#E53935' }} />
                  </ListItemIcon>
                  <ListItemText>Download PDF</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => handleDownload('docx')}>
                  <ListItemIcon>
                    <DescriptionIcon fontSize="small" sx={{ color: '#1E88E5' }} />
                  </ListItemIcon>
                  <ListItemText>Download DOCX</ListItemText>
                </MenuItem>
              </Menu>
            </>
            <Tooltip title="Clear Formatting" arrow>
              <button className="ql-clean" />
            </Tooltip>
            <div style={{ flexGrow: 1 }}></div> {/* Spacer */}
            {/* Reverted Back and Submit buttons to original HTML button structure and styling */}
            <div style={{ display: "flex", gap: "10px" }}>
            {companyId !== kyroId && (
              <Tooltip title="Toggle Notes Panel" arrow>
                <button
                  onClick={() => setIsNotesPanelOpen(!isNotesPanelOpen)}
                  style={{
                    borderRadius: "20px",
                    textTransform: "none",
                    padding: "10px 20px",
                    minWidth: "120px",
                    fontWeight: "bold",
                    fontSize: "14px",
                    color: "#000000",
                    backgroundColor: isNotesPanelOpen ? "#e0e0e0" : "#ffffff",
                    border: "1px solid #9c27b0",
                    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                    cursor: "pointer",
                    boxSizing: "border-box",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "40px",
                    lineHeight: "1",
                    transition: "all 0.2s ease",
                  }}
                  onMouseOver={(e) => {
                     e.currentTarget.style.backgroundColor = isNotesPanelOpen ? "#d5d5d5" : "#f5f5f5";
                  }}
                  onMouseOut={(e) => {
                     e.currentTarget.style.backgroundColor = isNotesPanelOpen ? "#e0e0e0" : "#ffffff";
                  }}
                >
                  <NoteAddIcon style={{ marginRight: "8px", fontSize: "18px" }} />
                  {isNotesPanelOpen ? "Close Notes" : "Add Notes"}
                </button>
              </Tooltip>
            )}
              <Tooltip title="Go back" arrow>
                <button
                  onClick={handleBack}
                  style={{
                    borderRadius: "20px",
                    textTransform: "none",
                    padding: "10px 20px",
                    minWidth: "100px",
                    fontWeight: "bold",
                    fontSize: "16px",
                    color: "#000000", // Original was black text
                    backgroundColor: "transparent",
                    border: "1px solid #1976d2", // Assuming a blue border like MUI outlined
                    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
                    cursor: "pointer",
                    boxSizing: "border-box",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "40px",
                    lineHeight: "1",
                  }}
                >
                  <ArrowBackIcon style={{ marginRight: "8px" }} />
                  Back
                </button>
              </Tooltip>
              <Tooltip title="Submit changes" arrow>
                <button
                  id="submit-button-editor" // Added ID for enabling/disabling
                  onClick={() => {
                    if (companyId !== kyroId && fileStatus === 6 && !hasExistingFeedback) {
                      handleOpenFeedbackDialog();
                    } else {
                      handleOpenDialog();
                    }
                  }}
                  style={{
                    borderRadius: "20px",
                    textTransform: "none",
                    padding: "10px 20px",
                    minWidth: "100px",
                    fontWeight: "bold",
                    fontSize: "16px",
                    color: "#000000", // Original was black text
                    backgroundColor: "#66bb6a", // Green background
                    border: "1px solid #66bb6a",
                    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
                    cursor: "pointer",
                    boxSizing: "border-box",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "40px",
                    lineHeight: "1",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.backgroundColor = "#558b2f")
                  } // Use currentTarget
                  onMouseOut={(e) =>
                    (e.currentTarget.style.backgroundColor = "#66bb6a")
                  } // Use currentTarget
                >
                  Submit
                </button>
              </Tooltip>
            </div>
          </div>
        </div>
        {/* Editor Container Wrapper - original structure */}
        <div
          style={{
            display: "flex",
            justifyContent: "center", // Centers the A4 page
            position: "relative", // For potential page number overlays if added later
          }}
        >
          <div
            ref={editorContainerRef}
            style={{
              // position: "relative", // Not needed here, parent has it
              width: "210mm",
              minHeight: "297mm", // A4 page will grow if content exceeds this
              backgroundColor: "#fff",
              padding: "20mm",
              border: "1px solid #ccc",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Sticky Notes Panel */}
        {isNotesPanelOpen && (
          <Box
            sx={{
              position: "fixed",
              bottom: "40px",
              right: "40px",
              width: "350px",
              backgroundColor: "#fffdf0",
              border: "1px solid #f0e68c",
              borderRadius: "8px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
              zIndex: 1000,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                backgroundColor: "#fff59d",
                padding: "8px 12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #f0e68c",
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: "bold", color: "#5a5a5a" }}>
                Reviewer Notes
              </Typography>
              <IconButton size="small" onClick={() => setIsNotesPanelOpen(false)}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
            <Box sx={{ p: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={8}
                placeholder={"Record issues like:\n- Incorrect translated text\n- Missing paragraphs\n- Formatting issues"}
                value={notesContent}
                onChange={(e) => setNotesContent(e.target.value)}
                variant="standard"
                InputProps={{
                  disableUnderline: true,
                  style: { fontSize: "14px", lineHeight: "1.5" },
                }}
              />
            </Box>
          </Box>
        )}

        <ConfirmationDialog
          open={dialogOpen}
          handleClose={handleCloseDialog}
          handleConfirm={handleSave}
          title="Confirm Submission"
          message="Are you sure you want to submit?"
        />
        {/* <TableDialog
          open={showTableDialog}
          onClose={() => setShowTableDialog(false)}
          onInsert={handleInsertTable}
          tableRows={tableRows}
          setTableRows={setTableRows}
          tableCols={tableCols}
          setTableCols={setTableCols}
        /> */}
        <Dialog
          open={isFindReplaceDialogOpen}
          onClose={handleCloseFindReplaceDialog}
          disableEnforceFocus
          hideBackdrop
          PaperProps={{
            sx: {
              position: "fixed",
              top: 70,
              right: 20,
              m: 0,
              width: 320,
              boxShadow: 5,
              borderRadius: 2,
              zIndex: 1301,
            },
          }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              pb: 1,
              fontSize: "1rem",
            }}
          >
            Find and Replace
            <IconButton
              edge="end"
              color="inherit"
              onClick={handleCloseFindReplaceDialog}
              aria-label="close"
              size="small"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ pt: 1 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Find"
              type="text"
              fullWidth
              variant="outlined"
              size="small"
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Replace with"
              type="text"
              fullWidth
              variant="outlined"
              size="small"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
            />
            {matches.length > 0 && (
              <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
                Match {currentMatchIndex + 1} of {matches.length}
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ justifyContent: "space-between", px: 2, py: 1 }}>
            <Button
              onClick={handleFind}
              variant="contained"
              color="primary"
              size="small"
            >
              Find
            </Button>
            <Box>
              <Button
                onClick={handlePrevMatch}
                disabled={matches.length <= 1}
                size="small"
                sx={{ mr: 0.5 }}
              >
                Prev
              </Button>
              <Button
                onClick={handleNextMatch}
                disabled={matches.length <= 1}
                size="small"
              >
                Next
              </Button>
            </Box>
          </DialogActions>
          <DialogActions
            sx={{ justifyContent: "space-between", px: 2, pb: 1.5, pt: 0 }}
          >
            <Button
              onClick={handleReplace}
              disabled={currentMatchIndex === -1}
              variant="outlined"
              color="success"
              size="small"
            >
              Replace
            </Button>{" "}
            {/* MUI Button is fine here */}
            <Button
              onClick={handleReplaceAll}
              variant="contained"
              color="secondary"
              size="small"
            >
              Replace All
            </Button>{" "}
            {/* MUI Button is fine here */}
          </DialogActions>
        </Dialog>

        <Dialog
          open={isFeedbackOpen}
          onClose={() => {
            if (!submittingFeedback) setIsFeedbackOpen(false);
          }}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            sx: {
              borderRadius: "16px",
              padding: "8px",
            },
          }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontWeight: "bold",
              pb: 1,
            }}
          >
            Submit Quality Feedback
            <IconButton
              edge="end"
              color="inherit"
              onClick={() => setIsFeedbackOpen(false)}
              disabled={submittingFeedback}
              aria-label="close"
              size="small"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ py: 2 }}>
            <Typography variant="body2" sx={{ color: "#666", mb: 2 }}>
              Please rate the quality of the translation or document review:
            </Typography>

            <Box
              display="grid"
              gridTemplateColumns="repeat(4, 1fr)"
              gap={1.5}
              sx={{
                mb: (feedbackRating === "poor" || feedbackRating === "average") ? 2 : 0,
                transition: "margin 0.3s ease",
              }}
            >
              {[
                { value: "outstanding", label: "Outstanding", emoji: "🌟", color: "#4caf50", bg: "#e8f5e9" },
                { value: "good", label: "Good", emoji: "👍", color: "#2196f3", bg: "#e3f2fd" },
                { value: "average", label: "Average", emoji: "😐", color: "#ff9800", bg: "#fff3e0" },
                { value: "poor", label: "Poor", emoji: "😞", color: "#f44336", bg: "#ffebee" }
              ].map((r) => {
                const isSelected = feedbackRating === r.value;
                return (
                  <Box
                    key={r.value}
                    onClick={() => setFeedbackRating(r.value)}
                    sx={{
                      border: `2px solid ${isSelected ? r.color : "#e0e0e0"}`,
                      backgroundColor: isSelected ? r.bg : "transparent",
                      borderRadius: "12px",
                      padding: "16px 8px",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 0.2s ease-in-out",
                      '&:hover': {
                        transform: "translateY(-2px)",
                        borderColor: r.color,
                        backgroundColor: isSelected ? r.bg : "#f9f9f9",
                        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.05)",
                      },
                    }}
                  >
                    <Typography variant="h4" sx={{ mb: 1, filter: isSelected ? "none" : "grayscale(30%)" }}>
                      {r.emoji}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: isSelected ? "bold" : "normal",
                        color: isSelected ? r.color : "#555",
                      }}
                    >
                      {r.label}
                    </Typography>
                  </Box>
                );
              })}
            </Box>

            {(feedbackRating === "poor" || feedbackRating === "average") && (
              <Box
                sx={{
                  mt: 2,
                  animation: "fadeIn 0.3s ease",
                  "@keyframes fadeIn": {
                    "0%": { opacity: 0, transform: "translateY(-10px)" },
                    "100%": { opacity: 1, transform: "translateY(0)" },
                  },
                }}
              >
                <FormControl fullWidth sx={{ mb: 2 }} size="small" error={submitFeedbackAttempted && !feedbackCategory}>
                  <InputLabel id="feedback-category-label">Issue Category *</InputLabel>
                  <Select
                    labelId="feedback-category-label"
                    value={feedbackCategory}
                    label="Issue Category *"
                    onChange={(e) => setFeedbackCategory(e.target.value)}
                  >
                    <MenuItem value="Translation Accuracy">Translation Accuracy</MenuItem>
                    <MenuItem value="Formatting">Formatting</MenuItem>
                    <MenuItem value="Missing Content">Missing Content</MenuItem>
                    <MenuItem value="Tone/Style">Tone/Style</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 2 }} size="small" error={submitFeedbackAttempted && !feedbackSeverity}>
                  <InputLabel id="feedback-severity-label">Severity Level *</InputLabel>
                  <Select
                    labelId="feedback-severity-label"
                    value={feedbackSeverity}
                    label="Severity Level *"
                    onChange={(e) => setFeedbackSeverity(e.target.value)}
                  >
                    <MenuItem value="Low">Low</MenuItem>
                    <MenuItem value="Medium">Medium</MenuItem>
                    <MenuItem value="High">High</MenuItem>
                    <MenuItem value="Critical">Critical</MenuItem>
                  </Select>
                </FormControl>

                <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "600", color: "#555" }}>
                  Please tell us why it is {feedbackRating}: <span style={{ color: "#f44336" }}>*</span>
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Tell us what went wrong or how we can improve..."
                  value={feedbackReason}
                  onChange={(e) => setFeedbackReason(e.target.value)}
                  variant="outlined"
                  error={submitFeedbackAttempted && !feedbackReason.trim()}
                  helperText={submitFeedbackAttempted && !feedbackReason.trim() ? "This field is required for Poor and Average ratings" : ""}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px',
                    }
                  }}
                />
              </Box>
            )}

            <Box sx={{ mt: 2 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                placeholder="Any additional feedback or general comments? (Optional)"
                value={feedbackAdditional}
                onChange={(e) => setFeedbackAdditional(e.target.value)}
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  }
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ px: 2, py: 1.5 }}>
            <Button
              onClick={() => setIsFeedbackOpen(false)}
              disabled={submittingFeedback}
              sx={{ borderRadius: "20px", px: 3, textTransform: "none", fontWeight: "bold" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleFeedbackSubmit}
              disabled={submittingFeedback || !feedbackRating || ((feedbackRating === "poor" || feedbackRating === "average") && (!feedbackReason.trim() || !feedbackCategory || !feedbackSeverity))}
              variant="contained"
              sx={{
                borderRadius: "20px",
                px: 4,
                textTransform: "none",
                fontWeight: "bold",
                backgroundColor: "#ffa726",
                '&:hover': {
                  backgroundColor: "#ef6c00",
                },
              }}
            >
              {submittingFeedback ? "Submitting..." : "Submit"}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default Editor;
