import React, { useCallback, useEffect, useRef, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import TableModule from "quill-better-table";
import "quill-better-table/dist/quill-better-table.css";
import useDebounce from "../hooks/useDebounce";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Button, IconButton, Typography } from "@mui/material";
import { auth } from "../utils/firebase";
import ConfirmationDialog from "./ConfirmationDialog";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
import CloseIcon from "@mui/icons-material/Close";
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
import { kyroCompanyId } from "../services/companyServices";
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

Quill.register("modules/resize", QuillResizeImage);

Quill.register(
  {
    "modules/better-table": TableModule,
  },
  true
);
Quill.register(SearchedStringBlot);
Quill.register("modules/Searcher", Searcher);

const icons = Quill.import("ui/icons");
icons["better-table"] = `
  <svg viewBox="0 0 18 18">
    <rect class="ql-stroke" height="12" width="12" x="3" y="3"></rect>
    <line class="ql-stroke" x1="3" x2="15" y1="7" y2="7"></line>
    <line class="ql-stroke" x1="3" x2="15" y1="11" y2="11"></line>
    <line class="ql-stroke" x1="7" x2="7" y1="3" y2="15"></line>
    <line class="ql-stroke" x1="11" x2="11" y1="3" y2="15"></line>
  </svg>
`;

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
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={onInsert} variant="contained" color="primary">
          Insert
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const Editor = () => {
  const { projectId, documentId } = useParams();
  const navigate = useNavigate();

  const [htmlContent, setHtmlContent] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(true);
  const [kyroId, setKyroId] = useState();
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isInitialContentSet, setIsInitialContentSet] = useState(false);
  const debouncedHtmlContent = useDebounce(htmlContent, 3000);
  const [companyId, setCompanyId] = useState(null);
  const [role, setRole] = useState();
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  // State for Table Dialog.
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  // New states for Find & Replace functionality
  const [isFindReplaceDialogOpen, setIsFindReplaceDialogOpen] = useState(false);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const [matches, setMatches] = useState([]);

  // New state for number of pages in the editor.
  const [pageCount, setPageCount] = useState(1);
  const editorContainerRef = useRef(null);
  const quillRef = useRef(null);

  // Add these state variables at the component level, not inside a useEffect
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Network status monitoring useEffect
  useEffect(() => {
    // Handler when user goes offline
    const handleOffline = () => {
      setIsOnline(false);
      toast.error(
        "You're offline 😢. Don't refresh the page or you may lose unsaved changes. We'll auto-save when connection returns.",
        {
          duration: 10000,
          id: "offline-toast", // Using an ID prevents duplicate toasts
        }
      );

      // Disable the Submit button when offline
      const submitButton = document.querySelector(
        "button[onClick='handleSave']"
      );
      if (submitButton) submitButton.disabled = true;
    };

    // Handler when user comes back online
    const handleOnline = () => {
      setIsOnline(true);
      toast.success("You're back online! Your changes will now be saved.", {
        id: "online-toast",
      });

      // Re-enable the Submit button
      const submitButton = document.querySelector(
        "button[onClick='handleSave']"
      );
      if (submitButton) submitButton.disabled = false;

      // Try to save content immediately when coming back online
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

    // Listen for network status changes
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    // Monitor for beforeunload event to warn about unsaved changes
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges || !isOnline) {
        // Standard way to show a confirmation dialog before leaving
        e.preventDefault();
        const message =
          "You have unsaved changes. Are you sure you want to leave?";
        e.returnValue = message; // For Chrome
        return message; // For other browsers
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    // Clean up all event listeners
    return () => {
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges, isOnline]); // Dependencies

  // Track editor changes in a separate useEffect
  useEffect(() => {
    if (quillRef.current) {
      const trackChanges = () => {
        quillRef.current.on("text-change", () => {
          setHasUnsavedChanges(true);
        });
      };
      trackChanges();

      return () => {
        quillRef.current.off("text-change");
      };
    }
  }, [quillRef.current]); // Only re-run if quillRef.current changes

  // Update document title based on unsaved changes
  useEffect(() => {
    if (hasUnsavedChanges) {
      document.title = `* ${fileName || "Document"} (Unsaved changes)`;
    } else {
      document.title = fileName || "Document";
    }
  }, [hasUnsavedChanges, fileName]);

  // Server ping functionality in a separate useEffect
  useEffect(() => {
    let pingInterval;

    // Only run the ping check when browser reports we're online
    if (navigator.onLine) {
      pingInterval = setInterval(async () => {
        try {
          // Using a lightweight endpoint that returns quickly
          const response = await fetch(`${server}`, {
            method: "GET",
            // Small timeout to avoid hanging
            signal: AbortSignal.timeout(3000),
          });

          if (!response.ok && isOnline) {
            // We thought we were online but server is unreachable
            setIsOnline(false);
            toast.warning(
              "Connection to server is unstable. Your changes will be backed up locally.",
              {
                id: "connection-warning",
                duration: 5000,
              }
            );
          } else if (response.ok && !isOnline) {
            // Connection restored
            setIsOnline(true);
            // Manually trigger online handler here or set a flag
            // to trigger in the main online/offline useEffect
          }
        } catch (error) {
          if (error.name !== "AbortError" && isOnline) {
            // Only update if not a timeout and we thought we were online
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
      }, 30000); // Check every 30 seconds
    }

    return () => clearInterval(pingInterval);
  }, [isOnline]);

  // Modified saveContent function with offline support
  const saveContent = async () => {
    if (!htmlContent) return;

    try {
      // If offline, store in localStorage as backup
      if (!navigator.onLine) {
        localStorage.setItem(`editor_backup_${documentId}`, htmlContent);
        setHasUnsavedChanges(true);
        return;
      }

      const blob = new Blob([htmlContent], {
        type: "text/html; charset=utf-8",
      });

      await updateDocumentContent(projectId, documentId, blob);
      setHasUnsavedChanges(false);

      // Clear any backup from localStorage after successful save
      localStorage.removeItem(`editor_backup_${documentId}`);
    } catch (err) {
      console.error("Error saving document:", err);

      // Fallback to localStorage if server save fails
      localStorage.setItem(`editor_backup_${documentId}`, htmlContent);
      setHasUnsavedChanges(true);
    }
  };

  // Auto-save debounced changes.
  useEffect(() => {
    if (debouncedHtmlContent) {
      saveContent();
    }
  }, [debouncedHtmlContent]);

  // Check for local backup when initializing
  useEffect(() => {
    const checkForLocalBackup = () => {
      const backupContent = localStorage.getItem(`editor_backup_${documentId}`);

      if (backupContent && quillRef.current) {
        // Show recovery dialog to user
        if (
          confirm(
            "We found a locally saved backup of your document. Would you like to recover it?"
          )
        ) {
          quillRef.current.clipboard.dangerouslyPasteHTML(backupContent);
          toast.success("Backup content has been restored!");
        } else {
          // If user declines, remove the backup
          localStorage.removeItem(`editor_backup_${documentId}`);
        }
      }
    };

    if (isInitialContentSet && quillRef.current) {
      checkForLocalBackup();
    }
  }, [isInitialContentSet, documentId]);

  const extractTextOnly = (node) => {
    if (!node) return "";

    // If it's a text node, return its text content
    if (node.nodeType === 3) return node.textContent;

    // If it's not an element node, return empty string
    if (node.nodeType !== 1) return "";

    // Recursively extract text from children
    let text = "";
    for (let child of node.childNodes) {
      text += extractTextOnly(child);
    }

    // Add spaces around block elements to separate words
    if (window.getComputedStyle(node).display === "block") {
      text = " " + text + " ";
    }

    return text;
  };

  

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
    if (
      isInitialContentSet &&
      editorContainerRef.current &&
      !quillRef.current
    ) {
      // Register the necessary Quill components
      const Inline = Quill.import("blots/inline");

      // Define the SearchedStringBlot class
      class SearchedStringBlot extends Inline {}
      SearchedStringBlot.blotName = "SearchedString";
      SearchedStringBlot.className = "ql-searched-string";
      SearchedStringBlot.tagName = "span";

      // Register the blot
      Quill.register(SearchedStringBlot);

      // Configure Quill modules
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
        "better-table": {
          operationMenu: {
            items: {
              mergeCells: {
                text: "Merge Cells",
              },
              unmergeCells: {
                text: "Unmerge Cells",
              },
            },
            color: {
              colors: ["green", "red", "yellow", "blue", "white"],
              text: "Background Colors:",
            },
          },
          keyboard: {
            bindings: TableModule.keyboardBindings,
          },
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
                // Get the current contents before attempting undo
                const beforeContents = this.quill.getContents();
                const beforeLength = this.quill.getLength();

                // Check if there's anything in the undo stack
                const history = this.quill.history;
                if (
                  !history ||
                  !history.stack ||
                  !history.stack.undo ||
                  history.stack.undo.length === 0
                ) {
                  // No undo history, do nothing
                  console.log("Nothing to undo");
                  return false;
                }

                // Try to undo
                this.quill.history.undo();

                // Check if the editor is now empty (just contains a newline)
                if (this.quill.getLength() <= 1 && beforeLength > 1) {
                  // Undo cleared the editor - restore previous content
                  this.quill.setContents(beforeContents);

                  // Reset the undo stack to prevent further undos
                  this.quill.history.stack.undo = [];

                  console.log(
                    "You've reached the beginning of your edit history"
                  );
                }

                return false;
              },
            },
          },
        },
      };

      // Initialize Quill
      quillRef.current = new Quill(editorContainerRef.current, {
        theme: "snow",
        modules,
      });

     

      // Wait until next tick to add clipboard matchers
      setTimeout(() => {
        // Add clipboard matchers after initialization is complete
        if (quillRef.current && quillRef.current.clipboard) {
          const Delta = Quill.import("delta");

          quillRef.current.clipboard.addMatcher("td", (node, delta) => {
            const textContent = extractTextOnly(node);
            return new Delta().insert(textContent);
          });

          quillRef.current.clipboard.addMatcher("table", (node, delta) => {
            const textContent = extractTextOnly(node);
            return new Delta().insert(textContent);
          });

          quillRef.current.clipboard.addMatcher(
            "div.quill-better-table-wrapper",
            (node, delta) => {
              const textContent = extractTextOnly(node);
              return new Delta().insert(textContent);
            }
          );

          // Add paste event listener
          quillRef.current.root.addEventListener("paste", function (e) {
            const selection = quillRef.current.getSelection();
            if (!selection) return;

            const [leaf] = quillRef.current.getLeaf(selection.index);
            let isInsideTableCell = false;

            let node = leaf.domNode;
            while (node && node !== quillRef.current.root) {
              if (
                node.tagName === "TD" ||
                node.classList.contains("qlbt-cell-line")
              ) {
                isInsideTableCell = true;
                break;
              }
              node = node.parentNode;
            }

            if (isInsideTableCell) {
              e.preventDefault();
              const text = e.clipboardData.getData("text/plain");
              quillRef.current.insertText(selection.index, text, "user");
            }
          });
        }
      }, 100); // Short delay to ensure initialization is complete

      // Process the initial HTML content for tab spaces
      if (htmlContent) {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = htmlContent;

        // Find all text nodes that might contain non-breaking spaces
        const textNodes = [];
        const findTextNodes = (node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            textNodes.push(node);
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            Array.from(node.childNodes).forEach(findTextNodes);
          }
        };

        findTextNodes(tempDiv);

        // Replace any sequences of 8 consecutive &nbsp; with a special marker
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

        // Get the processed HTML
        const processedContent = tempDiv.innerHTML;

        // Load the content with the special markers
        quillRef.current.clipboard.dangerouslyPasteHTML(processedContent);

        // Now replace the markers with actual non-breaking spaces
        const Delta = Quill.import("delta");
        const delta = quillRef.current.getContents();
        const newDelta = new Delta();

        delta.ops.forEach((op) => {
          if (typeof op.insert === "string" && op.insert.includes("§TAB§")) {
            const parts = op.insert.split("§TAB§");
            for (let i = 0; i < parts.length; i++) {
              if (i > 0) {
                // Insert our tab spaces
                newDelta.insert(
                  "\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0",
                  op.attributes
                );
              }
              if (parts[i]) {
                newDelta.insert(parts[i], op.attributes);
              }
            }
          } else {
            newDelta.insert(op.insert, op.attributes);
          }
        });

        quillRef.current.setContents(newDelta);

        // Clear the history stack to make this the starting point
        if (quillRef.current.history) {
          quillRef.current.history.clear();
        }
      }

      // Add text-change handler to preserve tab spaces
      quillRef.current.on("text-change", () => {
        // Get the editor content
        const editorHtml =
          editorContainerRef.current.querySelector(".ql-editor").innerHTML;

        // Preserve tab spaces
        const preservedHtml = editorHtml.replace(
          /(\u00A0){8}/g,
          '<span class="ql-tab-space">\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0</span>'
        );

        setHtmlContent(preservedHtml);
      });

      // Add keyboard event listener for Ctrl+Z prevention
      const handleKeyDown = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
          if (quillRef.current.getLength() <= 2) {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }
        }
      };
      document.addEventListener("keydown", handleKeyDown, true);

      // Prevent deleting an empty table cell
      const handleTableCellDelete = (e) => {
        if (e.key === "Backspace" || e.key === "Delete") {
          const sel = quillRef.current.getSelection();
          if (!sel) return;
          const [leaf] = quillRef.current.getLeaf(sel.index);
          let node = leaf.domNode;
          // Walk up until we hit the table cell (<td>) or the editor root
          while (node && node !== quillRef.current.root) {
            if (
              node.tagName === "TD" ||
              node.classList.contains("qlbt-cell-line")
            ) {
              // If the cell is empty (no text or just whitespace), block deletion
              if (!node.textContent.trim()) {
                e.preventDefault();
                return;
              }
              break;
            }
            node = node.parentNode;
          }
        }
      };
      quillRef.current.root.addEventListener(
        "keydown",
        handleTableCellDelete,
        true
      );

      // Set up the table button
      const tableButton = document.querySelector(".ql-better-table");
      if (tableButton) {
        tableButton.addEventListener("click", (e) => {
          e.preventDefault();
          setShowTableDialog(true);
        });
      }

      // Clean up function
      return () => {
        document.removeEventListener("keydown", handleKeyDown, true);
      };
    }
  }, [isInitialContentSet, htmlContent]);


  // Add CSS for tab spaces
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

  // Auto-save debounced changes.
  // useEffect(() => {
  //   const saveContent = async () => {
  //     if (!debouncedHtmlContent) return;
  //     try {
  //       const blob = new Blob([debouncedHtmlContent], {
  //         type: "text/html; charset=utf-8",
  //       });
  //       await updateDocumentContent(projectId, documentId, blob);
  //     } catch (err) {
  //       console.error("Error saving document (debounced save):", err);
  //     }
  //   };
  //   saveContent();
  // }, [debouncedHtmlContent, projectId, documentId]);

  useEffect(() => {
    setIsLayoutReady(true);
    return () => setIsLayoutReady(false);
  }, []);

  useEffect(() => {
    const fetchKyroticsCompanyId = async () => {
      try {
        const kyroId = await kyroCompanyId();
        setKyroId(kyroId);
      } catch (err) {
        console.error(err);
      }
    };
    fetchKyroticsCompanyId();
  }, []);

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

  const handleInsertTable = () => {
    const betterTable = quillRef.current.getModule("better-table");
    if (betterTable) {
      betterTable.insertTable(tableRows, tableCols);
    }
    setShowTableDialog(false);
  };

  const handleSave = async () => {
    try {
      const serverDate = await fetchServerTimestamp();
      const formattedDate = formatDate(serverDate);
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
      console.log("Document status updated");
    } catch (err) {
      console.error("Error updating document status:", err);
    }
  };

  const handleDownload = async () => {
    setError(null);
    try {
      const endpoint = `${server}/api/document/${projectId}/${documentId}/downloadDocx`;
      await toast
        .promise(axios.get(endpoint, { responseType: "blob" }), {
          loading: "Downloading...",
          success: "Zip File Downloaded!",
          error: "An error occurred while downloading the document.",
        })
        .then((response) => {
          const contentDisposition = response.headers["content-disposition"];
          const filename = contentDisposition
            ? contentDisposition.split("filename=")[1].replace(/"/g, "")
            : "document.zip";
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

  const handleOpenDialog = () => {
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  // ------------------------------------------------------------------
  // Find & Replace Handlers
  // ------------------------------------------------------------------
  const handleOpenFindReplaceDialog = () => {
    setIsFindReplaceDialogOpen(true);
    setCurrentMatchIndex(-1);
    setMatches([]);

    // Check if there's text selected in the editor
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

    // Clear any search highlights
    if (quillRef.current) {
      const searcher = quillRef.current.getModule("Searcher");
      if (searcher) {
        // Use the Searcher's removeStyle static method
        searcher.constructor.removeStyle(quillRef.current);
      } else {
        // Fallback to direct formatting if module not available
        quillRef.current.formatText(
          0,
          quillRef.current.getText().length,
          {
            SearchedString: false, // Use the format name, not 'background'
          },
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

    // Get the Searcher module instance
    const searcher = quillRef.current.getModule("Searcher");

    // Perform the search
    const matchCount = searcher.search(findText);

    if (matchCount > 0) {
      setMatches(new Array(matchCount).fill(null)); // Just to track count
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
      // Update the current match index
      setCurrentMatchIndex((prevIndex) => (prevIndex + 1) % matches.length);
    }
  }, [matches]);

  const handlePrevMatch = useCallback(() => {
    if (!quillRef.current || matches.length === 0) return;

    const searcher = quillRef.current.getModule("Searcher");
    if (searcher.goToPrevMatch()) {
      // Update the current match index
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
      // Use the searcher's replace method
      const success = searcher.replace(replaceText);

      if (success) {
        toast.success("Replaced one occurrence");

        // Update our tracking of matches count after replacement
        const newMatchCount = searcher.search(findText);
        setMatches(new Array(newMatchCount).fill(null));

        if (newMatchCount === 0) {
          setCurrentMatchIndex(-1);
          toast("All occurrences replaced");
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
      toast.error("Please enter text to find.");
      return;
    }

    const searcher = quillRef.current.getModule("Searcher");
    if (!searcher) {
      toast.error("Search module not available");
      return;
    }

    try {
      // If no matches found, run search first
      if (matches.length === 0) {
        const matchCount = searcher.search(findText);
        if (matchCount === 0) {
          toast("No matches found");
          return;
        }
        setMatches(new Array(matchCount).fill(null));
      }

      // Use the searcher's replaceAll method
      const replacedCount = searcher.replaceAll(replaceText);

      if (replacedCount > 0) {
        toast.success(`Replaced ${replacedCount} occurrence(s)`);

        // Reset state
        setFindText("");
        setReplaceText("");
        setMatches([]);
        setCurrentMatchIndex(-1);

        // Keep dialog open with a delay to show success message
        setTimeout(() => {
          handleCloseFindReplaceDialog();
        }, 1000);
      } else {
        toast.error("No replacements were made");
      }
    } catch (error) {
      console.error("Replace all error:", error);
      toast.error("Error during replace all operation");
    }
  }, [findText, replaceText, matches]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Check for Ctrl+Z or Command+Z (Mac)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        // If we have an ongoing search, clear highlights after undo
        if (matches.length > 0) {
          // Use setTimeout to execute after undo operation completes
          setTimeout(() => {
            if (quillRef.current) {
              const searcher = quillRef.current.getModule("Searcher");
              if (searcher) {
                // Clear highlights
                searcher.constructor.removeStyle(quillRef.current);

                // Re-apply search to get updated positions after undo
                if (findText && isFindReplaceDialogOpen) {
                  try {
                    const matchCount = searcher.search(findText);
                    setMatches(new Array(matchCount).fill(null));
                    if (matchCount === 0) {
                      setCurrentMatchIndex(-1);
                    }
                  } catch (error) {
                    console.error("Re-search after undo error:", error);
                  }
                }
              }
            }
          }, 0);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [matches, findText, isFindReplaceDialogOpen]);

  if (loading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <Loader />{" "}
      </div>
    );
  }
  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw" }}>
      {/* Left Side: PDF Viewer */}
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
          <iframe src={pdfUrl} title={fileName} width="100%" height="100%" />
        ) : (
          <div>Loading...</div>
        )}
      </div>

      {/* Right Side: Editor with Custom Toolbar */}
      <div style={{ flex: 1, padding: "10px", overflowY: "auto" }}>
        {/* Fixed Toolbar */}
        <div
          style={{
            position: "sticky",
            top: 0,
            zIndex: 10,
            paddingBottom: "10px",
            marginBottom: "10px",
          }}
        >
          <div id="toolbar" style={{ display: "flex", alignItems: "center" }}>
            <select className="ql-font">
              <option value="calibri">Calibri</option>
              <option value="times-new-roman">Times New Roman</option>
              <option value="arial">Arial</option>
              <option value="nirmala-ui">Nirmala UI</option>
            </select>
            <select className="ql-size">
              <option value="8pt">8pt</option>
              <option value="9pt">9pt</option>
              <option value="10pt">10pt</option>
              <option value="11pt">11pt</option>
              <option value="12pt">12pt</option>
              <option value="14pt">14pt</option>
              <option value="16pt">16pt</option>
              <option value="18pt">18pt</option>
              <option value="20pt">20pt</option>
              <option value="22pt">22pt</option>
              <option value="24pt">24pt</option>
              <option value="26pt">26pt</option>
              <option value="28pt">28pt</option>
              <option value="36pt">36pt</option>
              <option value="48pt">48pt</option>
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
            <select className="ql-color" title="Text Color" />
            <select className="ql-background" title="Background Color" />
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
            <Tooltip title="Insert Table" arrow>
              <button className="ql-better-table" />
            </Tooltip>
            <Tooltip title="Page Break" arrow>
              <button className="ql-pageBreak">
                <InsertPageBreak />
              </button>
            </Tooltip>
            <Tooltip title="Find & Replace">
              <FindInPageIcon
                onClick={handleOpenFindReplaceDialog}
                sx={{
                  fontSize: "20px",
                  cursor: "pointer",
                }}
              />
            </Tooltip>
            <Tooltip title="Download">
              <DownloadIcon
                onClick={handleDownload}
                sx={{ fontSize: "20px" }}
                className="text-gray-600 hover:text-blue-600 hover:scale-125 cursor-pointer"
              />
            </Tooltip>
            <Tooltip title="Clear Formatting" arrow>
              <button className="ql-clean" />
            </Tooltip>
            {/* Spacer */}
            <div style={{ flexGrow: 1 }}></div>
            <div style={{ display: "flex", gap: "10px" }}>
              <Tooltip title="Go back" arrow>
                <button
                  onClick={handleBack}
                  style={{
                    borderRadius: "20px",
                    textTransform: "none",
                    padding: "10px 20px", // Matches Submit button padding
                    minWidth: "100px", // Matches Submit button minWidth
                    fontWeight: "bold",
                    fontSize: "16px", // Matches Submit button fontSize
                    color: "#00000", // Default Material-UI primary color (blue)
                    backgroundColor: "transparent", // No green background by default
                    border: "1px solid #1976d2", // Blue border to match outlined style
                    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
                    cursor: "pointer",
                    boxSizing: "border-box",
                    display: "flex", // Flexbox for centering
                    alignItems: "center", // Vertically center content
                    justifyContent: "center", // Horizontally center content
                    height: "40px", // Matches Submit button height
                    lineHeight: "1", // Matches Submit button lineHeight
                  }}
                >
                  <ArrowBackIcon style={{ marginRight: "8px" }} />{" "}
                  {/* Matches startIcon */}
                  Back
                </button>
              </Tooltip>
              <Tooltip title="Submit changes" arrow>
                <button
                  onClick={handleOpenDialog}
                  style={{
                    borderRadius: "20px",
                    textTransform: "none",
                    padding: "10px 20px", // Consistent padding
                    minWidth: "100px", // Minimum width for the button
                    fontWeight: "bold",
                    fontSize: "16px", // Explicit font size
                    color: "#000000",
                    backgroundColor: "#66bb6a", // Green background
                    border: "1px solid #66bb6a",
                    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
                    cursor: "pointer",
                    boxSizing: "border-box",
                    display: "flex", // Flexbox to center content
                    alignItems: "center", // Vertically center the text
                    justifyContent: "center", // Horizontally center the text
                    height: "40px", // Explicit height to control button size
                    lineHeight: "1", // Normalize line height to prevent shifting
                  }}
                  onMouseOver={(e) =>
                    (e.target.style.backgroundColor = "#558b2f")
                  }
                  onMouseOut={(e) =>
                    (e.target.style.backgroundColor = "#66bb6a")
                  }
                >
                  Submit
                </button>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Editor Container Wrapper with Page Numbers Overlay */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <div
            ref={editorContainerRef}
            style={{
              position: "relative",
              width: "210mm", // A4 width (portrait)
              minHeight: "297mm", // A4 height (portrait)
              backgroundColor: "#fff",
              padding: "20mm",
              border: "1px solid #ccc",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
              boxSizing: "border-box",
            }}
          />
        </div>

        <ConfirmationDialog
          open={dialogOpen}
          handleClose={handleCloseDialog}
          handleConfirm={handleSave}
          title="Confirm Submission"
          message="Are you sure you want to submit?"
        />
        <TableDialog
          open={showTableDialog}
          onClose={() => setShowTableDialog(false)}
          onInsert={handleInsertTable}
          tableRows={tableRows}
          setTableRows={setTableRows}
          tableCols={tableCols}
          setTableCols={setTableCols}
        />
        {/* Find & Replace Dialog */}

        <Dialog
          open={isFindReplaceDialogOpen}
          onClose={handleCloseFindReplaceDialog}
          disableEnforceFocus
          hideBackdrop
          PaperProps={{
            sx: {
              position: "fixed",
              top: 20,
              right: 20,
              m: 0,
              width: 320,
              maxWidth: "90vw",
              boxShadow: 5,
              borderRadius: 2,
            },
          }}
        >
          <DialogTitle
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              pb: 1,
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
          <DialogContent dividers sx={{ pt: 2 }}>
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
          <DialogActions
            sx={{ justifyContent: "space-between", px: 2, py: 1.5 }}
          >
            <Box>
              <Button
                onClick={handleFind}
                variant="contained"
                color="primary"
                size="small"
              >
                Find
              </Button>
            </Box>
            <Box>
              <Button
                onClick={handlePrevMatch}
                disabled={matches.length <= 1}
                size="small"
                sx={{ mr: 1 }}
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
            sx={{ justifyContent: "space-between", px: 2, py: 1.5 }}
          >
            <Button
              onClick={handleReplace}
              disabled={currentMatchIndex === -1}
              variant="contained"
              color="success"
              size="small"
            >
              Replace
            </Button>
            <Button
              onClick={handleReplaceAll}
              variant="contained"
              color="error"
              size="small"
            >
              Replace All
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default Editor;
