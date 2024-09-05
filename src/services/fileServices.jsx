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


import { formatDate } from "../utils/formatDate";


// --- File Operations ---

// export const uploadFile = async (projectId, file) => {
//   try {
//     // Upload the PDF file to Firebase Storage
//     const pdfStorageRef = ref(storage, `projects/${projectId}/${file.name}`);
//     const pdfSnapshot = await uploadBytes(pdfStorageRef, file);
//     const pdfDownloadURL = await getDownloadURL(pdfSnapshot.ref);

//     // Convert PDF file to ArrayBuffer to read the number of pages
//     const arrayBuffer = await file.arrayBuffer();
//     // console.log('ArrayBuffer length:', arrayBuffer.byteLength); // Log the ArrayBuffer length

//     const pdfDoc = await PDFDocument.load(arrayBuffer);
//     const pageCount = pdfDoc.getPageCount();
//     console.log("Page count:", pageCount); // Log the page count

//     const htmlFileName = file.name.replace(".pdf", ".html");
//     const htmlBlob = new Blob([""], { type: "text/html" });

//     // Upload the HTML file to Firebase Storage
//     const htmlStorageRef = ref(
//       storage,
//       `projects/${projectId}/${htmlFileName}`
//     );
//     const htmlSnapshot = await uploadBytes(htmlStorageRef, htmlBlob);
//     const htmlDownloadURL = await getDownloadURL(htmlSnapshot.ref);

//     // Add file metadata to Firestore
//     const fileRef = await addDoc(
//       collection(db, "projects", projectId, "files"),
//       {
//         name: file.name,
//         pdfUrl: pdfDownloadURL,
//         htmlUrl: htmlDownloadURL,
//         uploadedDate: formatDate(new Date()),
//         status: 0,
//         projectId: projectId,
//         pageCount: pageCount, // Store the number of pages
//       }
//     );

//     return {
//       id: fileRef.id,
//       name: file.name,
//       pdfUrl: pdfDownloadURL,
//       htmlUrl: htmlDownloadURL,
//       uploadedDate: formatDate(new Date()),
//       status: 0,
//       pageCount: pageCount, // Include the number of pages in the return object
//     };
//   } catch (error) {
//     console.error("Error uploading file:", error);
//     throw new Error("Error uploading file");
//   }
// };

// import { storage } from "./firebaseConfig"; // Make sure to initialize Firebase and Firestore
import { server } from "../main";
// export const uploadFile = async (projectId, file) => {
//   try {
//     // Step 1: Get a signed URL from the backend
//     const response = await fetch(`${server}/generateSignedUrl`, {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ projectId, fileName: file.name }),
//     });

//     if (!response.ok) {
//       throw new Error("Failed to get signed URL");
//     }

//     const { signedUrl } = await response.json();

//     // Step 2: Upload the file to GCS using the signed URL
//     const uploadResponse = await fetch(signedUrl, {
//       method: "PUT",
//       headers: { "Content-Type": "application/pdf" }, // Set the appropriate content type
//       body: file,
//     });

//     if (!uploadResponse.ok) {
//       throw new Error("Failed to upload file to GCS");
//     }

//     console.log("File uploaded successfully to GCS");

//     // Step 3: Convert PDF file to ArrayBuffer to read the number of pages
//     const arrayBuffer = await file.arrayBuffer();
//     const pdfDoc = await PDFDocument.load(arrayBuffer);
//     const pageCount = pdfDoc.getPageCount();
//     console.log("Page count:", pageCount);

//     // // Step 4: Upload an HTML placeholder file to Firebase Storage
//     // const htmlFileName = file.name.replace(".pdf", ".html");
//     // const htmlBlob = new Blob([""], { type: "text/html" });
//     // const htmlStorageRef = ref(storage, `projects/${projectId}/${htmlFileName}`);
//     // const htmlSnapshot = await uploadBytes(htmlStorageRef, htmlBlob);
//     // const htmlDownloadURL = await getDownloadURL(htmlSnapshot.ref);

//     // Step 5: Add file metadata to Firestore
//     const fileRef = await addDoc(
//       collection(db, "projects", projectId, "files"),
//       {
//         name: file.name,
//         pdfUrl: signedUrl, // Use the signed URL as the download URL
//         // htmlUrl: htmlDownloadURL,
//         uploadedDate: formatDate(new Date()),
//         status: 0,
//         projectId: projectId,
//         pageCount: pageCount, // Store the number of pages
//       }
//     );

//     console.log("Metadata successfully stored in Firestore");

//     return {
//       id: fileRef.id,
//       name: file.name,
//       pdfUrl: signedUrl,
//       // htmlUrl: htmlDownloadURL,
//       uploadedDate: formatDate(new Date()),
//       status: 0,
//       pageCount: pageCount,
//     };
//   } catch (error) {
//     console.error("Error uploading file:", error);
//     throw new Error("Error uploading file");
//   }
// };

// // Delete a file from a specific project
export const uploadFile = async (projectId, file) => {
  try {
    // Step 1: Get a signed URL from the backend
    
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

    const { signedUrl, filePath } = await response.json(); 
    console.log("signedUrl, filePath ",signedUrl, filePath )
    if (!signedUrl || !filePath) {
      throw new Error("Invalid signed URL or file path from backend");
    }// Receive both signed URL and file path

    // Step 2: Upload the file to GCS using the signed URL
    const uploadResponse = await fetch(signedUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/pdf" }, // Set the appropriate content type
      body: file,
    });

    if (!uploadResponse.ok) {
      throw new Error("Failed to upload file to GCS");
    }

    console.log("File uploaded successfully to GCS");

    // Step 3: Convert PDF file to ArrayBuffer to read the number of pages
    const arrayBuffer = await file.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pageCount = pdfDoc.getPageCount();
    // console.log("Page count:", pageCount);

    // Step 4: Store file metadata in Firestore
    const fileRef = await addDoc(
      collection(db, "projects", projectId, "files"),
      {
        name: file.name,
        pdfUrl: filePath, // Store the file path, not the signed URL
        uploadedDate: formatDate(new Date()),
        status: 0,
        projectId: projectId,
        pageCount: pageCount, // Store the number of pages
      }
    );

    console.log("Metadata successfully stored in Firestore");

    return {
      id: fileRef.id,
      name: file.name,
      pdfUrl: filePath, // Return the file path
      uploadedDate: formatDate(new Date()),
      status: 0,
      pageCount: pageCount,
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
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projectId, fileName }),
    });

    if (!response.ok) {
      throw new Error('Failed to delete file from GCS');
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
    console.log(
      "Fetching file name for projectId:",
      projectId,
      "fileId:",
      fileId
    );

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
