// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { server } from "../main";
// import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
// import Fab from '@mui/material/Fab';
// import AddIcon from '@mui/icons-material/Add';
// import { Link, useParams } from 'react-router-dom';
// import FolderIcon from '@mui/icons-material/Folder';
// import { toast, Toaster } from "react-hot-toast";

// const ProjectList = () => {
//   const { companyId } = useParams();
//   const [projects, setProjects] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [newProjectName, setNewProjectName] = useState('');
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   const newProject = async (e) => {
//     try {
//       const response = await axios.post(`${server}/api/project/createProject`, {
//         name: newProjectName,
//         companyId,
//       }, {
//         headers: {
//           'Content-Type': 'application/json',
//         }
//       });
//       setProjects([...projects, response.data]);
//       setIsModalOpen(false);
//     } catch (err) {
//       let message = "Refresh your Browser & Try Again";

//       // Check for backend error messages
//       if (err.response && err.response.data) {
//         // console.log(err.response.data.message)
//         message = err.response.data.message || message;
//       } else {
//         message = err.message || message;
//       }
//       toast.error(message);
//       console.error('Error creating project:', err);
//     }
//   };

//   useEffect(() => {
//     const fetchProjects = async () => {
//       setIsLoading(true);
//       try {
//         const response = await axios.get(`${server}/api/project/${companyId}/getprojects`);
//         setProjects(response.data);
//       } catch (err) {
//         setError(err);
//       } finally {
//         setIsLoading(false);
//       }
//     };
//     fetchProjects();
//   }, [companyId]);

//   return (
//     <div className='flex'>
//       <div className="flex justify-center items-center p-20">
//         {isLoading && <p>Loading projects...</p>}
//         {error && <p>Error fetching projects: {error.message}</p>}
//         {!isLoading && !error && (
//           <div className="flex flex-wrap gap-16">
//             {projects.map((project) => (
//               <Link to={`/company/${companyId}/project/${project.id}`} key={project.id}>
//                 <FolderIcon color="info" sx={{ fontSize: 130 }} className='hover:text-sky-500 hover:scale-110 ease-in duration-1000' />
//                 <div className="text-center ">
//                   {project.name}
//                 </div>
//               </Link>
//             ))}
//           </div>
//         )}
//         <Fab
//           variant="extended"
//           color="primary"
//           size="large"
//           sx={{ position: 'fixed', bottom: 40, right: 16, width: '220px', height: '75px', fontSize: '18px' }}
//           onClick={() => setIsModalOpen(true)}
//         >
//           <AddIcon sx={{ mr: 1 }} />
//           New Project
//         </Fab>

//         {isModalOpen && (
//           <Dialog className="relative z-10" open={isModalOpen} onClose={() => setIsModalOpen(false)}>
//             <DialogBackdrop
//               transition
//               className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
//             />
//             <Toaster
//               position="top-center"
//               reverseOrder={false}
//             />
//             <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
//               <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
//                 <DialogPanel
//                   transition
//                   className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
//                 >
//                   <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
//                     <div className="sm:flex sm:items-start">
//                       <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
//                         <DialogTitle as="h3" className="text-base font-semibold leading-6 text-gray-900">
//                           Create New Project
//                         </DialogTitle>
//                         <div className="mt-2">
//                           <input
//                             type="text"
//                             className="mt-4 p-4 block rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
//                             placeholder="New Project Name"
//                             value={newProjectName}
//                             onChange={(e) => setNewProjectName(e.target.value)}
//                           />
//                         </div>
//                       </div>
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
//                       data-autofocus
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

// export default ProjectList;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { server } from "../main";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { Link, useParams } from "react-router-dom";
import FolderIcon from "@mui/icons-material/Folder";
import { toast, Toaster } from "react-hot-toast";
import { fetchTotalProjectFilesCount } from "../services/projectServices";

const ProjectList = () => {
  const { companyId } = useParams();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newProjectName, setNewProjectName] = useState("");
  const [editProjectName, setEditProjectName] = useState("");
  const [editProjectId, setEditProjectId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [fileCounts, setFileCounts] = useState({});

  useEffect(() => {
    const fetchCounts = async () => {
      const counts = {};
      for (const project of projects) {
        const count = await fetchTotalProjectFilesCount(project.id);
        counts[project.id] = count;
      }
      setFileCounts(counts);
    };

    fetchCounts();
  }, [projects]);

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
    } catch (err) {
      let message = "Refresh your Browser & Try Again";
      if (err.response && err.response.data) {
        message = err.response.data.message || message;
      } else {
        message = err.message || message;
      }
      toast.error(message);
      console.error("Error creating project:", err);
    }
  };

  const editProject = async () => {
    try {
      const response = await axios.put(
        `${server}/api/project/editProject`,
        {
          id: editProjectId,
          newName: editProjectName,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setProjects(
        projects.map((project) =>
          project.id === editProjectId
            ? { ...project, name: editProjectName }
            : project
        )
      );
      // console.log("Id", editProjectId);

      setIsEditModalOpen(false);
      setEditProjectName("");
      setEditProjectId("");
      toast.success(response.data.message);
    } catch (err) {
      let message = "Refresh your Browser & Try Again";
      if (err.response && err.response.data) {
        message = err.response.data.message || message;
      } else {
        message = err.message || message;
      }
      toast.error(message);
      console.error("Error editing project:", err);
    }
  };

  const deleteProject = async () => {
    console.log("Id", editProjectId);

    try {
      const response = await axios.delete(
        `${server}/api/project/deleteProject`,
        {
          data: { id: editProjectId },
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      setIsEditModalOpen(false);
      setEditProjectId("");
      toast.success(response.data);
    } catch (err) {
      let message = "Refresh your Browser & Try Again";
      if (err.response && err.response.data) {
        message = err.response.data.message || message;
      } else {
        message = err.message || message;
      }
      toast.error(message);
      console.error("Error editing project:", err);
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${server}/api/project/${companyId}/getprojects`
        );
        setProjects(response.data);

        // console.log(fileCount)
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, [companyId]);

  return (
    <div className="flex flex-col items-center p-10">
      {isLoading && <p>Loading projects...</p>}
      {error && <p>Error fetching projects: {error.message}</p>}
      {!isLoading && !error && (
        <div className="flex flex-wrap gap-20">
          {projects.map((project) => (
            <div
              key={project.id}
              className="relative flex flex-col items-center"
            >
              {/* {fetchTotalProjectFilesCount(project.id)} */}

              <Link
                to={`/company/${companyId}/project/${project.id}`}
                className="flex flex-col items-center"
              >
                <FolderIcon
                  color="info"
                  sx={{ fontSize: 130 }}
                  className="hover:text-sky-500 hover:scale-110 transition ease-in duration-300"
                />
                <div className="text-center text-lg font-medium mt-2">
                  {project.name}
                </div>
              </Link>
              {fileCounts[project.id] === 0 ? (
                <Fab
                  color="secondary"
                  size="small"
                  sx={{ position: "absolute", top: -10, right: -10 }}
                  onClick={() => {
                    setEditProjectName(project.name);
                    setEditProjectId(project.id);
                    setIsEditModalOpen(true);
                  }}
                >
                  <EditIcon />
                </Fab>
              ) : (
                <></>
              )}
            </div>
          ))}
        </div>
      )}

      <Fab
        variant="extended"
        color="primary"
        size="large"
        sx={{
          position: "fixed",
          bottom: 40,
          right: 16,
          width: "220px",
          height: "75px",
          fontSize: "18px",
        }}
        onClick={() => setIsModalOpen(true)}
      >
        <AddIcon sx={{ mr: 1 }} />
        New Project
      </Fab>

      {/* Create Project Modal */}
      {isModalOpen && (
        <Dialog
          className="relative z-10"
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        >
          <DialogBackdrop className="fixed inset-0 bg-gray-500 bg-opacity-75" />
          <Toaster position="top-center" reverseOrder={false} />
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <DialogPanel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <DialogTitle
                    as="h3"
                    className="text-base font-semibold leading-6 text-gray-900"
                  >
                    Create New Project
                  </DialogTitle>
                  <div className="mt-2">
                    <input
                      type="text"
                      className="mt-4 p-4 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      placeholder="New Project Name"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                    onClick={newProject}
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </DialogPanel>
            </div>
          </div>
        </Dialog>
      )}

      {/* Edit Project Modal */}
      {isEditModalOpen && (
        <Dialog
          className="relative z-10"
          open={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
        >
          <DialogBackdrop className="fixed inset-0 bg-gray-500 bg-opacity-75" />
          <Toaster position="top-center" reverseOrder={false} />
          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <DialogPanel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                  <DialogTitle
                    as="h3"
                    className="text-base font-semibold leading-6 text-gray-900"
                  >
                    Edit Project Name
                  </DialogTitle>
                  <div className="mt-2">
                    <input
                      type="text"
                      className="mt-4 p-4 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      placeholder="New Project Name"
                      value={editProjectName}
                      onChange={(e) => setEditProjectName(e.target.value)}
                    />
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
                    onClick={deleteProject}
                  >
                    Delete
                  </button>
                  <button
                    type="button"
                    className="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:ml-3 sm:w-auto"
                    onClick={editProject}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                    onClick={() => setIsEditModalOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </DialogPanel>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
};

export default ProjectList;
