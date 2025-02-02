import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
// import {
//   // fetchProjectFiles,
//   // fetchProjectName,
//   // updateFileStatus,
// } from "../../utils/firestoreUtil";
import {
  fetchProjectName,
  fetchProjectFiles,
} from "../../services/projectServices";
import { updateFileStatus } from "../../services/fileServices";
import CircularProgress from "@mui/material/CircularProgress";
import { auth } from "../../utils/firebase";
import { useAuth } from "../../context/AuthContext";
import UserTable from "../Table/UserTable";
import { useNavigate } from "react-router-dom";
import { formatDate, fetchServerTimestamp } from "../../utils/formatDate";
import { toast } from "react-hot-toast";

const KyroUserFileAssign = ({ projectId, companyId }) => {
  // const { projectId } = useParams();
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [projectName, setProjectName] = useState("");
  // const [companyId, setCompanyId] = useState("");
  const [role, setRole] = useState("");
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const columns = [
    { id: "slNo", label: "Sl. No", minWidth: 50 },
    { id: "name", label: "File Name", minWidth: 170 },
    { id: "pageCount", label: "Page Count", minWidth: 100 },
    { id: "uploadedDate", label: "Uploaded At", minWidth: 170 },
    { id: "assign", label: "Actions", minWidth: 100 },
  ];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const token = await user.getIdTokenResult();
        // console.log(token)
        user.roleName = token.claims.roleName;
        user.companyId = token.claims.companyId;

        setRole(user.roleName);
        setCompanyId(user.companyId);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (companyId) {
      const getProjectData = async () => {
        setIsLoading(true);
        try {
          const projectFiles = await fetchProjectFiles(projectId);
          const projectName = await fetchProjectName(projectId);
          const filteredFiles = projectFiles.filter(
            (file) => file.status === 2
          );
          setFiles(filteredFiles);
          setProjectName(projectName);
        } catch (err) {
          console.error("Error fetching project data:", err);
          setError(err);
        } finally {
          setIsLoading(false);
        }
      };
      getProjectData();
    }
  }, [projectId, companyId, role]);

  // const handleFileAssign = async (id) => {
  //   try {
  //     const serverDate = await fetchServerTimestamp();
  //     const formattedDate = formatDate(serverDate);

  //     // updateFileStatus('projectId', 'fileId', { status: 'in-progress', kyro_assignedTo: 'userId' });

  //     // await updateFileStatus(projectId, id, 3, currentUser.uid);

  //     await updateFileStatus(projectId, id, {
  //       status: 3,
  //       kyro_assignedTo: currentUser.uid,
  //       kyro_assignedDate: formattedDate,
  //     });
  //     navigate(1);
  //     setFiles(files.filter((file) => file.id !== id));
  //   } catch (err) {
  //     console.error("Error updating file status:", err);
  //     setError(err);
  //   }
  // };

  const handleFileAssign = async (id) => {
    try {
      // Fetch the latest data for the file from the database
      const fileData = await fetchProjectFiles(projectId).then((files) =>
        files.find((file) => file.id === id)
      );

      if (!fileData) {
        toast.error("File is already assigned please assign another file.");
        return; // Prevent further action
      }

      // Check if the file is already assigned
      if (fileData.status === 3) {
        toast.error("File is already assigned please assign another file.");
        return; // Prevent further action
      }

      // If file is not assigned, proceed with assignment
      const serverDate = await fetchServerTimestamp();
      const formattedDate = formatDate(serverDate);

      await updateFileStatus(projectId, id, {
        status: 3,
        kyro_assignedTo: currentUser.uid,
        kyro_assignedDate: formattedDate,
      });

      toast.success("File assigned successfully!");
      navigate(1);

      // Update the local state by removing the assigned file
      setFiles(files.filter((file) => file.id !== id));
    } catch (err) {
      console.error("Error assigning file:", err);
      toast.error("Failed to assign the file. Please try again.");
      setError(err);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <div>
      {isLoading && <CircularProgress />}
      {error && <p>Error: {error.message}</p>}
      {!isLoading && !error && files.length === 0 && <p>No files found.</p>}
      {!isLoading && !error && files.length > 0 && (
        <UserTable
          columns={columns}
          rows={files.map((file, index) => ({ ...file, slNo: index + 1 }))}
          page={page}
          rowsPerPage={rowsPerPage}
          handleChangePage={handleChangePage}
          handleChangeRowsPerPage={handleChangeRowsPerPage}
          handleEditClick={handleFileAssign}
          projectName={projectName}
        />
      )}
    </div>
  );
};

export default KyroUserFileAssign;
