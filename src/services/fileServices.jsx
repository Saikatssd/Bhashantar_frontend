// // //status notation
// // //0-->client End for delete //1-->Ml
// // //(KyroticsSide) 2-->Ready-for-work//3-->Assigned to User//4-->completed
// // //(ClientSide)4-->Ready-for-work//5-->Assigned to User//6-->completed //7-->Downloaded

import { db } from "../utils/firebase";
import { PDFDocument } from "pdf-lib";
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  where,
  deleteDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";

import { formatDate,fetchServerTimestamp } from "../utils/formatDate";

// --- File Operations ---

// import { storage } from "./firebaseConfig"; // Make sure to initialize Firebase and Firestore
import { server } from "../main";


// // Delete a file from a specific project
// export const uploadFile = async (projectId, file) => {
//   try {
//     // Step 1: Get a signed URL from the backend

//     const serverDate = await fetchServerTimestamp();
//     const formattedDate = formatDate(serverDate);

//     const response = await fetch(`${server}/generateSignedUrl`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ projectId, fileName: file.name }),
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error(
//         `Failed to get signed URL: ${response.status} - ${errorText}`
//       );
//       throw new Error("Failed to get signed URL");
//     }

//     const { signedUrl, filePath } = await response.json();
//     // console.log("signedUrl, filePath ",signedUrl, filePath )
//     if (!signedUrl || !filePath) {
//       throw new Error("Invalid signed URL or file path from backend");
//     } // Receive both signed URL and file path

//     // Step 2: Upload the file to GCS using the signed URL
//     const uploadResponse = await fetch(signedUrl, {
//       method: "PUT",
//       headers: { "Content-Type": "application/pdf" }, // Set the appropriate content type
//       body: file,
//     });

//     if (!uploadResponse.ok) {
//       throw new Error("Failed to upload file to GCS");
//     }

//     // console.log("File uploaded successfully to GCS");

//     // Step 3: Convert PDF file to ArrayBuffer to read the number of pages
//     const arrayBuffer = await file.arrayBuffer();
//     const pdfDoc = await PDFDocument.load(arrayBuffer);
//     const pageCount = pdfDoc.getPageCount();

//     // console.log("Page count:", pageCount);

//     // Step 4: Store file metadata in Firestore
//     const fileRef = await addDoc(
//       collection(db, "projects", projectId, "files"),
//       {
//         name: file.name,
//         pdfUrl: filePath, // Store the file path, not the signed URL
//         uploadedDate: formattedDate,
//         status: 0,
//         projectId: projectId,
//         pageCount: pageCount, // Store the number of pages
//       }
//     );

//     // console.log("Metadata successfully stored in Firestore");

//     return {
//       id: fileRef.id,
//       name: file.name,
//       pdfUrl: filePath, // Return the file path
//       uploadedDate: formattedDate,
//       status: 0,
//       pageCount: pageCount,
//     };
//   } catch (error) {
//     console.error("Error uploading file:", error);
//     throw new Error("Error uploading file");
//   }
// };
// export const uploadFile = async (projectId, file) => {
//   try {
//     // Step 1: Get a signed URL from the backend

//     const serverDate = await fetchServerTimestamp()
//     const formattedDate = formatDate(serverDate)

//     const response = await fetch(`${server}/generateSignedUrl`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ projectId, fileName: file.name }),
//     })

//     if (!response.ok) {
//       const errorText = await response.text()
//       console.error(`Failed to get signed URL: ${response.status} - ${errorText}`)
//       throw new Error("Failed to get signed URL")
//     }

//     const { signedUrl, filePath } = await response.json()
//     if (!signedUrl || !filePath) {
//       throw new Error("Invalid signed URL or file path from backend")
//     }

//     // Step 2: Upload the file to GCS using the signed URL
//     const uploadResponse = await fetch(signedUrl, {
//       method: "PUT",
//       headers: { "Content-Type": "application/pdf" },
//       body: file,
//     })

//     if (!uploadResponse.ok) {
//       throw new Error("Failed to upload file to GCS")
//     }

//     // Step 3: Convert PDF file to ArrayBuffer to read the number of pages
//     const arrayBuffer = await file.arrayBuffer()
//     const pdfDoc = await PDFDocument.load(arrayBuffer)
//     const pageCount = pdfDoc.getPageCount()

//     // Step 4: Store file metadata in Firestore
//     const projectRef = db.collection("projects").doc(projectId)
//     const projectDoc = await projectRef.get()
//     const projectData = projectDoc.data()

//     const fileRef = await addDoc(collection(db, "projects", projectId, "files"), {
//       name: file.name,
//       pdfUrl: filePath,
//       uploadedDate: formattedDate,
//       status: 0,
//       projectId: projectId,
//       pageCount: pageCount,
//       parentId: projectData.parentId || null,
//     })

//     return {
//       id: fileRef.id,
//       name: file.name,
//       pdfUrl: filePath,
//       uploadedDate: formattedDate,
//       status: 0,
//       pageCount: pageCount,
//       parentId: projectData.parentId || null,
//     }
//   } catch (error) {
//     console.error("Error uploading file:", error)
//     throw new Error("Error uploading file")
//   }
// }


export const uploadFile = async (projectId, file, folderId = null) => {
  try {
    // Step 1: Get a server timestamp & format the date (e.g., "YYYY-MM-DD")
    const serverDate = await fetchServerTimestamp();
    const formattedDate = formatDate(serverDate);

    // Step 2: Get a signed URL from your backend
    const response = await fetch(`${server}/generateSignedUrl`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, fileName: file.name }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to get signed URL: ${response.status} - ${errorText}`);
      throw new Error("Failed to get signed URL");
    }

    // The backend should return { signedUrl, filePath }
    const { signedUrl, filePath } = await response.json();
    if (!signedUrl || !filePath) {
      throw new Error("Invalid signed URL or file path from backend");
    }

    // Step 3: Upload the file to GCS using the signed URL
    const uploadResponse = await fetch(signedUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/pdf" },
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error("Failed to upload file to GCS");
    }

    // Step 4: Read the file as a PDF to determine number of pages
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pageCount = pdfDoc.getPageCount();

    // Step 5: Store file metadata in Firestore under the project's files subcollection
    const filesCollectionRef = collection(db, "projects", projectId, "files");
    const fileDocRef = await addDoc(filesCollectionRef, {
      name: file.name,
      pdfUrl: filePath,
      uploadedDate: formattedDate,
      status: 0,
      projectId: projectId,
      pageCount: pageCount,
      folderId: folderId || null, // <-- NEW field for folder nesting
    });

    // Return the file data (helpful for updating the UI)
    return {
      id: fileDocRef.id,
      name: file.name,
      pdfUrl: filePath,
      uploadedDate: formattedDate,
      status: 0,
      pageCount: pageCount,
      folderId: folderId || null,
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error("Error uploading file");
  }
};


export const deleteFile = async (projectId, fileId, fileName) => {
  try {
    // Make a request to your backend to delete the file from GCS
    const response = await fetch(`${server}/api/document/deleteFile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ projectId, fileName }),
    });

    if (!response.ok) {
      throw new Error("Failed to delete file from GCS");
    }

    // Continue to delete file metadata from Firestore
    const fileRef = doc(db, "projects", projectId, "files", fileId);
    await deleteDoc(fileRef);

    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    throw new Error("Error deleting file");
  }
};

// export const deleteFile = async (projectId, fileId, fileName) => {
//   try {
//     const pdfStorageRef = ref(storage, `projects/${projectId}/${fileName}`);
//     await deleteObject(pdfStorageRef);

//     // const htmlFileName = fileName.replace(".pdf", ".html");
//     // const htmlStorageRef = ref(
//     //   storage,
//     //   `projects/${projectId}/${htmlFileName}`
//     // );
//     // await deleteObject(htmlStorageRef);

//     const fileRef = doc(db, "projects", projectId, "files", fileId);
//     await deleteDoc(fileRef);

//     return true;
//   } catch (error) {
//     console.error("Error deleting file:", error);
//     throw new Error("Error deleting file");
//   }
// };

// export const fetchFileNameById = async (projectId, fileId) => {
//   try {
//     const fileDocRef = doc(db, "projects", projectId, "files", fileId);
//     const fileDoc = await getDoc(fileDocRef);

//     if (fileDoc.exists()) {
//       const data = fileDoc.data();
//       console.log("data",data)
//       return data.name ? data.name : null; // Return the file name or null if it doesn't exist
//     } else {
//       console.error("No such file document!");
//       return null;
//     }
//   } catch (error) {
//     console.error("Error fetching file name by ID:", error);
//     throw new Error("Error fetching file name");
//   }
// };

export const fetchFileNameById = async (projectId, fileId) => {
  try {
    // Log inputs to ensure they are correct
    // console.log(
    //   "Fetching file name for projectId:",
    //   projectId,
    //   "fileId:",
    //   fileId
    // );

    const fileDocRef = doc(db, "projects", projectId, "files", fileId);
    const fileDoc = await getDoc(fileDocRef);

    if (fileDoc.exists()) {
      const data = fileDoc.data();
      // console.log("File data:", data);
      return data.name ? data.name : null; // Return the file name or null if it doesn't exist
    } else {
      console.error("No such file document exists!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching file name by ID:", error.message);
    throw new Error(
      `Error fetching file name for projectId: ${projectId}, fileId: ${fileId}`
    );
  }
};

export const updateFileStatus = async (projectId, fileId, updates) => {
  try {
    const fileRef = doc(db, "projects", projectId, "files", fileId);
    await updateDoc(fileRef, updates);
  } catch (error) {
    console.error("Error updating file status:", error);
    throw new Error("Error updating file status:", error);
  }
};

export const updateFileStatusNumber = async (projectId, fileId, status) => {
  try {
    const fileRef = doc(db, "projects", projectId, "files", fileId);
    await updateDoc(fileRef, { status });
  } catch (error) {
    console.error("Error updating file status:", error);
    throw new Error("Error updating file status:", error);
  }
};

export const fetchDocumentUrl = async (projectId, fileId) => {
  try {
    // Step 1: Fetch the file paths from Firestore
    const fileDocRef = doc(db, "projects", projectId, "files", fileId);
    const fileDoc = await getDoc(fileDocRef);

    if (!fileDoc.exists()) {
      throw new Error("File does not exist");
    }

    const data = fileDoc.data();
    let fileName = data.name;
    fileName = fileName.replace(".pdf", "");
    // console.log("fileName", fileName);
    // const pdfPath = data.pdfUrl;
    // const htmlPath = data.htmlUrl;
    // console.log("path", pdfPath, htmlPath);

    // Step 2: Request new signed URLs from the backend
    const responsePdf = await fetch(`${server}/generateReadSignedUrl`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, fileName, fileType: "pdf" }), // Include fileType to specify it's a PDF
    });

    if (!responsePdf.ok) {
      throw new Error("Failed to generate PDF signed URL");
    }

    const { signedUrl: pdfSignedUrl } = await responsePdf.json();

    const responseHtml = await fetch(`${server}/generateReadSignedUrl`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ projectId, fileName, fileType: "html" }), // Include fileType to specify it's an HTML file
    });

    if (!responseHtml.ok) {
      throw new Error("Failed to generate HTML signed URL");
    }

    const { signedUrl: htmlSignedUrl } = await responseHtml.json();

    // console.log("pdfurl", pdfSignedUrl, htmlSignedUrl);

    // Return both signed URLs
    return {
      pdfUrl: pdfSignedUrl,
      htmlUrl: htmlSignedUrl,
    };
  } catch (error) {
    console.error("Error fetching document URLs:", error);
    throw new Error("Error fetching document URLs");
  }
};




export const updateDocumentContent = async (
  projectId,
  fileId,
  newHtmlContent
) => {
  try {

    // console.log("newContent",newHtmlContent)

    
    // Step 1: Request the signed URL for the update
    const signedUrlResponse = await fetch(
      `${server}/api/document/generateSignedUrlForHtmlUpdate`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, fileId }),
      }
    );

    if (!signedUrlResponse.ok) {
      throw new Error("Failed to generate signed URL");
    }

    const { signedUrl, gcsFilePath } = await signedUrlResponse.json();
    // console.log("signedurl", signedUrl);

    // Step 2: Upload the new HTML content to the signed URL
    const uploadResponse = await fetch(signedUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "text/html",
      },
      body: newHtmlContent, // The HTML content to be updated
    });

    if (!uploadResponse.ok) {
      throw new Error("Failed to upload new HTML content");
    }

    // console.log("HTML content updated successfully at:", gcsFilePath);
  } catch (error) {
    console.error("Error updating HTML content:", error);
  }
};
