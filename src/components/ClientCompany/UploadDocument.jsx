// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import {
//   Dialog,
//   DialogBackdrop,
//   DialogPanel,
//   DialogTitle,
// } from "@headlessui/react";
// import { Fab, IconButton } from "@mui/material";
// import AddIcon from "@mui/icons-material/Add";
// import { useParams, useNavigate } from "react-router-dom";
// import { useAuth } from "../../context/AuthContext";
// import { auth } from "../../utils/firebase";
// import { fetchProjectFiles } from "../../services/projectServices";
// import { uploadFile, deleteFile } from "../../services/fileServices";
// import Button from "@mui/material/Button";
// import CircularProgress from "@mui/material/CircularProgress";
// import { server } from "../../main";
// import { toast, Toaster } from "react-hot-toast";
// import EditIcon from "@mui/icons-material/Edit";
// import { fetchFileNameById } from "../../services/fileServices";
// import TableUpload from "../Table/TableUpload";
// import ArrowBackIcon from "@mui/icons-material/ArrowBack";
// import FolderIcon from "@mui/icons-material/Folder";
// import { fetchTotalProjectFilesCount } from "../../services/projectServices";
// import Loader from "../common/Loader";

// const UploadDocument = () => {
//   const { companyId } = useParams();
//   const navigate = useNavigate();
//   const [projects, setProjects] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [newProjectName, setNewProjectName] = useState("");
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedProject, setSelectedProject] = useState(null);
//   const [files, setFiles] = useState([]);
//   const [role, setRole] = useState("");
//   const [page, setPage] = useState(0);
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const { currentUser } = useAuth();
//   const [selectedRows, setSelectedRows] = useState([]);
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [editProjectName, setEditProjectName] = useState("");
//   const [editProjectId, setEditProjectId] = useState("");
//   const [fileCounts, setFileCounts] = useState({});

//   useEffect(() => {
//     const fetchProjects = async () => {
//       setIsLoading(true);
//       try {
//         const response = await axios.get(
//           `${server}/api/project/${companyId}/getprojects`
//         );
//         setProjects(response.data);
//       } catch (err) {
//         setError(err);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchProjects();
//   }, [companyId]);

//   useEffect(() => {
//     const unsubscribe = auth.onAuthStateChanged(async (user) => {
//       if (user) {
//         const token = await user.getIdTokenResult();
//         // console.log(token)
//         user.roleName = token.claims.roleName;
//         user.companyId = token.claims.companyId;

//         setRole(user.roleName);
//       }
//     });
//     return () => unsubscribe();
//   }, []);

//   //For the delete and option of the project
//   useEffect(() => {
//     const fetchCounts = async () => {
//       const counts = {};
//       for (const project of projects) {
//         const count = await fetchTotalProjectFilesCount(project.id);
//         counts[project.id] = count;
//       }
//       setFileCounts(counts);
//     };

//     fetchCounts();
//   }, [projects]);

//   const newProject = async () => {
//     try {
//       const response = await axios.post(
//         `${server}/api/project/createProject`,
//         {
//           name: newProjectName,
//           companyId,
//         },
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );
//       setProjects([...projects, response.data]);
//       setIsModalOpen(false);
//       setNewProjectName("");
//     } catch (err) {
//       let message = "Refresh your Browser & Try Again";
//       if (err.response && err.response.data) {
//         message = err.response.data.message || message;
//       } else {
//         message = err.message || message;
//       }
//       toast.error(message);
//       console.error("Error creating project:", err);
//     }
//   };

//   const editProject = async () => {
//     try {
//       const response = await axios.put(
//         `${server}/api/project/editProject`,
//         {
//           id: editProjectId,
//           newName: editProjectName,
//         },
//         {
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );
//       setProjects(
//         projects.map((project) =>
//           project.id === editProjectId
//             ? { ...project, name: editProjectName }
//             : project
//         )
//       );
//       // console.log("Id", editProjectId);

//       setIsEditModalOpen(false);
//       setEditProjectName("");
//       setEditProjectId("");
//       // console.log(response.data.message)
//       toast.success(response.data.message);
//     } catch (err) {
//       let message = "Refresh your Browser & Try Again";
//       if (err.response && err.response.data) {
//         message = err.response.data.message || message;
//       } else {
//         message = err.message || message;
//       }
//       toast.error(message);
//       console.error("Error editing project:", err);
//     }
//   };

//   const deleteProject = async () => {
//     // console.log("Id", editProjectId);

//     try {
//       const response = await axios.delete(
//         `${server}/api/project/deleteProject`,
//         {
//           data: { id: editProjectId },
//           headers: {
//             "Content-Type": "application/json",
//           },
//         }
//       );
//       setProjects(projects.filter((project) => project.id !== editProjectId));
//       setIsEditModalOpen(false);
//       setEditProjectId("");
//       toast.success(response.data);
//     } catch (err) {
//       let message = "Refresh your Browser & Try Again";
//       if (err.response && err.response.data) {
//         message = err.response.data.message || message;
//       } else {
//         message = err.message || message;
//       }
//       toast.error(message);
//       console.error("Error editing project:", err);
//     }
//   };

//   const handleProjectClick = async (project) => {
//     setSelectedProject(project);
//     setIsLoading(true);
//     try {
//       const projectFiles = await fetchProjectFiles(project.id);
//       const filteredFiles = projectFiles.filter((file) => file.status === 0); // Filter files by status === 0
//       setFiles(filteredFiles);
//     } catch (err) {
//       console.error("Error fetching project files:", err);
//       setError(err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleFileUpload = async (e) => {
//     const uploadedFiles = Array.from(e.target.files).filter(
//       (file) => file.type === "application/pdf"
//     );
//     try {
//       setIsLoading(true);
//       const uploadPromises = uploadedFiles.map((file) =>
//         uploadFile(selectedProject.id, file)
//       );
//       const uploadedFilesData = await Promise.all(uploadPromises);
//       setFiles([...files, ...uploadedFilesData]);
//       setIsLoading(false);
//     } catch (err) {
//       console.error("Error uploading files:", err);
//       setError(err);
//       setIsLoading(false);
//     }
//   };

//   const handleFileDelete = async (fileId, fileName) => {
//     try {
//       setIsLoading(true);
//       await deleteFile(selectedProject.id, fileId, fileName);
//       setFiles(files.filter((file) => file.id !== fileId));
//       setIsLoading(false);
//     } catch (err) {
//       console.error("Error deleting file:", err);
//       setError(err);
//       setIsLoading(false);
//     }
//   };

//   const handleDeleteSelected = async () => {
//     for (const row of selectedRows) {
//       // console.log("row",row)
//       let fileName = await fetchFileNameById(selectedProject.id, row);
//       // console.log("row",row, fileName);
//       await handleFileDelete(row, fileName);
//     }
//     setSelectedRows([]);
//     setSelectedProject(null);
//     // navigate(-1);
//   };

//   const columns = [
//     { id: "slNo", label: "Sl. No", minWidth: 50 },
//     { id: "name", label: "File Name", minWidth: 170 },
//     { id: "pageCount", label: "Page Count", minWidth: 100 },
//     { id: "uploadedDate", label: "Uploaded At", minWidth: 170 },
//     { id: "edit", label: "Actions", minWidth: 100 },
//   ];

//   const handleChangePage = (event, newPage) => {
//     setPage(newPage);
//   };

//   const handleChangeRowsPerPage = (event) => {
//     setRowsPerPage(+event.target.value);
//     setPage(0);
//   };

//   const handleBack = () => {
//     // navigate('/home'); // This will navigate to the previous page
//     setSelectedProject(null);
//   };

//   return (
//     <div className="flex flex-col items-center h-screen overflow-y-auto">
//       <div className="p-4 w-full">
//         {isLoading && <div className="flex items-center justify-center h-screen">
//           <Loader />
//         </div>}
//         {error && <p>Error: {error.message}</p>}
//         {!isLoading && !error && !selectedProject && (
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
//             {projects.map((project) => (
//               <div
//                 key={project.id}
//                 className="flex flex-col items-center p-3 rounded-xl hover:backdrop-blur-sm hover:bg-white/30 hover:border hover:border-white/40 hover:shadow-lg hover:shadow-xl transition-all duration-300"
//               >
//                 <div
//                   className=" cursor-pointer"
//                   onClick={() => handleProjectClick(project)}
//                 >
//                   <FolderIcon
//                     color="info"
//                     sx={{ fontSize: 130 }}
//                     className="transform group-hover:scale-110 transition-transform duration-300 ease-in-out"
//                   />
//                   <h3 className="mt-3 text-lg font-medium text-gray-800 text-center break-words max-w-[200px]">
//                     {project.name}
//                   </h3>
//                 </div>
//                 {fileCounts[project.id] === 0 ? (
//                   <Fab
//                     color="secondary"
//                     size="small"
//                     sx={{ position: "absolute", top: -10, right: -10 }}
//                     onClick={() => {
//                       setEditProjectName(project.name);
//                       setEditProjectId(project.id);
//                       setIsEditModalOpen(true);
//                     }}
//                   >
//                     <EditIcon />
//                   </Fab>
//                 ) : (
//                   <></>
//                 )}
//               </div>
//             ))}
//           </div>
//         )}
//         {!isLoading && !error && selectedProject && (
//           <div className="w-full">
//             <h2 className="text-2xl font-semibold mb-4">
//               {selectedProject.name}
//             </h2>

//             <div>
//               <input
//                 type="file"
//                 multiple
//                 accept="application/pdf"
//                 id="file-upload"
//                 style={{ display: "none" }}
//                 onChange={handleFileUpload}
//               />
//               <Button
//                 variant="contained"
//                 color="primary"
//                 onClick={() => document.getElementById("file-upload").click()}
//                 sx={{ mb: 2 }}
//               >
//                 Upload Files
//               </Button>
//             </div>

//             {isLoading && <CircularProgress />}
//             {error && <p>Error: {error.message}</p>}
//             {!isLoading && !error && files.length === 0 && (
//               <p>No files found.</p>
//             )}
//             {!isLoading && !error && files.length > 0 && (
//               <TableUpload
//                 columns={columns}
//                 rows={files.map((file, index) => ({
//                   ...file,
//                   slNo: index + 1,
//                 }))}
//                 page={page}
//                 rowsPerPage={rowsPerPage}
//                 handleChangePage={handleChangePage}
//                 handleChangeRowsPerPage={handleChangeRowsPerPage}
//                 selectedRows={selectedRows}
//                 setSelectedRows={setSelectedRows}
//                 handleEditClick={handleFileDelete}
//                 handleDeleteSelected={handleDeleteSelected}
//                 projectName={selectedProject.name}
//               />
//             )}

//             <div className="absolute top-2 left-200">
//               <IconButton
//                 onClick={handleBack}
//                 sx={{
//                   backgroundColor: "primary.main",
//                   color: "white",
//                   "&:hover": {
//                     backgroundColor: "primary.dark",
//                   },
//                   padding: "10px",
//                   boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.2)",
//                 }}
//               >
//                 <ArrowBackIcon sx={{ fontSize: 30 }} />
//               </IconButton>
//             </div>
//             {/* <Button
//               onClick={handleBack}
//               variant="contained"
//               color="primary"
//               size="large"
//               sx={{
//                 position: "fixed",
//                 bottom: 25,
//                 left: 16,
//                 width: "100px",
//                 height: "55px",
//                 fontSize: "18px",
//               }}
//             ><ArrowBackIcon sx={{ marginRight: "3px" }} />
//               Back
//             </Button> */}
//           </div>
//         )}

//         {!selectedProject && (
//           <Fab
//             variant="extended"
//             color="primary"
//             size="large"
//             sx={{
//               position: "fixed",
//               bottom: 40,
//               right: 16,
//               width: "220px",
//               height: "75px",
//               fontSize: "18px",
//             }}
//             onClick={() => setIsModalOpen(true)}
//           >
//             <AddIcon sx={{ mr: 1 }} />
//             New Project
//           </Fab>
//         )}

//         {/* Create Project Modal */}
//         {isModalOpen && (
//           <Dialog
//             className="relative z-10"
//             open={isModalOpen}
//             onClose={() => setIsModalOpen(false)}
//           >
//             <DialogBackdrop className="fixed inset-0 bg-gray-500 bg-opacity-75" />
//             <Toaster position="top-center" reverseOrder={false} />
//             <div className="fixed inset-0 z-10 overflow-y-auto">
//               <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
//                 <DialogPanel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
//                   <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
//                     <DialogTitle
//                       as="h3"
//                       className="text-base font-semibold leading-6 text-gray-900"
//                     >
//                       Create New Project
//                     </DialogTitle>
//                     <div className="mt-2">
//                       <input
//                         type="text"
//                         className="mt-4 p-4 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//                         placeholder="New Project Name"
//                         value={newProjectName}
//                         onChange={(e) => setNewProjectName(e.target.value)}
//                       />
//                     </div>
//                   </div>
//                   <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
//                     <button
//                       type="button"
//                       className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
//                       onClick={newProject}
//                     >
//                       Create
//                     </button>
//                     <button
//                       type="button"
//                       className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
//                       onClick={() => setIsModalOpen(false)}
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 </DialogPanel>
//               </div>
//             </div>
//           </Dialog>
//         )}

//         {/* Edit & Delete Project Modal */}
//         {isEditModalOpen && (
//           <Dialog
//             className="relative z-10"
//             open={isEditModalOpen}
//             onClose={() => setIsEditModalOpen(false)}
//           >
//             <DialogBackdrop className="fixed inset-0 bg-gray-500 bg-opacity-75" />
//             <Toaster position="top-center" reverseOrder={false} />
//             <div className="fixed inset-0 z-10 overflow-y-auto">
//               <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
//                 <DialogPanel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
//                   <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
//                     <DialogTitle
//                       as="h3"
//                       className="text-base font-semibold leading-6 text-gray-900"
//                     >
//                       Edit Project Name
//                     </DialogTitle>
//                     <div className="mt-2">
//                       <input
//                         type="text"
//                         className="mt-4 p-4 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//                         placeholder="New Project Name"
//                         value={editProjectName}
//                         onChange={(e) => setEditProjectName(e.target.value)}
//                       />
//                     </div>
//                   </div>
//                   <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
//                     <button
//                       type="button"
//                       className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
//                       onClick={deleteProject}
//                     >
//                       Delete
//                     </button>
//                     <button
//                       type="button"
//                       className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:ml-3 sm:w-auto"
//                       onClick={editProject}
//                     >
//                       Save
//                     </button>
//                     <button
//                       type="button"
//                       className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
//                       onClick={() => setIsEditModalOpen(false)}
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 </DialogPanel>
//               </div>
//             </div>
//           </Dialog>
//         )}
//       </div>
//     </div>
//   );
// };

// export default UploadDocument;
import React, { useState, useEffect } from "react";
import axios from "axios";
import UploadFolderView from "./UploadFolderView";
import { Fab } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useParams } from "react-router-dom";
import { server } from "../../main";
import Loader from "../common/Loader";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { toast, Toaster } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import FolderIcon from "@mui/icons-material/Folder";
import { GridIcon, ListIcon } from "lucide-react";

const UploadDocument = () => {
  const { companyId } = useParams();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const { currentUser } = useAuth();
  const [isGridView, setIsGridView] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${server}/api/project/${companyId}/getprojects`
        );
        setProjects(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, [companyId]);

  const handleProjectClick = (project) => {
    setSelectedProject(project);
  };

  const handleBack = () => {
    setSelectedProject(null);
  };

  const newProject = async () => {
    try {
      const response = await axios.post(
        `${server}/api/project/createProject`,
        {
          name: newProjectName,
          companyId,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setProjects([...projects, response.data]);
      setIsModalOpen(false);
      setNewProjectName("");
      toast.success("Project created successfully!");
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to create project. Try again.";
      toast.error(message);
    }
  };

  return (
    <div className="h-screen overflow-y-auto backdrop-blur-sm bg-white/30">
      <div className="max-w-[80vw] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading && <Loader />}
        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <p className="text-sm text-red-700">Error: {error.message}</p>
          </div>
        )}

        {!selectedProject && (
          <>
            {/* View toggle buttons */}
            {projects.length > 0 && (
              <div className="flex justify-end gap-2 mb-4">
                <button
                  onClick={() => setIsGridView(true)}
                  className={`p-2 rounded-lg ${
                    isGridView
                      ? "bg-indigo-100 text-indigo-600"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <GridIcon size={20} />
                </button>
                <button
                  onClick={() => setIsGridView(false)}
                  className={`p-2 rounded-lg ${
                    !isGridView
                      ? "bg-indigo-100 text-indigo-600"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <ListIcon size={20} />
                </button>
              </div>
            )}

            <div
              className={`mt-10 ${
                isGridView
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "flex flex-col gap-4 max-w-6xl mx-auto"
              }`}
            >
              {projects.map((project) => (
                <div
                  key={project.id}
                  className={`backdrop-blur-md bg-indigo-200/30 rounded-lg border border-white/40 shadow-sm 
                    hover:bg-indigo-100/20 hover:border-blue-500 hover:shadow-md transition-all duration-200 
                    cursor-pointer group`}
                >
                  <div className={`p-6 ${!isGridView && "flex items-center"}`}>
                    <div
                      className={`flex ${
                        isGridView ? "items-center" : "items-center"
                      } space-x-4`}
                      onClick={() => handleProjectClick(project)}
                    >
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 rounded-lg bg-white/40 flex items-center justify-center group-hover:bg-blue-100/50 transition-colors duration-200">
                          <FolderIcon
                            sx={{
                              fontSize: 28,
                              color: "rgb(59 130 246)",
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {project.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Fab
              variant="extended"
              color="primary"
              size="large"
              sx={{
                position: "fixed",
                bottom: "24px",
                right: "24px",
                zIndex: 1000,
                width: "auto",
                height: "56px",
                paddingLeft: "24px",
                paddingRight: "24px",
                fontSize: "16px",
                boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 12px 20px rgba(0,0,0,0.15)",
                },
                transition: "all 0.2s ease-in-out",
              }}
              onClick={() => setIsModalOpen(true)}
            >
              <AddIcon sx={{ mr: 1 }} />
              New Project
            </Fab>
          </>
        )}

        {selectedProject && (
          <UploadFolderView project={selectedProject} onBack={handleBack} />
        )}

        {/* Create Project Modal */}
        {isModalOpen && (
          <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <DialogBackdrop className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            <Toaster position="top-center" />
            <div className="fixed inset-0 flex items-center justify-center">
              <DialogPanel className="backdrop-blur-md bg-white/90 rounded-xl shadow-xl p-6 w-full max-w-md mx-4 transform transition-all">
                <DialogTitle className="text-lg font-semibold text-gray-900 mb-4">
                  Create New Project
                </DialogTitle>
                <div className="space-y-4">
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                    placeholder="Enter project name"
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                  />
                  <div className="flex justify-end space-x-3">
                    <button
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      onClick={() => setIsModalOpen(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                      onClick={newProject}
                    >
                      Create
                    </button>
                  </div>
                </div>
              </DialogPanel>
            </div>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default UploadDocument;
