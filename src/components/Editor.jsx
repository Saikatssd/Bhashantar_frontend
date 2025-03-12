import React, { useCallback, useEffect, useRef, useState } from "react";
import Quill  from "quill";
import "quill/dist/quill.snow.css";
import TableModule from "quill-better-table";
import "quill-better-table/dist/quill-better-table.css";
import useDebounce from "../hooks/useDebounce";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Typography } from "@mui/material";
import { auth } from "../utils/firebase";
import ConfirmationDialog from "./ConfirmationDialog";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
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
// import 'quill-pagination';
// import 'quill-pagination/lib/style.css';

Quill.register("modules/resize", QuillResizeImage);

Quill.register(
  {
    "modules/better-table": TableModule,
  },
  true
);

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

  // Constant to convert mm to px (standard 96 DPI)
  // const mmToPx = 96 / 25.4;
  // const pageHeightPx = 297 * mmToPx; // A4 page height in px (approx 1123px)

  // // Update page count based on editor container height.
  // useEffect(() => {
  //   function updatePageCount() {
  //     const editorContentEl =
  //       editorContainerRef.current?.querySelector(".ql-editor");
  //     if (editorContentEl) {
  //       const height = editorContentEl.scrollHeight;
  //       const count = Math.ceil(height / pageHeightPx);
  //       setPageCount(count);
  //     }
  //   }
  //   // Update after content has been rendered.
  //   updatePageCount();
  //   window.addEventListener("resize", updatePageCount);
  //   return () => window.removeEventListener("resize", updatePageCount);
  // }, [htmlContent, pageHeightPx]);

  // console.log("htmlContent", htmlContent);
  useEffect(() => {
    const handleOffline = () => {
      toast.error(
        "Oops! You're offline 😢. Don't refresh now, or you might lose your progress. Hang tight!",
        { duration: 5000 }
      );
    };
    const handleOnline = () => {
      toast.success("You are back online 😍!");
    };
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);
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
          userOnly: true
        },
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
              key: 'z',
              shortKey: true,
              handler: function(range, context) {
                // Get the current contents before attempting undo
                const beforeContents = this.quill.getContents();
                const beforeLength = this.quill.getLength();
                
                // Check if there's anything in the undo stack
                const history = this.quill.history;
                if (!history || !history.stack || !history.stack.undo || history.stack.undo.length === 0) {
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
                  
                  console.log("You've reached the beginning of your edit history");
                }
                
                return false;
              }
            },
          },
        },
      };
  
      // Initialize Quill
      quillRef.current = new Quill(editorContainerRef.current, {
        theme: "snow",
        modules,
      });
  
      // Process the initial HTML content for tab spaces
      if (htmlContent) {
        const tempDiv = document.createElement('div');
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
        textNodes.forEach(node => {
          if (node.textContent.includes('\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0')) {
            node.textContent = node.textContent.replace(
              /\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0/g, 
              '§TAB§'
            );
          }
        });
        
        // Get the processed HTML
        const processedContent = tempDiv.innerHTML;
        
        // Load the content with the special markers
        quillRef.current.clipboard.dangerouslyPasteHTML(processedContent);
        
        // Now replace the markers with actual non-breaking spaces
        const Delta = Quill.import('delta');
        const delta = quillRef.current.getContents();
        const newDelta = new Delta();
        
        delta.ops.forEach(op => {
          if (typeof op.insert === 'string' && op.insert.includes('§TAB§')) {
            const parts = op.insert.split('§TAB§');
            for (let i = 0; i < parts.length; i++) {
              if (i > 0) {
                // Insert our tab spaces
                newDelta.insert('\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0', op.attributes);
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
        const editorHtml = editorContainerRef.current.querySelector(".ql-editor").innerHTML;
        
        // Preserve tab spaces
        const preservedHtml = editorHtml.replace(
          /(\u00A0){8}/g, 
          '<span class="ql-tab-space">\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0</span>'
        );
        
        setHtmlContent(preservedHtml);
      });
  
      // Add keyboard event listener for Ctrl+Z prevention
      const handleKeyDown = (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
          if (quillRef.current.getLength() <= 2) {
            e.preventDefault();
            e.stopPropagation();
            return false;
          }
        }
      };
      
      document.addEventListener('keydown', handleKeyDown, true);
  
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
        document.removeEventListener('keydown', handleKeyDown, true);
      };
    }
  }, [isInitialContentSet, htmlContent]);
  
  // Add CSS for tab spaces
  useEffect(() => {
    const style = document.createElement('style');
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
  };

  const handleCloseFindReplaceDialog = () => {
    setIsFindReplaceDialogOpen(false);
    setFindText("");
    setReplaceText("");
    setCurrentMatchIndex(-1);
    setMatches([]);
  };

  const handleFind = useCallback(() => {
    if (!quillRef.current || !findText) {
      toast.error("Please enter text to find.");
      return;
    }

    const delta = quillRef.current.getContents();
    const text = quillRef.current.getText();
    const newMatches = [];
    let index = 0;

    while (index !== -1) {
      index = text.indexOf(findText, index);
      if (index !== -1) {
        newMatches.push(index);
        index += findText.length;
      }
    }

    setMatches(newMatches);
    if (newMatches.length > 0) {
      setCurrentMatchIndex(0);
      quillRef.current.setSelection(newMatches[0], findText.length);
      toast.success(`Found ${newMatches.length} occurrence(s)`);
    } else {
      toast.info("No matches found");
    }
  }, [findText]);

  const handleNextMatch = useCallback(() => {
    if (matches.length === 0 || !quillRef.current) return;
    const nextIndex = (currentMatchIndex + 1) % matches.length;
    setCurrentMatchIndex(nextIndex);
    quillRef.current.setSelection(matches[nextIndex], findText.length);
  }, [matches, currentMatchIndex]);

  const handleReplace = useCallback(() => {
    if (!quillRef.current || currentMatchIndex === -1) return;
   
    const position = matches[currentMatchIndex];
    quillRef.current.deleteText(position, findText.length);
    quillRef.current.insertText(position, replaceText);
   
    // Calculate the difference in length
    const lengthDifference = replaceText.length - findText.length;
   
    // Update matches after replacement
    const updatedMatches = matches.map((match, index) => {
      if (index > currentMatchIndex) {
        return match + lengthDifference; // Adjust position for matches after the current one
      }
      return match; // Keep the current index as is
    });
   
    updatedMatches.splice(currentMatchIndex, 1); // Remove the replaced match
    setMatches(updatedMatches);
   
    if (updatedMatches.length > 0) {
      // Adjust current match index if necessary
      setCurrentMatchIndex(Math.min(currentMatchIndex, updatedMatches.length - 1));
      quillRef.current.setSelection(updatedMatches[currentMatchIndex], replaceText.length);
    } else {
      setCurrentMatchIndex(-1);
    }
   
    toast.success("Replaced one occurrence");
  }, [findText, replaceText, currentMatchIndex, matches]);

  const handleReplaceAll = useCallback(() => {
    if (!quillRef.current || !findText) {
      toast.error("Please enter text to find.");
      return;
    }
    const delta = quillRef.current.getContents();
    const newOps = delta.ops.map((op) => {
      if (typeof op.insert === "string") {
        return {
          ...op,
          insert: op.insert.split(findText).join(replaceText),
        };
      }
      return op;
    });
    quillRef.current.setContents({ ops: newOps });
    toast.success(`Replaced ${matches.length} occurrence(s)`);
    setFindText("");
    setReplaceText("");
    setMatches([]);
    setCurrentMatchIndex(-1);
    handleCloseFindReplaceDialog();
  }, [findText, replaceText, matches]);

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
                  // onMouseOver={(e) => (e.target.style.backgroundColor = "#808080")} // Green on hover
                  // onMouseOut={(e) => (e.target.style.backgroundColor = "transparent")} // Reset to transparent
                >
                  <ArrowBackIcon style={{ marginRight: "8px" }} />{" "}
                  {/* Matches startIcon */}
                  Back
                </button>
              </Tooltip>
              <Tooltip title="Submit changes" arrow>
                <button
                  onClick={handleSave}
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
              // backgroundImage: `repeating-linear-gradient(
              //   to bottom,
              //   transparent,
              //   transparent calc(297mm - 1px),
              //   #ccc calc(297mm - 1px),
              //   #ccc 297mm
              // )`,
              // backgroundSize: "100% 297mm",
            }}
          />
          {/* {Array.from({ length: pageCount }, (_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                right: "5mm",
                top: `${(i + 1) * pageHeightPx - 5 * mmToPx}px`,
                backgroundColor: "rgba(255,255,255,0.8)",
                padding: "2px 4px",
                borderRadius: "4px",
                fontSize: "10px",
              }}
            >
              {i + 1}
            </div>
          ))} */}
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
        >
          <DialogTitle>Find and Replace</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Find"
              type="text"
              fullWidth
              variant="standard"
              value={findText}
              onChange={(e) => setFindText(e.target.value)}
            />
            <TextField
              margin="dense"
              label="Replace with"
              type="text"
              fullWidth
              variant="standard"
              value={replaceText}
              onChange={(e) => setReplaceText(e.target.value)}
            />
            {matches.length > 0 && (
              <Typography variant="caption" sx={{ mt: 1 }}>
                Match {currentMatchIndex + 1} of {matches.length}
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleFind}>Find</Button>
            <Button onClick={handleNextMatch} disabled={matches.length <= 1}>
              Next
            </Button>
            <Button onClick={handleReplace} disabled={currentMatchIndex === -1}>
              Replace
            </Button>
            <Button onClick={handleReplaceAll}>Replace All</Button>
            <Button onClick={handleCloseFindReplaceDialog}>Close</Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default Editor;
