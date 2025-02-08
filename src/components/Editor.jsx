import React, { useEffect, useRef, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import TableModule from "quill-better-table";
import "quill-better-table/dist/quill-better-table.css";
import useDebounce from "../hooks/useDebounce";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import { auth } from "../utils/firebase";
import ConfirmationDialog from "./ConfirmationDialog";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
import axios from "axios";
import { toast } from "react-hot-toast";
import { server } from "../main";
import Tooltip from '@mui/material/Tooltip';

import {
  fetchFileNameById,
  fetchDocumentUrl,
  updateDocumentContent,
  updateFileStatus,
} from "../services/fileServices";
import { formatDate, fetchServerTimestamp } from "../utils/formatDate";
import { kyroCompanyId } from "../services/companyServices";
import "../App.css";

// Import Material UI components for the table dialog.
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Loader from "./common/Loader";

// ------------------------------------------------------------------
// Register Quill Modules & Custom Attributors
// ------------------------------------------------------------------

// Register the table module.
Quill.register(
  {
    "modules/better-table": TableModule,
  },
  true
);

// Register a custom icon for the better-table toolbar button.
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

// Register a custom font family attributor.
// IMPORTANT: The whitelist values must match the option values in your custom toolbar.
const Font = Quill.import("attributors/style/font");
Font.whitelist = ["calibri", "times-new-roman", "arial", "nirmala-ui"];
Quill.register(Font, true);

// Register a custom size attributor with a whitelist matching our toolbar values.
const SizeStyle = Quill.import("attributors/style/size");
SizeStyle.whitelist = [
  "8pt", "9pt", "10pt", "11pt", "12pt", "14pt", "16pt", "18pt",
  "20pt", "22pt", "24pt", "26pt", "28pt", "36pt", "48pt", "72pt"
];
Quill.register(SizeStyle, true);

// ------------------------------------------------------------------
// TableDialog Component
// ------------------------------------------------------------------
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

// ------------------------------------------------------------------
// Main Editor Component
// ------------------------------------------------------------------
const Editor = () => {
  const { projectId, documentId } = useParams();
  const navigate = useNavigate();

  // Editor and file states.
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

  // Refs for the Quill container and instance.
  const editorContainerRef = useRef(null);
  const quillRef = useRef(null);

  // ------------------------------------------------------------------
  // Offline Alert
  // ------------------------------------------------------------------
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

  // ------------------------------------------------------------------
  // Fetch Initial Content (HTML and PDF URL)
  // ------------------------------------------------------------------
  useEffect(() => {
    const fetchContent = async () => {
      try {
        const { htmlUrl, pdfUrl } = await fetchDocumentUrl(projectId, documentId);
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

  // ------------------------------------------------------------------
  // Initialize Quill (with Custom Toolbar)
  // ------------------------------------------------------------------
  useEffect(() => {
    if (isInitialContentSet && editorContainerRef.current && !quillRef.current) {
      const modules = {
        // Use the custom toolbar via its container ID.
        toolbar: "#toolbar",
        "better-table": {
          operationMenu: {
            items: {
              unmergeCells: { text: "Unmerge Cells" },
              mergeCells: { text: "Merge Cells" },
              insertRowAbove: { text: "Insert Row Above" },
              insertRowBelow: { text: "Insert Row Below" },
              insertColumnLeft: { text: "Insert Column Left" },
              insertColumnRight: { text: "Insert Column Right" },
              deleteRow: { text: "Delete Row" },
              deleteColumn: { text: "Delete Column" },
            },
            color: {
              colors: ["#fff", "#000"],
            },
          },
        },
      };

      quillRef.current = new Quill(editorContainerRef.current, {
        theme: "snow",
        modules,
      });

      // If there is initial content, paste it into the editor.
      if (htmlContent) {
        quillRef.current.clipboard.dangerouslyPasteHTML(htmlContent);
      }

      // Listen for text changes and update htmlContent state.
      quillRef.current.on("text-change", () => {
        const editorHtml = editorContainerRef.current.querySelector(".ql-editor")
          .innerHTML;
        setHtmlContent(editorHtml);
      });

      // Bind a custom click handler to the better-table button to open our table dialog.
      const tableButton = document.querySelector(".ql-better-table");
      if (tableButton) {
        tableButton.addEventListener("click", (e) => {
          e.preventDefault();
          setShowTableDialog(true);
        });
      }
    }
  }, [isInitialContentSet, htmlContent]);

  // ------------------------------------------------------------------
  // Auto-save Debounced Content Changes
  // ------------------------------------------------------------------
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

  // ------------------------------------------------------------------
  // Auth State Changes
  // ------------------------------------------------------------------
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

  // ------------------------------------------------------------------
  // Handler for Table Insertion from the Dialog
  // ------------------------------------------------------------------
  const handleInsertTable = () => {
    const betterTable = quillRef.current.getModule("better-table");
    if (betterTable) {
      betterTable.insertTable(tableRows, tableCols);
    }
    setShowTableDialog(false);
  };

  // ------------------------------------------------------------------
  // Other Handlers (Save, Download, Back)
  // ------------------------------------------------------------------
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
        .promise(
          axios.get(endpoint, { responseType: "blob" }),
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
  // Render Component with Custom Toolbar & Editor Container
  // ------------------------------------------------------------------
  if (loading) {
    return <div className="h-screen flex justify-center items-center"><Loader /> </div>;
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
        {/* <Button
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
        </Button> */}
      </div>

      {/* Right Side: Editor with Custom Toolbar */}
      <div style={{ flex: 1, padding: "10px", overflowY: "auto" }}>
        {/* Custom Toolbar */}
        <div id="toolbar" style={{ marginBottom: "10px" }}>
          {/* Font Family Dropdown */}
          <select className="ql-font">
            <option value="calibri">Calibri</option>
            <option value="times-new-roman">Times New Roman</option>
            <option value="arial">Arial</option>
            <option value="nirmala-ui">Nirmala UI</option>
          </select>
          {/* Font Size Dropdown */}
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
          {/* Other Toolbar Items */}
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
            <select className="ql-color" title="Text Color" />
          </Tooltip>
          <Tooltip title="Background Color" arrow>
            <select className="ql-background" title="Background  Color" />
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

          <Tooltip title="Insert Table" arrow>
            <button className="ql-better-table" />
          </Tooltip>
          <Tooltip title="Download">
            <DownloadIcon
              onClick={handleDownload}
              sx={{
                fontSize: "20px",
              }}
              className="text-gray-600 hover:text-blue-600 hover:scale-125 cursor-pointer"
            />
          </Tooltip>

          <Tooltip title="Clear Formatting" arrow>
            <button className="ql-clean" />
          </Tooltip>

          <div className="flex flex-row space-x-4 ">

            <button onClick={handleBack}>
              {/* <ArrowBackIcon sx={{ marginRight: "3px" }} /> */}
              Back
            </button>
            <button onClick={handleSave}>
              Submit
            </button>
          </div>




          {/* 
            <button className="ql-bold" />
          <button className="ql-italic" />
          <button className="ql-underline" />
          <button className="ql-script" value="sub" title="Subscript"></button>
          <button className="ql-script" value="super" title="Superscript"></button>
          <select className="ql-color" />
          <select className="ql-background" />
          <select className="ql-align" />
          <button className="ql-list" value="ordered" />
          <button className="ql-list" value="bullet" />
          <button className="ql-indent" value="-1" />
          <button className="ql-indent" value="+1" />
          <button className="ql-image" />
          <button className="ql-clean" />
          <button className="ql-better-table" /> */}
        </div>

        {/* Editor Container */}
        <div
          ref={editorContainerRef}
          style={{
            height: "87vh",
            minHeight: "500px",
            backgroundColor: "#fff",
            padding: "10px",
            border: "1px solid #ccc",
            boxSizing: "border-box",
          }}
        />

        {/* <Button
          onClick={handleSave}
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
        </Button> */}
        {/* <Tooltip title="Download">
          <DownloadIcon
            onClick={handleDownload}
            sx={{
              position: "fixed",
              top: 60,
              right: 400,
              fontSize: "20px",
              zIndex: 100,
            }}
            className="text-gray-600 hover:text-blue-600 hover:scale-125 cursor-pointer"
          />
        </Tooltip> */}
        <ConfirmationDialog
          open={dialogOpen}
          handleClose={handleCloseDialog}
          handleConfirm={handleSave}
          title="Confirm Submission"
          message="Are you sure you want to submit?"
        />
        {/* Table Dialog */}
        <TableDialog
          open={showTableDialog}
          onClose={() => setShowTableDialog(false)}
          onInsert={handleInsertTable}
          tableRows={tableRows}
          setTableRows={setTableRows}
          tableCols={tableCols}
          setTableCols={setTableCols}
        />
      </div>
    </div>
  );
};

export default Editor;

