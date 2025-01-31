// // // import React, { useState, useEffect } from "react";
// // // import {
// // //   fetchProjectFolders,
// // //   createFolder,
// // // } from "../../services/folderServices";
// // // import { uploadFile } from "../../services/fileServices";
// // // import { Fab, IconButton, Button, CircularProgress } from "@mui/material";
// // // import AddIcon from "@mui/icons-material/Add";
// // // import FolderIcon from "@mui/icons-material/Folder";
// // // import ArrowBackIcon from "@mui/icons-material/ArrowBack";
// // // import TableUpload from "../Table/TableUpload";
// // // import Loader from "../common/Loader";

// // // const FolderView = ({ project, onBack }) => {
// // //   const [folders, setFolders] = useState([]);
// // //   const [selectedFolder, setSelectedFolder] = useState(null);
// // //   const [files, setFiles] = useState([]);
// // //   const [isLoading, setIsLoading] = useState(false);
// // //   const [error, setError] = useState(null);
// // //   const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
// // //   const [newFolderName, setNewFolderName] = useState("");

// // //   useEffect(() => {
// // //     const fetchFolders = async () => {
// // //       setIsLoading(true);
// // //       try {
// // //         const { folders } = await fetchProjectFolders(project.id);
// // //         setFolders(folders);
// // //       } catch (err) {
// // //         setError(err);
// // //       } finally {
// // //         setIsLoading(false);
// // //       }
// // //     };

// // //     fetchFolders();
// // //   }, [project]);

// // //   const handleFolderClick = (folder) => {
// // //     setSelectedFolder(folder);
// // //     setFiles(folder.files || []);
// // //   };

// // //   const handleFileUpload = async (e) => {
// // //     const uploadedFiles = Array.from(e.target.files).filter(
// // //       (file) => file.type === "application/pdf"
// // //     );
// // //     try {
// // //       setIsLoading(true);
// // //       const uploadPromises = uploadedFiles.map((file) =>
// // //         uploadFile(project.id, file, selectedFolder ? selectedFolder.id : null)
// // //       );
// // //       const uploadedFilesData = await Promise.all(uploadPromises);
// // //       setFiles([...files, ...uploadedFilesData]);
// // //     } catch (err) {
// // //       setError(err);
// // //     } finally {
// // //       setIsLoading(false);
// // //     }
// // //   };

// // //   const handleCreateFolder = async () => {
// // //     try {
// // //       const newFolder = await createFolder({
// // //         projectId: project.id,
// // //         folderName: newFolderName,
// // //         parentFolderId: selectedFolder ? selectedFolder.id : null,
// // //       });
// // //       setFolders([...folders, newFolder.folder]);
// // //       setIsCreateFolderModalOpen(false);
// // //       setNewFolderName("");
// // //     } catch (err) {
// // //       setError(err);
// // //     }
// // //   };

// // //   const handleBack = () => {
// // //     if (selectedFolder) {
// // //       const parentFolder = folders.find(
// // //         (folder) => folder.id === selectedFolder.parentFolderId
// // //       );
// // //       setSelectedFolder(parentFolder || null);
// // //     } else {
// // //       onBack();
// // //     }
// // //   };

// // //   return (
// // //     <div className="flex flex-col items-center h-full">
// // //       <div className="w-full p-4">
// // //         <div className="flex items-center justify-between">
// // //           <h2 className="text-2xl font-semibold">
// // //             {selectedFolder ? selectedFolder.name : project.name}
// // //           </h2>
// // //           <IconButton onClick={handleBack}>
// // //             <ArrowBackIcon fontSize="large" />
// // //           </IconButton>
// // //         </div>

// // //         {isLoading && (
// // //           <div className="flex items-center justify-center h-full">
// // //             <Loader />
// // //           </div>
// // //         )}
// // //         {error && <p>Error: {error.message}</p>}

// // //         {!isLoading && !error && (
// // //           <div>
// // //             <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
// // //               {folders
// // //                 .filter((folder) =>
// // //                   selectedFolder
// // //                     ? folder.parentFolderId === selectedFolder.id
// // //                     : !folder.parentFolderId
// // //                 )
// // //                 .map((folder) => (
// // //                   <div
// // //                     key={folder.id}
// // //                     className="flex flex-col items-center p-3 rounded-xl hover:bg-gray-200 transition cursor-pointer"
// // //                     onClick={() => handleFolderClick(folder)}
// // //                   >
// // //                     <FolderIcon color="primary" sx={{ fontSize: 100 }} />
// // //                     <h3 className="mt-2 text-lg font-medium">{folder.name}</h3>
// // //                   </div>
// // //                 ))}
// // //             </div>

// // //             {selectedFolder && (
// // //               <TableUpload
// // //                 columns={[
// // //                   { id: "slNo", label: "Sl. No", minWidth: 50 },
// // //                   { id: "name", label: "File Name", minWidth: 170 },
// // //                   { id: "pageCount", label: "Page Count", minWidth: 100 },
// // //                   { id: "uploadedDate", label: "Uploaded At", minWidth: 170 },
// // //                 ]}
// // //                 rows={files.map((file, index) => ({
// // //                   ...file,
// // //                   slNo: index + 1,
// // //                 }))}
// // //               />
// // //             )}

// // //             <input
// // //               type="file"
// // //               multiple
// // //               accept="application/pdf"
// // //               id="file-upload"
// // //               style={{ display: "none" }}
// // //               onChange={handleFileUpload}
// // //             />
// // //             <Button
// // //               variant="contained"
// // //               color="primary"
// // //               onClick={() => document.getElementById("file-upload").click()}
// // //               sx={{ mt: 2 }}
// // //             >
// // //               Upload Files
// // //             </Button>
// // //           </div>
// // //         )}

// // //         <Fab
// // //           variant="extended"
// // //           color="secondary"
// // //           size="large"
// // //           sx={{ position: "fixed", bottom: 40, right: 16 }}
// // //           onClick={() => setIsCreateFolderModalOpen(true)}
// // //         >
// // //           <AddIcon sx={{ mr: 1 }} />
// // //           New Folder
// // //         </Fab>

// // //         {isCreateFolderModalOpen && (
// // //   <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
// // //     <div className="bg-white rounded-lg p-6 w-96">
// // //       <h2 className="text-xl font-semibold mb-4">Create New Folder</h2>

// // //       <form onSubmit={handleCreateFolder}>
// // //         <div className="mb-4">
// // //           <label htmlFor="folderName" className="block text-sm font-medium text-gray-700">
// // //             Folder Name
// // //           </label>
// // //           <input
// // //             type="text"
// // //             id="folderName"
// // //             name="folderName"
// // //             value={newFolderName}
// // //             onChange={(e) => setNewFolderName(e.target.value)}
// // //             className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
// // //             placeholder="Enter folder name"
// // //             required
// // //           />
// // //         </div>

// // //         <div className="flex justify-end gap-3">
// // //           <button
// // //             type="button"
// // //             onClick={() => setIsCreateFolderModalOpen(false)}
// // //             className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
// // //           >
// // //             Cancel
// // //           </button>
// // //           <button
// // //             type="submit"
// // //             className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
// // //           >
// // //             Create Folder
// // //           </button>
// // //         </div>
// // //       </form>
// // //     </div>
// // //   </div>
// // // )}
// // //       </div>
// // //     </div>
// // //   );
// // // };

// // // export default FolderView;
// // import React, { useState, useEffect } from "react";
// // import {
// //   fetchProjectFolders,
// //   createFolder,
// // } from "../../services/folderServices";
// // import { uploadFile } from "../../services/fileServices";
// // import { Fab, IconButton, Button } from "@mui/material";
// // import AddIcon from "@mui/icons-material/Add";
// // import FolderIcon from "@mui/icons-material/Folder";
// // import ArrowBackIcon from "@mui/icons-material/ArrowBack";
// // import TableUpload from "../Table/TableUpload";
// // import Loader from "../common/Loader";
// // import UploadFileIcon from "@mui/icons-material/UploadFile";
// // import {FolderList} from '../common/FolderList'

// // const FolderView = ({ project, onBack }) => {
// //   const [folders, setFolders] = useState([]);
// //   const [selectedFolder, setSelectedFolder] = useState(null);
// //   const [files, setFiles] = useState([]);
// //   const [isLoading, setIsLoading] = useState(false);
// //   const [error, setError] = useState(null);
// //   const [isCreateFolderModalOpen, setIsCreateFolderModalOpen] = useState(false);
// //   const [newFolderName, setNewFolderName] = useState("");
// //   const [anchorEl, setAnchorEl] = useState(null);

// //   const fetchFolders = async () => {
// //     setIsLoading(true);
// //     try {
// //       const { folders } = await fetchProjectFolders(project.id);
// //       console.log('folder',folders)
// //       setFolders(folders);
// //       setError(null);
// //     } catch (err) {
// //       setError(err.message || "Failed to fetch folders");
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchFolders();
// //   }, [project]);

// //   const handleFolderClick = (folder) => {
// //     setSelectedFolder(folder);
// //     setFiles(folder.files || []);
// //   };

// //   const handleFileUpload = async (e) => {
// //     const uploadedFiles = Array.from(e.target.files).filter(
// //       (file) => file.type === "application/pdf"
// //     );
// //     try {
// //       setIsLoading(true);
// //       const uploadPromises = uploadedFiles.map((file) =>
// //         uploadFile(project.id, file, selectedFolder ? selectedFolder.id : null)
// //       );
// //       const uploadedFilesData = await Promise.all(uploadPromises);
// //       setFiles([...files, ...uploadedFilesData]);
// //       setError(null);
// //     } catch (err) {
// //       setError(err.message || "Failed to upload files");
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   const handleCreateFolder = async () => {
// //     if (!newFolderName.trim()) {
// //       setError("Folder name cannot be empty");
// //       return;
// //     }

// //     try {
// //       setIsLoading(true);
// //       const newFolder = await createFolder({
// //         projectId: project.id,
// //         folderName: newFolderName,
// //         parentFolderId: selectedFolder ? selectedFolder.id : null,
// //       });
// //       setFolders([...folders, newFolder.folder]);
// //       setIsCreateFolderModalOpen(false);
// //       setNewFolderName("");
// //       setError(null);
// //     } catch (err) {
// //       setError(err.message || "Failed to create folder");
// //     } finally {
// //       setIsLoading(false);
// //     }
// //   };

// //   // const handleBack = () => {
// //   //   if (selectedFolder) {
// //   //     const parentFolder = folders.find(
// //   //       (folder) => folder.id === selectedFolder.parentFolderId
// //   //     );
// //   //     setSelectedFolder(parentFolder || null);
// //   //   } else {
// //   //     onBack();
// //   //   }
// //   // };

// //   const handleBack = () => {
// //     if (selectedFolder) {
// //       const parentFolder = folders.find(
// //         (folder) => folder.id === selectedFolder.parentFolderId
// //       );
// //       if (parentFolder) {
// //         setSelectedFolder(parentFolder);
// //         const siblingFolders = folders.filter(
// //           (folder) => folder.parentFolderId === parentFolder.id
// //         );
// //         setFolders(siblingFolders);
// //         setFiles(parentFolder.files || []);
// //       } else {
// //         setSelectedFolder(null);
// //         fetchFolders(); // Reload root folders
// //       }
// //     } else {
// //       onBack();
// //     }
// //   };

// //   return (
// //     <div className="flex flex-col items-center h-full">
// //       <div className="w-full p-4">
// //         <div className="flex items-center justify-between">
// //           <h2 className="text-2xl font-semibold">
// //             {selectedFolder ? selectedFolder.name : project.name}
// //           </h2>
// //           <IconButton onClick={handleBack}>
// //             <ArrowBackIcon fontSize="large" />
// //           </IconButton>
// //         </div>
// //         {isLoading && (
// //           <div className="flex items-center justify-center h-full">
// //             <Loader />
// //           </div>
// //         )}
// //         {error && <p className="text-red-500">{error}</p>}
// //         {!isLoading && !error && (
// //             <FolderList
// //             folders={selectedFolder ? selectedFolder.children : folders}
// //             onFolderClick={handleFolderClick}
// //           />
// //           // <div>
// //           //   <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
// //           //     {folders
// //           //       .filter((folder) =>
// //           //         selectedFolder
// //           //           ? folder.parentFolderId === selectedFolder.id
// //           //           : !folder.parentFolderId
// //           //       )
// //           //       .map((folder) => (
// //           //         <div
// //           //           key={folder.id}
// //           //           className="flex flex-col items-center p-3 rounded-xl hover:bg-gray-200 transition cursor-pointer"
// //           //           onClick={() => handleFolderClick(folder)}
// //           //         >
// //           //           <FolderIcon color="primary" sx={{ fontSize: 100 }} />
// //           //           <h3 className="mt-2 text-lg font-medium">{folder.name}</h3>
// //           //         </div>
// //           //       ))}
// //           //   </div>

// //           //   {selectedFolder && files.length > 0 && (
// //           //     <TableUpload
// //           //       columns={[
// //           //         { id: "slNo", label: "Sl. No", minWidth: 50 },
// //           //         { id: "name", label: "File Name", minWidth: 170 },
// //           //         { id: "pageCount", label: "Page Count", minWidth: 100 },
// //           //         { id: "uploadedDate", label: "Uploaded At", minWidth: 170 },
// //           //       ]}
// //           //       rows={(files || []).map((file, index) => ({
// //           //         ...file,
// //           //         slNo: index + 1,
// //           //       }))}
// //           //     />
// //           //   )}

// //           //   <input
// //           //     type="file"
// //           //     multiple
// //           //     accept="application/pdf"
// //           //     id="file-upload"
// //           //     style={{ display: "none" }}
// //           //     onChange={handleFileUpload}
// //           //   />
// //           //   {/* <Button
// //           //     variant="contained"
// //           //     color="primary"
// //           //     onClick={() => document.getElementById("file-upload").click()}
// //           //     sx={{ mt: 2 }}
// //           //   >
// //           //     Upload Files
// //           //   </Button> */}
// //           // </div>
// //         )}
// //         {/* <Fab
// //           variant="extended"
// //           color="secondary"
// //           size="large"
// //           sx={{ position: "fixed", bottom: 40, right: 16 }}
// //           onClick={() => setIsCreateFolderModalOpen(true)}
// //         >
// //           <AddIcon sx={{ mr: 1 }} />
// //           New Folder
// //         </Fab> */}
// //         <div className="fixed bottom-8 right-8 z-40">
// //           <Fab
// //             color="primary"
// //             aria-haspopup="true"
// //             onClick={(e) => setAnchorEl(e.currentTarget)}
// //             sx={{
// //               background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
// //               boxShadow: "0 3px 5px 2px rgba(33, 203, 243, .3)",
// //               "&:hover": {
// //                 background: "linear-gradient(45deg, #21CBF3 30%, #2196F3 90%)",
// //                 transform: "scale(1.05)",
// //               },
// //               transition: "all 0.3s ease-in-out",
// //             }}
// //           >
// //             <AddIcon />
// //           </Fab>
// //           <Menu
// //             anchorEl={anchorEl}
// //             open={Boolean(anchorEl)}
// //             onClose={() => setAnchorEl(null)}
// //             anchorOrigin={{
// //               vertical: "top",
// //               horizontal: "center",
// //             }}
// //             transformOrigin={{
// //               vertical: "bottom",
// //               horizontal: "center",
// //             }}
// //             sx={{
// //               "& .MuiPaper-root": {
// //                 borderRadius: 2,
// //                 marginBottom: 1,
// //                 boxShadow: "0 3px 5px 2px rgba(0, 0, 0, .1)",
// //               },
// //             }}
// //           >
// //             <MenuItem
// //               onClick={() => {
// //                 setIsCreateFolderModalOpen(true);
// //                 setAnchorEl(null);
// //               }}
// //               sx={{
// //                 minWidth: 200,
// //                 "&:hover": {
// //                   backgroundColor: "rgba(33, 150, 243, 0.08)",
// //                 },
// //               }}
// //             >
// //               <FolderIcon sx={{ mr: 1 }} />
// //               Create New Folder
// //             </MenuItem>
// //             <MenuItem
// //               onClick={() => {
// //                 document.getElementById("file-upload").click();
// //                 setAnchorEl(null);
// //               }}
// //               disabled={folders.length > 0}
// //               sx={{
// //                 minWidth: 200,
// //                 "&:hover": {
// //                   backgroundColor: "rgba(33, 150, 243, 0.08)",
// //                 },
// //               }}
// //             >
// //               <UploadFileIcon sx={{ mr: 1 }} />
// //               Upload Files
// //             </MenuItem>
// //           </Menu>
// //           <input
// //             type="file"
// //             multiple
// //             accept="application/pdf"
// //             id="file-upload"
// //             style={{ display: "none" }}
// //             onChange={handleFileUpload}
// //           />
// //         </div>
// //         {isCreateFolderModalOpen && (
// //           <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
// //             <div className="bg-white rounded-lg p-6 w-full max-w-md">
// //               <h3 className="text-lg font-medium mb-4">Create New Folder</h3>
// //               <input
// //                 type="text"
// //                 className="w-full p-2 border rounded-md mb-4"
// //                 placeholder="Enter folder name"
// //                 value={newFolderName}
// //                 onChange={(e) => setNewFolderName(e.target.value)}
// //               />
// //               <div className="flex justify-end space-x-4">
// //                 <Button
// //                   variant="contained"
// //                   color="primary"
// //                   onClick={handleCreateFolder}
// //                 >
// //                   Create
// //                 </Button>
// //                 <Button
// //                   variant="outlined"
// //                   color="secondary"
// //                   onClick={() => setIsCreateFolderModalOpen(false)}
// //                 >
// //                   Cancel
// //                 </Button>
// //               </div>
// //             </div>
// //           </div>
// //         )}
// //       </div>
// //     </div>
// //   );
// // };

// // export default FolderView;

// import React, { useState, useEffect } from "react";
// import { fetchProjectFolders, createFolder } from "../../services/folderServices";
// import { uploadFile } from "../../services/fileServices";
// import { Fab, Button } from "@mui/material";
// import AddIcon from "@mui/icons-material/Add";
// import ArrowBackIcon from "@mui/icons-material/ArrowBack";
// import Loader from "../common/Loader";
// import { FolderList } from "../common/FolderList";

// const FolderView = ({ project, onBack }) => {
//   const [folders, setFolders] = useState([]);
//   const [currentPath, setCurrentPath] = useState([]);
//   const [currentFolders, setCurrentFolders] = useState([]);
//   const [files, setFiles] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const fetchFolders = async () => {
//     setIsLoading(true);
//     try {
//       const { folders } = await fetchProjectFolders(project.id);
//       setFolders(folders);
//       setCurrentFolders(folders.filter((folder) => !folder.parentFolderId)); // Load root folders
//       setError(null);
//     } catch (err) {
//       setError(err.message || "Failed to fetch folders");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchFolders();
//   }, [project]);

//   const handleFolderClick = (folder) => {
//     setCurrentPath([...currentPath, folder]);
//     setCurrentFolders(folder.children || []);
//     setFiles(folder.files || []);
//   };

//   const handleBackClick = () => {
//     const updatedPath = [...currentPath];
//     updatedPath.pop();

//     const parentFolder = updatedPath.length
//       ? updatedPath[updatedPath.length - 1]
//       : null;

//     setCurrentPath(updatedPath);
//     setCurrentFolders(parentFolder ? parentFolder.children : folders.filter((f) => !f.parentFolderId));
//     setFiles(parentFolder ? parentFolder.files : []);
//   };

//   const handleFileUpload = async (e) => {
//     const uploadedFiles = Array.from(e.target.files).filter(
//       (file) => file.type === "application/pdf"
//     );

//     try {
//       setIsLoading(true);
//       const uploadPromises = uploadedFiles.map((file) =>
//         uploadFile(
//           project.id,
//           file,
//           currentPath.length ? currentPath[currentPath.length - 1].id : null
//         )
//       );
//       const uploadedFilesData = await Promise.all(uploadPromises);
//       setFiles([...files, ...uploadedFilesData]);
//       setError(null);
//     } catch (err) {
//       setError(err.message || "Failed to upload files");
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
//     <div className="flex flex-col items-center h-full">
//       <div className="w-full p-4">
//         {/* Header */}
//         <div className="flex items-center justify-between">
//           <h2 className="text-2xl font-semibold">
//             {currentPath.length > 0
//               ? currentPath[currentPath.length - 1].name
//               : project.name}
//           </h2>
//           {currentPath.length > 0 && (
//             <Button
//               startIcon={<ArrowBackIcon />}
//               onClick={handleBackClick}
//               variant="outlined"
//               color="primary"
//             >
//               Back
//             </Button>
//           )}
//         </div>

//         {/* Loader */}
//         {isLoading && (
//           <div className="flex items-center justify-center h-full">
//             <Loader />
//           </div>
//         )}

//         {/* Error Message */}
//         {error && <p className="text-red-500">{error}</p>}

//         {/* Folder List */}
//         {!isLoading && !error && (
//           <FolderList
//             folders={currentFolders|| []}
//             onFolderClick={handleFolderClick}
//           />
//         )}

//         {/* File Upload */}
//         {currentPath.length > 0 && files.length > 0 && (
//           <div className="mt-4">
//             <h3 className="text-lg font-semibold mb-2">Files:</h3>
//             <ul>
//               {files.map((file, index) => (
//                 <li key={index} className="mb-2">
//                   {file.name}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}

//         <input
//           type="file"
//           multiple
//           accept="application/pdf"
//           id="file-upload"
//           style={{ display: "none" }}
//           onChange={handleFileUpload}
//         />
//         <Fab
//           color="primary"
//           aria-label="add"
//           onClick={() => document.getElementById("file-upload").click()}
//           sx={{
//             position: "fixed",
//             bottom: 16,
//             right: 16,
//             background: "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
//           }}
//         >
//           <AddIcon />
//         </Fab>
//       </div>
//     </div>
//   );
// };

// export default FolderView;

import React, { useState, useEffect, useCallback } from "react";
import {
  fetchProjectFolders,
  createFolder,
} from "../../services/folderServices";
import {
  deleteFile,
  fetchFileNameById,
  uploadFile,
} from "../../services/fileServices";
import {
  Breadcrumbs,
  Link,
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
import { UploadFile } from "@mui/icons-material";
import {
  fetchTotalProjectFilesCount,
  fetchProjectFilesByFolder,
  fetchProjectFiles,
} from "../../services/projectServices";
import { file, folder } from "jszip";

const UploadFolderView = ({ project, onBack }) => {
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

  const columns = [
    { id: "slNo", label: "Sl. No", minWidth: 50 },
    { id: "name", label: "File Name", minWidth: 170 },
    { id: "pageCount", label: "Page Count", minWidth: 100 },
    { id: "uploadedDate", label: "Uploaded At", minWidth: 170 },
    { id: "edit", label: "Actions", minWidth: 100 },
  ];

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

  const handleFileUpload = async (e) => {
    const uploadedFiles = Array.from(e.target.files).filter(
      (file) => file.type === "application/pdf"
    );
    // console.log('upload')

    try {
      setIsLoading(true);
      const uploadPromises = uploadedFiles.map((file) =>
        uploadFile(
          project.id,
          file,
          currentFolder?.id
          // currentPath.length ? currentPath[currentPath.length - 1].id : null
        )
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
  // console.log("project file count", projectFileCount);
  // console.log("current folder", currentFolder);
  // console.log("Folder length", folders.length);

  return (
    <div className="flex flex-col items-center h-full  p-4">
      <div className="w-full mb-4 flex items-center justify-between">
        <Breadcrumbs separator="›" aria-label="breadcrumb">
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
      {/* File List */}
      {hasFetchedFolders && (folders.length == 0 || files.length > 0) && (
        <div className="w-full">
          <TableUpload
            columns={[
              { id: "slNo", label: "Sl. No", minWidth: 50 },
              { id: "name", label: "File Name", minWidth: 170 },
              { id: "pageCount", label: "Page Count", minWidth: 100 },
              { id: "uploadedDate", label: "Uploaded At", minWidth: 170 },
            ]}
            rows={files.map((file, index) => ({
              ...file,
              slNo: index + 1,
            }))}
            page={page}
            rowsPerPage={rowsPerPage}
            handleChangePage={handleChangePage}
            handleChangeRowsPerPage={handleChangeRowsPerPage}
            selectedRows={selectedRows}
            setSelectedRows={setSelectedRows}
            handleEditClick={handleFileDelete}
            handleDeleteSelected={handleDeleteSelected}
            // projectName={selectedProject.name}
          />
        </div>
      )}

      {/* ---------------------------
            Floating Action Button + Menu
           --------------------------- */}
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
            disabled={
              files.length > 0 || (folders.length == 0 && projectFileCount > 0)
            }
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
            onClick={() => document.getElementById("file-upload").click()}
            disabled={
              (currentFolder && currentFolder.children?.length > 0) ||
              (!currentFolder && folders.length > 0)
            }
            sx={{
              minWidth: 200,
              "&:hover": {
                backgroundColor: "rgba(33, 150, 243, 0.08)",
              },
            }}
          >
            <UploadFile sx={{ mr: 1 }} />
            Upload Files
          </MenuItem>
          <input
            type="file"
            multiple
            accept="application/pdf"
            id="file-upload"
            style={{ display: "none" }}
            onChange={handleFileUpload}
          />
        </Menu>
      </div>

      {/* ---------------------------
            Create Folder Modal
           --------------------------- */}
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
  );
};

export default UploadFolderView;
