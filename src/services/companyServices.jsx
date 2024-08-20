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

// --- Company Operations ---

// Fetch all companies
export const fetchAllCompanies = async () => {
    try {
      const companiesSnapshot = await getDocs(collection(db, "companies"));
      const companies = companiesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      return companies;
    } catch (error) {
      console.error("Error fetching companies:", error);
      throw new Error("Error fetching companies");
    }
  };
  
  export const fetchCompanyNameByCompanyId = async (companyId) => {
    try {
      const companyDocRef = doc(db, "companies", companyId);
      const companyDoc = await getDoc(companyDocRef);
      if (companyDoc.exists()) {
        return companyDoc.data().name;
      } else {
        throw new Error("Company not found");
      }
    } catch (error) {
      console.error("Error fetching company name:", error);
      throw error;
    }
  };

  

  // Fetch all projects for a specific company
export const fetchCompanyProjects = async (companyId) => {
    try {
        const projectsQuery = query(
            collection(db, "projects"),
            where("companyId", "==", companyId)
        );
        const projectsSnapshot = await getDocs(projectsQuery);
        const projects = projectsSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));
        return projects;
    } catch (error) {
        console.error("Error fetching projects:", error);
        throw new Error("Error fetching projects");
    }
};