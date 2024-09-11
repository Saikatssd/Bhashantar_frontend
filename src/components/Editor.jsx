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
import { formatDate } from "../utils/formatDate";
import {
  fetchFileNameById,
  fetchDocumentUrl,
  updateDocumentContent,
  updateFileStatus,
} from "../services/fileServices";
import { toast } from "react-hot-toast";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor,
  AccessibilityHelp,
  Alignment,
  Autoformat,
  AutoImage,
  Autosave,
  BalloonToolbar,
  BlockQuote,
  Bold,
  CloudServices,
  Essentials,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  FullPage,
  GeneralHtmlSupport,
  Heading,
  Highlight,
  HorizontalLine,
  ImageBlock,
  ImageCaption,
  ImageInline,
  ImageInsertViaUrl,
  ImageResize,
  ImageStyle,
  ImageTextAlternative,
  ImageToolbar,
  ImageUpload,
  Indent,
  IndentBlock,
  Italic,
  Link,
  LinkImage,
  List,
  ListProperties,
  Markdown,
  MediaEmbed,
  PageBreak,
  Paragraph,
  PasteFromMarkdownExperimental,
  PasteFromOffice,
  RemoveFormat,
  SelectAll,
  SourceEditing,
  SpecialCharacters,
  SpecialCharactersArrows,
  SpecialCharactersCurrency,
  SpecialCharactersEssentials,
  SpecialCharactersLatin,
  SpecialCharactersMathematical,
  SpecialCharactersText,
  Strikethrough,
  Style,
  Subscript,
  Superscript,
  Table,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar,
  TextTransformation,
  Underline,
  Undo,
} from "ckeditor5";

import "ckeditor5/ckeditor5.css";

import "../App.css";
import { LineHeight } from '@rickx/ckeditor5-line-height';
// import "../assets/editor.css";

const Editor = () => {
  const { projectId, documentId } = useParams();
  const [htmlContent, setHtmlContent] = useState("");
  const [pdfUrl, setPdfUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isInitialContentSet, setIsInitialContentSet] = useState(false);
  const navigate = useNavigate();
  const debouncedHtmlContent = useDebounce(htmlContent, 1000);
  const [companyId, setCompanyId] = useState(null);
  const [role, setRole] = useState();
  const editorContainerRef = useRef(null);
  const editorMenuBarRef = useRef(null);
  const editorToolbarRef = useRef(null);
  const editorRef = useRef(null);
  const [isLayoutReady, setIsLayoutReady] = useState(false);

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
        // const contentToLog = await blob.text(); // Convert Blob to text for debugging
        // console.log("blob", contentToLog);

        // console.log("htmlcontent", debouncedHtmlContent);

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

  const editorConfig = {
    toolbar: {
      items: [
        "undo",
        "redo",
        "|",
        "bold",
        "italic",
        "underline",
        "|",
        "fontSize",
        "fontFamily",
        "fontColor",
        "fontBackgroundColor",
        "|",
        "link",
        "insertTable",
        "highlight",
        "blockQuote",
        "|",
        "lineheight",
        "alignment",
        "|",
        "bulletedList",
        "numberedList",
        "outdent",
        "indent",
        "|",
      ],
      shouldNotGroupWhenFull: false,
    },
    styles: [
      {
        name: 'First Line Indent',
        element: 'p',
        styles: {
          'text-indent': '30px'
        }
      }
    ],
    plugins: [
      AccessibilityHelp,
      Alignment,
      Autoformat,
      AutoImage,
      Autosave,
      BalloonToolbar,
      BlockQuote,
      Bold,
      CloudServices,
      Essentials,
      FontBackgroundColor,
      FontColor,
      FontFamily,
      FontSize,
      FullPage,
      GeneralHtmlSupport,
      Heading,
      Highlight,
      HorizontalLine,
      ImageBlock,
      ImageCaption,
      ImageInline,
      ImageInsertViaUrl,
      ImageResize,
      ImageStyle,
      ImageTextAlternative,
      ImageToolbar,
      ImageUpload,
      Indent,
      IndentBlock,
      Italic,
      Link,
      LinkImage,
      List,
      ListProperties,
      Markdown,
      MediaEmbed,
      PageBreak,
      Paragraph,
      PasteFromMarkdownExperimental,
      PasteFromOffice,
      RemoveFormat,
      SelectAll,
      SourceEditing,
      SpecialCharacters,
      SpecialCharactersArrows,
      SpecialCharactersCurrency,
      SpecialCharactersEssentials,
      SpecialCharactersLatin,
      SpecialCharactersMathematical,
      SpecialCharactersText,
      Strikethrough,
      Style,
      Subscript,
      Superscript,
      Table,
      TableCaption,
      TableCellProperties,
      TableColumnResize,
      TableProperties,
      TableToolbar,
      TextTransformation,
      Underline,
      Undo,
      LineHeight,

    ],
    balloonToolbar: [
      "bold",
      "italic",
      "|",
      "alignment",
      "|",
      "bulletedList",
      "numberedList",
    ],
    // fontFamily: {
    //   supportAllValues: true,
    // },

    fontFamily: {
      options: [
        'default',
        'Nirmala UI, sans-serif',
        'Arial, sans-serif',
        'Courier New, Courier, monospace',
        'Georgia, serif',
        'Lucida Sans Unicode, Lucida Grande, sans-serif',
        'Tahoma, Geneva, sans-serif',
        'Times New Roman, Times, serif',
        'Trebuchet MS, Helvetica, sans-serif',
        'Verdana, Geneva, sans-serif'
      ],
      supportAllValues: true,
    },
    fontSize: {
      options: [
        8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
        25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 'default'
      ],
      supportAllValues: true
    },
    lineHeight: {
      // You can specify custom line height values
      options: [
        'default',
        '10px',
        1,
        1.1,
        1.2,
        1.3,
        1.4,
        1.5,
        1.6,
        2,
        '150%',
        '2.5',
        {
          title: 'Custom Title',
          model: '48px', // You can add custom titles and values here
        },
      ],
    },
    heading: {
      options: [
        {
          model: "paragraph",
          title: "Paragraph",
          class: "ck-heading_paragraph",
        },
        {
          model: "heading1",
          view: "h1",
          title: "Heading 1",
          class: "ck-heading_heading1",
        },
        {
          model: "heading2",
          view: "h2",
          title: "Heading 2",
          class: "ck-heading_heading2",
        },
        {
          model: "heading3",
          view: "h3",
          title: "Heading 3",
          class: "ck-heading_heading3",
        },
        {
          model: "heading4",
          view: "h4",
          title: "Heading 4",
          class: "ck-heading_heading4",
        },
        {
          model: "heading5",
          view: "h5",
          title: "Heading 5",
          class: "ck-heading_heading5",
        },
        {
          model: "heading6",
          view: "h6",
          title: "Heading 6",
          class: "ck-heading_heading6",
        },
      ],
    },
    htmlSupport: {
      allow: [
        {
          name: /^.*$/,
          styles: true,
          attributes: true,
          classes: true,
        },
      ],
    },
    image: {
      toolbar: [
        "toggleImageCaption",
        "imageTextAlternative",
        "|",
        "imageStyle:inline",
        "imageStyle:wrapText",
        "imageStyle:breakText",
        "|",
        "resizeImage",
      ],
    },
    initialData: htmlContent,
    link: {
      addTargetToExternalLinks: true,
      defaultProtocol: "https://",
      decorators: {
        toggleDownloadable: {
          mode: "manual",
          label: "Downloadable",
          attributes: {
            download: "file",
          },
        },
      },
    },
    list: {
      properties: {
        styles: true,
        startIndex: true,
        reversed: true,
      },
    },
    menuBar: {
      isVisible: true,
    },
    placeholder: "Type or paste your content here!",
    style: {
      definitions: [
        {
          name: "Article category",
          element: "h3",
          classes: ["category"],
        },
        {
          name: "Title",
          element: "h2",
          classes: ["document-title"],
        },
        {
          name: "Subtitle",
          element: "h3",
          classes: ["document-subtitle"],
        },
        {
          name: "Info box",
          element: "p",
          classes: ["info-box"],
        },
        {
          name: "Side quote",
          element: "blockquote",
          classes: ["side-quote"],
        },
        {
          name: "Marker",
          element: "span",
          classes: ["marker"],
        },
        {
          name: "Spoiler",
          element: "span",
          classes: ["spoiler"],
        },
        {
          name: "Code (dark)",
          element: "pre",
          classes: ["fancy-code", "fancy-code-dark"],
        },
        {
          name: "Code (bright)",
          element: "pre",
          classes: ["fancy-code", "fancy-code-bright"],
        },
      ],
    },
    table: {
      contentToolbar: [
        "tableColumn",
        "tableRow",
        "mergeTableCells",
        "tableProperties",
        "tableCellProperties",
      ],
    },
  };

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
      if (companyId === "cvy2lr5H0CUVH8o2vsVk") {
        if (role === "QA") {
          await updateFileStatus(projectId, documentId, {
            status: 5,
            kyro_completedDate: formatDate(new Date()),
          });
        } else {
          await updateFileStatus(projectId, documentId, {
            status: 4,
            kyro_completedDate: formatDate(new Date()),
          });
        }
      } else {
        await updateFileStatus(projectId, documentId, {
          status: 7,
          client_completedDate: formatDate(new Date()),
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

  // const handleDownload = async () => {
  //   setError(null); // Clear any previous error

  //   try {
  //     const endpoint = `${server}/api/document/${projectId}/${documentId}/downloadDocx`;

  //     // Use toast.promise to handle the download process
  //     await toast
  //       .promise(
  //         axios.get(endpoint, {
  //           responseType: "blob",
  //         }),
  //         {
  //           loading: "Downloading...",
  //           success: "Zip File Downloaded!",
  //           error: "An error occurred while downloading the document.",
  //         }
  //       )
  //       .then((response) => {
  //         const contentDisposition = response.headers["content-disposition"];
  //         const filename = contentDisposition
  //           ? contentDisposition.split("filename=")[1].replace(/"/g, "")
  //           : "document.zip";

  //         const url = window.URL.createObjectURL(new Blob([response.data]));
  //         const link = document.createElement("a");
  //         link.href = url;
  //         link.setAttribute("download", filename);
  //         document.body.appendChild(link);
  //         link.click();
  //         link.remove();
  //       });
  //   } catch (err) {
  //     console.log("Download error", err);
  //     toast.error("Blank file can't be downloaded", {
  //       position: "top-right",
  //       style: { background: "#333", color: "#fff" },
  //     });
  //     console.error("Error during document download:", err);
  //   }
  // };

  const handleBack = () => {
    navigate(-1);
  };

  const initializeEditor = useCallback(() => {
    if (isInitialContentSet) {
      return (
        <div
          className="editor-container editor-container_classic-editor editor-container_include-style"
          ref={editorContainerRef}
          style={{ width: "100%", height: "100%" }}
        >
          <div
            className="editor-container__editor"
            style={{ width: "100%", height: "100%" }}
          >
            <div ref={editorRef} style={{ width: "100%", height: "100%" }}>
              {isLayoutReady && (
                <CKEditor
                  editor={ClassicEditor}
                  config={editorConfig}
                  onChange={(event, editor) => {
                    const data = editor.getData();
                    // console.log(data);
                    setHtmlContent(data); // Update the state with the new content
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
            top: 12,
            right: 120,
            width: "80px",
            height: "29px",
            fontSize: "14px",
            zIndex: 10,
          }}
        >
          <ArrowBackIcon sx={{ marginRight: "3px" }} />
          Back
        </Button>
      </div>
      <div style={{ flex: 1, padding: "10px", overflowY: "auto", width: "1" }}>
        {initializeEditor()}
        <Button
          onClick={handleOpenDialog}
          variant="contained"
          color="success"
          size="large"
          sx={{
            position: "fixed",
            top: 12,
            right: 30,
            width: "80px",
            height: "29px",
            fontSize: "14px",
            zIndex: 10,
          }}
        >
          Submit
        </Button>
        <Tooltip title="Download">
          <DownloadIcon
            onClick={handleDownload}
            sx={{
              position: "fixed",
              top: 18,
              right: 400,
              fontSize: "20px",
              zIndex: 10,
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
