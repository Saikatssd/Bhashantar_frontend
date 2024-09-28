import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  fetchProjectFiles,
  fetchProjectName,
  updateFileStatus,
} from "../../utils/firestoreUtil";
import CircularProgress from "@mui/material/CircularProgress";
import { auth } from "../../utils/firebase";
import { useAuth } from "../../context/AuthContext";
import UserTable from "../Table/UserTable";
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../utils/formatDate";

const KyroUserFileAssign = () => {
  const { projectId } = useParams();
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [projectName, setProjectName] = useState("");
  const [companyId, setCompanyId] = useState("");
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

  const handleFileAssign = async (id) => {
    try {
      // updateFileStatus('projectId', 'fileId', { status: 'in-progress', kyro_assignedTo: 'userId' });

      // await updateFileStatus(projectId, id, 3, currentUser.uid);
      await updateFileStatus(projectId, id, {
        status: 3,
        kyro_assignedTo: currentUser.uid,
        kyro_assignedDate: formatDate(new Date()),
      });
      navigate(1);
      setFiles(files.filter((file) => file.id !== id));
    } catch (err) {
      console.error("Error updating file status:", err);
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
