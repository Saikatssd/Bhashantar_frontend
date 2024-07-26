// import React, { useEffect, useState, useRef } from "react";
// import ReactQuill, { Quill } from "react-quill";
// import "react-quill/dist/quill.snow.css";

// import {
//   fetchDocumentUrl,
//   updateDocumentContent,
//   updateFileStatus,
// } from "../utils/firestoreUtil";
// import useDebounce from "../hooks/useDebounce"; // Import the custom hook
// import { useParams, useNavigate } from "react-router-dom";
// import { Button } from "@mui/material";
// import { auth } from '../utils/firebase';
// import ConfirmationDialog from "./ConfirmationDialog";
// import ArrowBackIcon from '@mui/icons-material/ArrowBack';


// const Editor = () => {
//   const { projectId, documentId } = useParams();
//   const quillRef = useRef(null); // Reference to Quill editor instance
//   const [htmlContent, setHtmlContent] = useState("");
//   const [pdfUrl, setPdfUrl] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [user, setUser] = useState(null);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const navigate = useNavigate();


//   const handleOpenDialog = () => {
//     setDialogOpen(true);
//   };

//   const handleCloseDialog = () => {
//     setDialogOpen(false);
//   };

//   const formats = [
//     "header",
//     "bold",
//     "italic",
//     "underline",
//     "strike",
//     "blockquote",
//     "list",
//     "bullet",
//     "indent",
//     "script",
//     "link",
//     "color",
//     "image",
//     "background",
//     "align",
//     "size",
//     "font",
//     // "table" // Added 'table' format
//   ];

//   const modules = {
//     toolbar: [
//       [{ header: [1, 2, 3, 4, 5, 6, false] }],
//       ["bold", "italic", "underline", "strike", "blockquote", "formula"],
//       [{ size: [] }],
//       [{ font: [] }],
//       [{ align: ["right", "center", "justify", "left"] }],
//       [{ list: "ordered" }, { list: "bullet" }, { indent: '-1' }, { indent: '+1' }],
//       [{ 'script': 'sub' }, { 'script': 'super' }],
//       ["link", "image"],
//       [{ color: [] }],
//       [{ background: [] }],
//       ['clean'],
//       // ['table'] // Added table button in the toolbar
//     ],
//     // 'better-table': {
//     //   operationMenu: {
//     //     items: {
//     //       unmergeCells: {
//     //         text: 'Unmerge cells'
//     //       }
//     //     }
//     //   },
//     //   table: {
//     //     defaultColumns: 3,
//     //     defaultRows: 3,
//     //     defaultCellWidth: 42
//     //   }
//     // }
//   };

//   const debouncedHtmlContent = useDebounce(htmlContent, 3000); // Use the custom debounce hook


//   const [companyId, setCompanyId] = useState(null);
//   useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged(async (user) => {
//       if (user) {
//         const token = await user.getIdTokenResult();
//         user.companyId = token.claims.companyId;
//         setUser(user);
//         setCompanyId(user.companyId);
//       } else {
//         setUser(null);
//       }
//     });
//     return () => unsubscribe();
//   }, []);

//   useEffect(() => {
//     console.log("Document Id & project Id : ", documentId, projectId)
//     const fetchContent = async () => {
//       try {
//         const { htmlUrl, pdfUrl } = await fetchDocumentUrl(projectId, documentId);
//         const response = await fetch(htmlUrl);
//         const text = await response.text();
//         setHtmlContent(text);
//         setPdfUrl(pdfUrl);
//       } catch (err) {
//         setError("Error fetching document");
//         console.error("Error fetching document:", err);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchContent();
//   }, [projectId, documentId]);

//   useEffect(() => {
//     const saveContent = async () => {
//       if (!debouncedHtmlContent) return;

//       try {
//         const blob = new Blob([debouncedHtmlContent], { type: "text/html; charset=utf-8" });
//         await updateDocumentContent(projectId, documentId, blob);
//         // console.log('Document saved successfully (debounced save)');
//       } catch (err) {
//         console.error("Error saving document (debounced save):", err);
//       }
//     };

//     saveContent();
//   }, [debouncedHtmlContent, projectId, documentId]);

//   const handleSave = async () => {
//     try {
//       if (companyId === 'cvy2lr5H0CUVH8o2vsVk') {
//         await updateFileStatus(projectId, documentId, 4, user.uid);
//       }
//       else {
//         await updateFileStatus(projectId, documentId, 6, user.uid);
//       }
//       navigate('/mywork');
//       console.log('Document status updated to 4 or 6');
//       // Optionally, you can add more logic here, such as navigating back or showing a success message.
//     } catch (err) {
//       console.error('Error updating document status:', err);
//     }
//   };
//   const handleBack = () => {
//     navigate(-1); // This will navigate to the previous page
//   };


//   if (loading) {
//     return <div>Loading...</div>;
//   }

//   if (error) {
//     return <div>{error}</div>;
//   }

//   return (
//     <div style={{ display: "flex", height: "100vh" }}>
//       <div
//         style={{
//           flex: 1,
//           overflow: "auto",
//           padding: "10px",
//           borderRight: "1px solid #ccc",
//         }}
//       >
//         <div>
//           <iframe src={pdfUrl} width="100%" height="1000px" />
//         </div>
//         <Button
//           onClick={handleBack}
//           variant="contained"
//           color="primary"
//           size="large"
//           sx={{
//             position: "fixed",
//             bottom: 25,
//             left: 16,
//             width: "100px",
//             height: "55px",
//             fontSize: "18px",
//           }}
//         ><ArrowBackIcon sx={{marginRight:"3px"}}/>
//           Back
//         </Button>
//       </div>
//       <div style={{ flex: 1, padding: "10px" }}>
//         <ReactQuill
//           value={htmlContent}
//           ref={quillRef}
//           formats={formats}
//           modules={modules}
//           onChange={setHtmlContent}
//         />
//         <Button
//           onClick={handleOpenDialog}
//           variant="contained"
//           color="success"
//           size="large"
//           sx={{
//             position: "fixed",
//             bottom: 25,
//             right: 16,
//             width: "100px",
//             height: "55px",
//             fontSize: "18px",
//           }}
//         >
//           Submit
//         </Button>
//         <ConfirmationDialog
//         open={dialogOpen}
//         handleClose={handleCloseDialog}
//         handleConfirm={handleSave}
//         title="Confirm Submission"
//         message="Are you sure you want to submit ?"
//       />
//       </div>
//     </div>
//   );
// };

// export default Editor;
import React, { useEffect, useState, useRef, useCallback } from "react";
import { Editor as TinyMCEEditor } from "@tinymce/tinymce-react";
import { fetchDocumentUrl, updateDocumentContent, updateFileStatus } from "../utils/firestoreUtil";
import useDebounce from "../hooks/useDebounce";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import { auth } from '../utils/firebase';
import ConfirmationDialog from "./ConfirmationDialog";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

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
        const { htmlUrl, pdfUrl } = await fetchDocumentUrl(projectId, documentId);
        const response = await fetch(htmlUrl);
        const text = await response.text();
        setHtmlContent(text);
        setPdfUrl(pdfUrl);
        const extractedFileName = pdfUrl.split('/').pop();
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
        const blob = new Blob([debouncedHtmlContent], { type: "text/html; charset=utf-8" });
        await updateDocumentContent(projectId, documentId, blob);
      } catch (err) {
        console.error("Error saving document (debounced save):", err);
      }
    };

    saveContent();
  }, [debouncedHtmlContent, projectId, documentId]);

  const handleSave = async () => {
    try {
      if (companyId === 'cvy2lr5H0CUVH8o2vsVk') {
        await updateFileStatus(projectId, documentId, { status: 4, kyro_completedDate: new Date().toISOString() });
      } else {
        await updateFileStatus(projectId, documentId, { status: 7, client_completedDate: new Date().toISOString() });
      }
      navigate(-1);
      console.log('Document status updated to 4 or 7');
    } catch (err) {
      console.error('Error updating document status:', err);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const initializeEditor = useCallback(() => {
    if (isInitialContentSet) {
      return (
        <TinyMCEEditor
          key={documentId} // Force reinitialization on documentId change
          apiKey='ooi9c4kr5rwugnplqe0yys09hwfen6hn4nr7hokoxxintdfp'
          value={htmlContent}
          init={{
            height: 'calc(100vh)',
            plugins:
              "anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount checklist mediaembed casechange export formatpainter pageembed linkchecker a11ychecker tinymcespellchecker permanentpen powerpaste advtable advcode editimage advtemplate mentions tinycomments tableofcontents footnotes mergetags autocorrect typography inlinecss markdown pagebreak",
            toolbar:
              "bold italic underline | fontfamily fontsize | align lineheight | checklist numlist bullist indent outdent | paragraphSpacing",
            tinycomments_mode: "embedded",
            pagebreak_split_block: true,
            pagebreak_separator: '<!-- my page break -->',
            tinycomments_author: "Author name",
            mergetags_list: [
              { value: "First.Name", title: "First Name" },
              { value: "Email", title: "Email" }
            ],
            setup: (editor) => {
              editor.ui.registry.addButton('paragraphSpacing', {
                text: 'Paragraph Spacing',
                onAction: () => {
                  editor.execCommand('FormatBlock', false, 'p');
                  editor.getBody().querySelectorAll('p').forEach((paragraph) => {
                    paragraph.style.textIndent = '80px'; // Set the first line indentation
                  });
                },
              });
            },
            
          }
        }

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
            bottom: 25,
            left: 16,
            width: "100px",
            height: "55px",
            fontSize: "18px",
          }}
        >
          <ArrowBackIcon sx={{ marginRight: "3px" }} />
          Back
        </Button>
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
            zIndex:10
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


