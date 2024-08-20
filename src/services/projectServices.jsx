// // //status notation
// // //0-->client End for delete //1-->Ml
// // //(KyroticsSide) 2-->Ready-for-work//3-->Assigned to User//4-->completed
// // //(ClientSide)4-->Ready-for-work//5-->Assigned to User//6-->completed //7-->Downloaded

import { db, storage } from "../utils/firebase";
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

// --- Project Operations ---

// Fetch all projects
export const fetchAllProjects = async () => {
    try {
        const querySnapshot = await getDocs(collection(db, "projects"));
        const projects = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        return projects;
    } catch (error) {
        console.error("Error fetching projects:", error);
        throw new Error("Error fetching projects");
    }
};



export const fetchProjectFilesByDate = async (
    projectId,
    startDate,
    endDate
) => {
    try {
        const q = query(
            collection(db, "projects", projectId, "files"),
            where("uploadedDate", ">=", startDate),
            where("uploadedDate", "<=", endDate)
        );
        const filesSnapshot = await getDocs(q);
        const files = filesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        return files;
    } catch (error) {
        console.error("Error fetching project files by date:", error);
        throw new Error("Error fetching project files by date");
    }
};

// Fetch the name of a specific project
export const fetchProjectName = async (projectId) => {
    try {
        const projectDocRef = doc(db, "projects", projectId);
        const projectDoc = await getDoc(projectDocRef);
        if (projectDoc.exists()) {
            return projectDoc.data().name;
        } else {
            throw new Error("Project does not exist");
        }
    } catch (error) {
        console.error("Error fetching project name:", error);
        throw new Error("Error fetching project name");
    }
};


// Fetch files for a specific project
export const fetchProjectFiles = async (projectId) => {
    try {
        const filesCollection = collection(db, "projects", projectId, "files");
        const filesSnapshot = await getDocs(filesCollection);

        // return filesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        const files = filesSnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                pdfUrl: data.pdfUrl,
                htmlUrl: data.htmlUrl,
                pageCount: data.pageCount,
                projectId: projectId,
                status: data.status,

                uploadedDate: data.uploadedDate ? data.uploadedDate : null,
                kyro_assignedDate: data.kyro_assignedDate
                    ? data.kyro_assignedDate
                    : null,
                kyro_completedDate: data.kyro_completedDate
                    ? data.kyro_completedDate
                    : null,
                kyro_deliveredDate: data.kyro_deliveredDate
                    ? data.kyro_deliveredDate
                    : null,

                // client_uploadedDate: data.client_uploadedDate ? data.client_uploadedDate : null,
                client_assignedDate: data.client_assignedDate
                    ? data.client_assignedDate
                    : null,
                client_completedDate: data.client_completedDate
                    ? data.client_completedDate
                    : null,

                client_downloadedDate: data.client_downloadedDate
                    ? data.client_downloadedDate
                    : null,

                kyro_assignedTo: data.kyro_assignedTo || null,
                client_assignedTo: data.client_assignedTo || null,
            };
        });

        return files;
    } catch (error) {
        console.error("Error fetching project files:", error);
        throw new Error("Error fetching project files");
    }
};