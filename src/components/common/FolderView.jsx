import React, { useState, useEffect, useCallback } from "react";
import {
  fetchProjectFolders,
  createFolder,
} from "../../services/folderServices";
import { deleteFile, fetchFileNameById } from "../../services/fileServices";
import {
  Breadcrumbs,
  Button,
  Fab,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FolderIcon from "@mui/icons-material/Folder";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TableUpload from "../Table/TableUpload";
import Loader from "../common/Loader";
import { FolderList } from "../common/FolderList";
import {
  fetchTotalProjectFilesCount,
  fetchProjectFilesByFolder,
  fetchProjectFiles,
} from "../../services/projectServices";
import { file, folder } from "jszip";
import { Link, useParams } from "react-router-dom";
import AdminFileFlow from "../ClientCompany/AdminFileFlow";
import { kyroCompanyId } from "../../services/companyServices";
import { useAuth } from "../../context/AuthContext";
import KyroAdminFileFlow from "../Kyrotics/KyroAdminFileFlow";
import KyroUserFileAssign from "../Kyrotics/KyroUserFileAssign";
import UserFileAssign from "../ClientCompany/UserFileAssign";


const FolderView = ({ project, onBack }) => {
  const { companyId } = useParams();
  // console.log('cid',companyId)

  const [folders, setFolders] = useState([]); // All folders data
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [currentPath, setCurrentPath] = useState([]);
  const [currentFolder, setCurrentFolder] = useState(null); // Currently selected folder
  const [breadcrumbs, setBreadcrumbs] = useState([]); // Breadcrumbs for navigation
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [projectFileCount, setProjectFileCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [hasFetchedFolders, setHasFetchedFolders] = useState(false);
  const [kyroId, setKyroId] = useState("");
  const { currentUser } = useAuth();

  const fetchFolders = async () => {
    setIsLoading(true);
    try {
      const { folders } = await fetchProjectFolders(project.id);
      setFolders(folders || []);
      setError(null);
      setHasFetchedFolders(true); // Mark folders as fetched
    } catch (err) {
      setError(err.message || "Failed to fetch folders");
      setHasFetchedFolders(true); // Even on error, mark as fetched
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFolderFiles = useCallback(async () => {
    const files = await fetchProjectFilesByFolder(project.id, currentFolder.id);

    setFiles(files);
  }, [project.id, currentFolder?.id]);

  const fetchDirectProjectFiles = useCallback(async () => {
    const projectFiles = await fetchProjectFiles(project.id);
    const filteredFiles = projectFiles.filter((file) => file.status === 0);
    setFiles(filteredFiles);
  }, [project.id]);

  useEffect(() => {
    const getKyroId = async () => {
      const id = await kyroCompanyId();
      setKyroId(id);
    };
    getKyroId();
  }, [currentUser]);

  useEffect(() => {
    fetchFolders();
  }, [project]);

  useEffect(() => {
    const CountFiles = async () => {
      const count = await fetchTotalProjectFilesCount(project.id);
      setProjectFileCount(count);
    };
    CountFiles();
  }, [project.id]);

  useEffect(() => {
    if (currentFolder) {
      fetchFolderFiles();
    } else if (hasFetchedFolders && folders.length === 0) {
      fetchDirectProjectFiles();
    }
  }, [
    currentFolder,
    folders.length,
    hasFetchedFolders,
    fetchFolderFiles,
    fetchDirectProjectFiles,
  ]);

  const handleFileDelete = async (fileId, fileName) => {
    try {
      setIsLoading(true);
      await deleteFile(project.id, fileId, fileName);
      setFiles(files.filter((file) => file.id !== fileId));

      setIsLoading(false);
    } catch (err) {
      console.error("Error deleting file:", err);
      setError(err);
      setIsLoading(false);
    }
  };

  const handleDeleteSelected = async () => {
    for (const row of selectedRows) {
      // console.log("row",row)
      let fileName = await fetchFileNameById(project.id, row);
      // console.log("row",row, fileName);
      await handleFileDelete(row, fileName);
    }
    setSelectedRows([]);
    fetchFolderFiles();
    // setSelectedProject(null);
    // navigate(1);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // console.log("folder", folders);
  // console.log("current folder", currentFolder);

  // Handle folder click
  const handleFolderClick = (folder) => {
    setSelectedFolder(folder);
    setCurrentFolder(folder);
    setBreadcrumbs((prev) => [...prev, folder]);
    setFiles(folder.files || []);
  };

  // Handle back button or breadcrumb click
  const handleBackClick = (index = null) => {
    if (index !== null) {
      // Navigate to a specific breadcrumb
      const newBreadcrumbs = breadcrumbs.slice(0, index + 1);
      setBreadcrumbs(newBreadcrumbs);
      const newCurrentFolder =
        newBreadcrumbs[newBreadcrumbs.length - 1] || null;
      setCurrentFolder(newCurrentFolder);
      setFiles(newCurrentFolder?.files || []);
    } else if (currentFolder) {
      // Navigate back to the parent folder
      const parentFolder = breadcrumbs[breadcrumbs.length - 2] || null;
      setBreadcrumbs((prev) => prev.slice(0, -1));
      setCurrentFolder(parentFolder);
      setFiles(parentFolder?.files || []);
    } else {
      onBack();
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      setError("Folder name cannot be empty");
      return;
    }

    try {
      setIsLoading(true);
      const newFolder = await createFolder({
        projectId: project.id,
        folderName: newFolderName,
        parentFolderId: currentFolder ? currentFolder.id : null,
        // parentFolderId: selectedFolder ? selectedFolder.id : null,
      });
      setFolders([...folders, newFolder.folder]);
      setIsCreateFolderModalOpen(false);
      setNewFolderName("");
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to create folder");
    } finally {
      setIsLoading(false);
    }
  };

  // console.log("project file count", projectFileCount);
  // console.log("current folder", currentFolder);
  // console.log("Folder length", folders.length);
  console.log("currentUser", currentUser);

  return (
    <div className="flex flex-col items-center h-full  ">
      {/* Breadcrumbs */}
      <div className="w-full mb-4 flex items-center justify-between">
        <Breadcrumbs
          separator="›"
          aria-label="breadcrumb"
          className="w-full mb-4"
        >
          <Link
            underline="hover"
            color="inherit"
            onClick={() => handleBackClick(null)}
            className="cursor-pointer"
          >
            {project.name}
          </Link>
          {breadcrumbs.map((folder, index) => (
            <Link
              key={folder.id}
              underline="hover"
              color={
                index === breadcrumbs.length - 1 ? "text.primary" : "inherit"
              }
              onClick={() => handleBackClick(index)}
              className="cursor-pointer"
            >
              {folder.name}
            </Link>
          ))}
        </Breadcrumbs>

        {/* Header */}
        {breadcrumbs.length >= 0 && (
          <IconButton onClick={() => handleBackClick()}>
            <ArrowBackIcon fontSize="large" />
          </IconButton>
        )}
      </div>
      {/* Loading and error state */}
      {isLoading && (
        <div className="flex items-center justify-center h-full">
          <Loader />
        </div>
      )}
      {error && <p className="text-red-500">{error}</p>}

      {/* Folder List */}
      {!isLoading && !error && folders.length > 0 && (
        <div className="w-full">
          <FolderList
            folders={
              currentFolder
                ? currentFolder.children || []
                : folders.filter((folder) => !folder.parentFolderId)
            }
            onFolderClick={handleFolderClick}
          />
        </div>
      )}

      {/* Show "No files or folders found" when both are empty */}
      {!isLoading &&
        !error &&
        currentFolder?.children.length === 0 &&
        files.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            No files or folders found
          </div>
        )}

      {/* File List */}
      {/* {hasFetchedFolders && (folders.length == 0 || files.length > 0) && (
        <div className="w-full">
          {currentUser?.roleName === "user" ? (
            <KyroUserFileAssign companyId={companyId} projectId={project.id} />
          ) : currentUser?.companyId == kyroId ? (
            <KyroAdminFileFlow companyId={companyId} projectId={project.id} />
          ) : (
            <AdminFileFlow companyId={companyId} projectId={project.id} />
          )}
        </div>
      )} */}

      {/* {hasFetchedFolders && (folders.length === 0 || files.length > 0) && (
        <div className="w-full">
          {currentUser?.companyId  === kyroId ? (
            currentUser?.roleName === "user" ? (
              <KyroUserFileAssign companyId={companyId} projectId={project.id} />
            ) : (
              <KyroAdminFileFlow companyId={companyId} projectId={project.id} />
            )
          ) : currentUser?.roleName === "user" ? (
            <UserFileAssign companyId={companyId} projectId={project.id} />
          ) : (
            <AdminFileFlow companyId={companyId} projectId={project.id} />
          )}
        </div>
      )} */}

      {hasFetchedFolders && (folders.length === 0 || files.length > 0) && (
        <div className="w-full">
          {currentUser?.roleName === "superAdmin" ? (
            <>
              <KyroAdminFileFlow companyId={companyId} projectId={project.id} />
              <AdminFileFlow companyId={companyId} projectId={project.id} />
            </>
          ) : currentUser?.companyId === kyroId ? (
            currentUser?.roleName === "user" ? (
              <KyroUserFileAssign companyId={companyId} projectId={project.id} />
            ) : (
              <KyroAdminFileFlow companyId={companyId} projectId={project.id} />
            )
          ) : currentUser?.roleName === "user" ? (
            <UserFileAssign companyId={companyId} projectId={project.id} />
          ) : (
            <AdminFileFlow companyId={companyId} projectId={project.id} />
          )}
        </div>
      )}


    </div>
  );
};

export default FolderView;
