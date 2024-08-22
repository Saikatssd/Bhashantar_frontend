// // //status notation
// // //0-->client End for delete //1-->Ml
// // //(KyroticsSide) 2-->Ready-for-work//3-->Assigned to User//4-->completed
// // //(ClientSide)4-->Ready-for-work//5-->Assigned to User//6-->completed //7-->Downloaded

import { db, storage } from "../utils/firebase";
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
import {parse} from 'date-fns'

import JSZip from "jszip";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

// --- File Operations ---

export const uploadFile = async (projectId, file) => {
  try {
    // Upload the PDF file to Firebase Storage
    const pdfStorageRef = ref(storage, `projects/${projectId}/${file.name}`);
    const pdfSnapshot = await uploadBytes(pdfStorageRef, file);
    const pdfDownloadURL = await getDownloadURL(pdfSnapshot.ref);

    // Convert PDF file to ArrayBuffer to read the number of pages
    const arrayBuffer = await file.arrayBuffer();
    // console.log('ArrayBuffer length:', arrayBuffer.byteLength); // Log the ArrayBuffer length

    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pageCount = pdfDoc.getPageCount();
    console.log("Page count:", pageCount); // Log the page count

    const htmlFileName = file.name.replace(".pdf", ".html");
    const htmlBlob = new Blob([""], { type: "text/html" });

    // Upload the HTML file to Firebase Storage
    const htmlStorageRef = ref(
      storage,
      `projects/${projectId}/${htmlFileName}`
    );
    const htmlSnapshot = await uploadBytes(htmlStorageRef, htmlBlob);
    const htmlDownloadURL = await getDownloadURL(htmlSnapshot.ref);

    // Add file metadata to Firestore
    const fileRef = await addDoc(
      collection(db, "projects", projectId, "files"),
      {
        name: file.name,
        pdfUrl: pdfDownloadURL,
        htmlUrl: htmlDownloadURL,
        uploadedDate: formatDate(new Date()),
        status: 0,
        projectId: projectId,
        pageCount: pageCount, // Store the number of pages
      }
    );

    return {
      id: fileRef.id,
      name: file.name,
      pdfUrl: pdfDownloadURL,
      htmlUrl: htmlDownloadURL,
      uploadedDate: formatDate(new Date()),
      status: 0,
      pageCount: pageCount, // Include the number of pages in the return object
    };
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error("Error uploading file");
  }
};

// Delete a file from a specific project
export const deleteFile = async (projectId, fileId, fileName) => {
  try {
    const pdfStorageRef = ref(storage, `projects/${projectId}/${fileName}`);
    await deleteObject(pdfStorageRef);

    const htmlFileName = fileName.replace(".pdf", ".html");
    const htmlStorageRef = ref(
      storage,
      `projects/${projectId}/${htmlFileName}`
    );
    await deleteObject(htmlStorageRef);

    const fileRef = doc(db, "projects", projectId, "files", fileId);
    await deleteDoc(fileRef);

    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    throw new Error("Error deleting file");
  }
};



export const fetchFileNameById = async (projectId, fileId) => {
  try {
    const fileDocRef = doc(db, "projects", projectId, "files", fileId);
    const fileDoc = await getDoc(fileDocRef);

    if (fileDoc.exists()) {
      const data = fileDoc.data();
      return data.name ? data.name : null; // Return the file name or null if it doesn't exist
    } else {
      console.error("No such file document!");
      return null;
    }
  } catch (error) {
    console.error("Error fetching file name by ID:", error);
    throw new Error("Error fetching file name");
  }
};
