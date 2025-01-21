// import React, { useState, useEffect } from "react";
// import {
//   fetchProjectFolders,
//   createFolder,
// } from "../../services/folderServices";
// import { uploadFile } from "../../services/fileServices";
// import { Fab, IconButton, Button, CircularProgress } from "@mui/material";
// import AddIcon from "@mui/icons-material/Add";
// import FolderIcon from "@mui/icons-material/Folder";
// import ArrowBackIcon from "@mui/icons-material/ArrowBack";
// import TableUpload from "../Table/TableUpload";
// import Loader from "../common/Loader";

// const FolderView = ({ project, onBack }) => {
//   const [folders, setFolders] = useState([]);
//   const [selectedFolder, setSelectedFolder] = useState(null);
//   const [files, setFiles] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
//   const [newFolderName, setNewFolderName] = useState("");

//   useEffect(() => {
//     const fetchFolders = async () => {
//       setIsLoading(true);
//       try {
//         const { folders } = await fetchProjectFolders(project.id);
//         setFolders(folders);
//       } catch (err) {
//         setError(err);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchFolders();
//   }, [project]);

//   const handleFolderClick = (folder) => {
//     setSelectedFolder(folder);
//     setFiles(folder.files || []);
//   };

//   const handleFileUpload = async (e) => {
//     const uploadedFiles = Array.from(e.target.files).filter(
//       (file) => file.type === "application/pdf"
//     );
//     try {
//       setIsLoading(true);
//       const uploadPromises = uploadedFiles.map((file) =>
//         uploadFile(project.id, file, selectedFolder ? selectedFolder.id : null)
//       );
//       const uploadedFilesData = await Promise.all(uploadPromises);
//       setFiles([...files, ...uploadedFilesData]);
//     } catch (err) {
//       setError(err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleCreateFolder = async () => {
//     try {
//       const newFolder = await createFolder({
//         projectId: project.id,
//         folderName: newFolderName,
//         parentFolderId: selectedFolder ? selectedFolder.id : null,
//       });
//       setFolders([...folders, newFolder.folder]);
//       setIsCreateFolderModalOpen(false);
//       setNewFolderName("");
//     } catch (err) {
//       setError(err);
//     }
//   };

//   const handleBack = () => {
//     if (selectedFolder) {
//       const parentFolder = folders.find(
//         (folder) => folder.id === selectedFolder.parentFolderId
//       );
//       setSelectedFolder(parentFolder || null);
//     } else {
//       onBack();
//     }
//   };

//   return (
//     <div className="flex flex-col items-center h-full">
//       <div className="w-full p-4">
//         <div className="flex items-center justify-between">
//           <h2 className="text-2xl font-semibold">
//             {selectedFolder ? selectedFolder.name : project.name}
//           </h2>
//           <IconButton onClick={handleBack}>
//             <ArrowBackIcon fontSize="large" />
//           </IconButton>
//         </div>

//         {isLoading && (
//           <div className="flex items-center justify-center h-full">
//             <Loader />
//           </div>
//         )}
//         {error && <p>Error: {error.message}</p>}

//         {!isLoading && !error && (
//           <div>
//             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
//               {folders
//                 .filter((folder) =>
//                   selectedFolder
//                     ? folder.parentFolderId === selectedFolder.id
//                     : !folder.parentFolderId
//                 )
//                 .map((folder) => (
//                   <div
//                     key={folder.id}
//                     className="flex flex-col items-center p-3 rounded-xl hover:bg-gray-200 transition cursor-pointer"
//                     onClick={() => handleFolderClick(folder)}
//                   >
//                     <FolderIcon color="primary" sx={{ fontSize: 100 }} />
//                     <h3 className="mt-2 text-lg font-medium">{folder.name}</h3>
//                   </div>
//                 ))}
//             </div>

//             {selectedFolder && (
//               <TableUpload
//                 columns={[
//                   { id: "slNo", label: "Sl. No", minWidth: 50 },
//                   { id: "name", label: "File Name", minWidth: 170 },
//                   { id: "pageCount", label: "Page Count", minWidth: 100 },
//                   { id: "uploadedDate", label: "Uploaded At", minWidth: 170 },
//                 ]}
//                 rows={files.map((file, index) => ({
//                   ...file,
//                   slNo: index + 1,
//                 }))}
//               />
//             )}

//             <input
//               type="file"
//               multiple
//               accept="application/pdf"
//               id="file-upload"
//               style={{ display: "none" }}
//               onChange={handleFileUpload}
//             />
//             <Button
//               variant="contained"
//               color="primary"
//               onClick={() => document.getElementById("file-upload").click()}
//               sx={{ mt: 2 }}
//             >
//               Upload Files
//             </Button>
//           </div>
//         )}

//         <Fab
//           variant="extended"
//           color="secondary"
//           size="large"
//           sx={{ position: "fixed", bottom: 40, right: 16 }}
//           onClick={() => setIsCreateFolderModalOpen(true)}
//         >
//           <AddIcon sx={{ mr: 1 }} />
//           New Folder
//         </Fab>

//         {isCreateFolderModalOpen && (
//   <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
//     <div className="bg-white rounded-lg p-6 w-96">
//       <h2 className="text-xl font-semibold mb-4">Create New Folder</h2>

//       <form onSubmit={handleCreateFolder}>
//         <div className="mb-4">
//           <label htmlFor="folderName" className="block text-sm font-medium text-gray-700">
//             Folder Name
//           </label>
//           <input
//             type="text"
//             id="folderName"
//             name="folderName"
//             value={newFolderName}
//             onChange={(e) => setNewFolderName(e.target.value)}
//             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
//             placeholder="Enter folder name"
//             required
//           />
//         </div>

//         <div className="flex justify-end gap-3">
//           <button
//             type="button"
//             onClick={() => setIsCreateFolderModalOpen(false)}
//             className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
//           >
//             Create Folder
//           </button>
//         </div>
//       </form>
//     </div>
//   </div>
// )}
//       </div>
//     </div>
//   );
// };

// export default FolderView;
import React, { useState, useEffect } from "react";
import {
  fetchProjectFolders,
  createFolder,
} from "../../services/folderServices";
import { uploadFile } from "../../services/fileServices";
import { Fab, IconButton, Button } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FolderIcon from "@mui/icons-material/Folder";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import TableUpload from "../Table/TableUpload";
import Loader from "../common/Loader";
import { Menu, MenuItem } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";

const FolderView = ({ project, onBack }) => {
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);

  const fetchFolders = async () => {
    setIsLoading(true);
    try {
      const { folders } = await fetchProjectFolders(project.id);
      setFolders(folders);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to fetch folders");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFolders();
  }, [project]);

  const handleFolderClick = (folder) => {
    setSelectedFolder(folder);
    setFiles(folder.files || []);
  };

  const handleFileUpload = async (e) => {
    const uploadedFiles = Array.from(e.target.files).filter(
      (file) => file.type === "application/pdf"
    );
    try {
      setIsLoading(true);
      const uploadPromises = uploadedFiles.map((file) =>
        uploadFile(project.id, file, selectedFolder ? selectedFolder.id : null)
      );
      const uploadedFilesData = await Promise.all(uploadPromises);
      setFiles([...files, ...uploadedFilesData]);
      setError(null);
    } catch (err) {
      setError(err.message || "Failed to upload files");
    } finally {
      setIsLoading(false);
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
        parentFolderId: selectedFolder ? selectedFolder.id : null,
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

  const handleBack = () => {
    if (selectedFolder) {
      const parentFolder = folders.find(
        (folder) => folder.id === selectedFolder.parentFolderId
      );
      setSelectedFolder(parentFolder || null);
    } else {
      onBack();
    }
  };

  return (
    <div className="flex flex-col items-center h-full">
      <div className="w-full p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">
            {selectedFolder ? selectedFolder.name : project.name}
          </h2>
          <IconButton onClick={handleBack}>
            <ArrowBackIcon fontSize="large" />
          </IconButton>
        </div>
        {isLoading && (
          <div className="flex items-center justify-center h-full">
            <Loader />
          </div>
        )}
        {error && <p className="text-red-500">{error}</p>}
        {!isLoading && !error && (
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
              {folders
                .filter((folder) =>
                  selectedFolder
                    ? folder.parentFolderId === selectedFolder.id
                    : !folder.parentFolderId
                )
                .map((folder) => (
                  <div
                    key={folder.id}
                    className="flex flex-col items-center p-3 rounded-xl hover:bg-gray-200 transition cursor-pointer"
                    onClick={() => handleFolderClick(folder)}
                  >
                    <FolderIcon color="primary" sx={{ fontSize: 100 }} />
                    <h3 className="mt-2 text-lg font-medium">{folder.name}</h3>
                  </div>
                ))}
            </div>

            {selectedFolder && files.length > 0 && (
              <TableUpload
                columns={[
                  { id: "slNo", label: "Sl. No", minWidth: 50 },
                  { id: "name", label: "File Name", minWidth: 170 },
                  { id: "pageCount", label: "Page Count", minWidth: 100 },
                  { id: "uploadedDate", label: "Uploaded At", minWidth: 170 },
                ]}
                rows={(files || []).map((file, index) => ({
                  ...file,
                  slNo: index + 1,
                }))}
              />
            )}

            <input
              type="file"
              multiple
              accept="application/pdf"
              id="file-upload"
              style={{ display: "none" }}
              onChange={handleFileUpload}
            />
            {/* <Button
              variant="contained"
              color="primary"
              onClick={() => document.getElementById("file-upload").click()}
              sx={{ mt: 2 }}
            >
              Upload Files
            </Button> */}
          </div>
        )}
        {/* <Fab
          variant="extended"
          color="secondary"
          size="large"
          sx={{ position: "fixed", bottom: 40, right: 16 }}
          onClick={() => setIsCreateFolderModalOpen(true)}
        >
          <AddIcon sx={{ mr: 1 }} />
          New Folder
        </Fab> */}
        <div className="fixed bottom-8 right-8 z-40">
          <Fab
            color="primary"
            aria-haspopup="true"
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{
              background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
              boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
              "&:hover": {
                background: "linear-gradient(45deg, #21CBF3 30%, #2196F3 90%)",
                transform: "scale(1.05)",
              },
              transition: "all 0.3s ease-in-out",
            }}
          >
            <AddIcon />
          </Fab>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{
              vertical: "top",
              horizontal: "center",
            }}
            transformOrigin={{
              vertical: "bottom",
              horizontal: "center",
            }}
            sx={{
              "& .MuiPaper-root": {
                borderRadius: 2,
                marginBottom: 1,
                boxShadow: "0 3px 5px 2px rgba(0, 0, 0, .1)",
              },
            }}
          >
            <MenuItem
              onClick={() => {
                setIsCreateFolderModalOpen(true);
                setAnchorEl(null);
              }}
              sx={{
                minWidth: 200,
                "&:hover": {
                  backgroundColor: "rgba(33, 150, 243, 0.08)",
                },
              }}
            >
              <FolderIcon sx={{ mr: 1 }} />
              Create New Folder
            </MenuItem>
            <MenuItem
              onClick={() => {
                document.getElementById("file-upload").click();
                setAnchorEl(null);
              }}
              disabled={folders.length > 0}
              sx={{
                minWidth: 200,
                "&:hover": {
                  backgroundColor: "rgba(33, 150, 243, 0.08)",
                },
              }}
            >
              <UploadFileIcon sx={{ mr: 1 }} />
              Upload Files
            </MenuItem>
          </Menu>
          <input
            type="file"
            multiple
            accept="application/pdf"
            id="file-upload"
            style={{ display: "none" }}
            onChange={handleFileUpload}
          />
        </div>
        {isCreateFolderModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium mb-4">Create New Folder</h3>
              <input
                type="text"
                className="w-full p-2 border rounded-md mb-4"
                placeholder="Enter folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
              <div className="flex justify-end space-x-4">
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleCreateFolder}
                >
                  Create
                </Button>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => setIsCreateFolderModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FolderView;
