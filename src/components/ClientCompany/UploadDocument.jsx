import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import { Fab, IconButton } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { auth } from '../../utils/firebase';
import {fetchProjectFiles} from '../../services/projectServices'
import { uploadFile,  deleteFile } from '../../services/fileServices';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { server } from '../../main';
import { toast, Toaster } from "react-hot-toast";
import EditIcon from "@mui/icons-material/Edit";

import TableUpload from '../Table/TableUpload';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FolderIcon from '@mui/icons-material/Folder';
import { fetchTotalProjectFilesCount } from '../../services/projectServices';


const UploadDocument = () => {
  const { companyId } = useParams();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [files, setFiles] = useState([]);
  const [role, setRole] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { currentUser } = useAuth();
  const [selectedRows, setSelectedRows] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editProjectName, setEditProjectName] = useState("");
  const [editProjectId, setEditProjectId] = useState("");
  const [fileCounts, setFileCounts] = useState({});

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${server}/api/project/${companyId}/getprojects`);
        setProjects(response.data);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, [companyId]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const token = await user.getIdTokenResult();
        // console.log(token)
        user.roleName = token.claims.roleName;
        user.companyId = token.claims.companyId;

        setRole(user.roleName);

      }
    });
    return () => unsubscribe();
  }, []);

  //For the delete and option of the project
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
      // console.log(response.data.message)
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
    // console.log("Id", editProjectId);

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
      setProjects(projects.filter((project) => project.id !== editProjectId));
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

  const handleProjectClick = async (project) => {
    setSelectedProject(project);
    setIsLoading(true);
    try {
      const projectFiles = await fetchProjectFiles(project.id);
      const filteredFiles = projectFiles.filter(file => file.status === 0); // Filter files by status === 0
      setFiles(filteredFiles);
    } catch (err) {
      console.error('Error fetching project files:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const uploadedFiles = Array.from(e.target.files).filter(file => file.type === 'application/pdf');
    try {
      setIsLoading(true);
      const uploadPromises = uploadedFiles.map(file => uploadFile(selectedProject.id, file));
      const uploadedFilesData = await Promise.all(uploadPromises);
      setFiles([...files, ...uploadedFilesData]);
      setIsLoading(false);
    } catch (err) {
      console.error('Error uploading files:', err);
      setError(err);
      setIsLoading(false);
    }
  };

  const handleFileDelete = async (fileId, fileName) => {
    try {
      setIsLoading(true);
      await deleteFile(selectedProject.id, fileId, fileName);
      setFiles(files.filter(file => file.id !== fileId));
      setIsLoading(false);
    } catch (err) {
      console.error('Error deleting file:', err);
      setError(err);
      setIsLoading(false);
    }
  };

  const handleDeleteSelected = async () => {
    for (const row of selectedRows) {
      await handleFileDelete(row.id, row.name);
    }
    setSelectedRows([]);
    navigate(1);

  };

  const columns = [
    { id: 'slNo', label: 'Sl. No', minWidth: 50 },
    { id: 'name', label: 'File Name', minWidth: 170 },
    { id: 'pageCount', label: 'Page Count', minWidth: 100 },
    { id: 'uploadedDate', label: 'Uploaded At', minWidth: 170 },
    { id: 'edit', label: 'Actions', minWidth: 100 },
  ];

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const handleBack = () => {
    // navigate('/home'); // This will navigate to the previous page
    setSelectedProject(null);
  };

  return (
    <div className='flex flex-col items-center'>
      <div className="p-20 w-full">
        {isLoading && <p>Loading...</p>}
        {error && <p>Error: {error.message}</p>}
        {!isLoading && !error && !selectedProject && (
          <div className="flex flex-wrap gap-20 p-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="relative flex flex-col items-center"
              >
                <div


                  className=" cursor-pointer"
                  onClick={() => handleProjectClick(project)}
                >

                  <FolderIcon color="info" sx={{ fontSize: 130 }} className='hover:text-sky-500 hover:scale-110 ease-in duration-1000' />
                  <div className="p-1 text-center">
                    {project.name}
                  </div>
                </div>
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
        {!isLoading && !error && selectedProject && (
          <div className="w-full">
            <h2 className="text-2xl font-semibold mb-4">{selectedProject.name}</h2>

            <div>
              <input
                type="file"
                multiple
                accept="application/pdf"
                id="file-upload"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={() => document.getElementById('file-upload').click()}
                sx={{ mb: 2 }}
              >
                Upload Files
              </Button>
            </div>

            {isLoading && <CircularProgress />}
            {error && <p>Error: {error.message}</p>}
            {!isLoading && !error && files.length === 0 && <p>No files found.</p>}
            {!isLoading && !error && files.length > 0 && (
              <TableUpload
                columns={columns}
                rows={files.map((file, index) => ({ ...file, slNo: index + 1 }))}
                page={page}
                rowsPerPage={rowsPerPage}
                handleChangePage={handleChangePage}
                handleChangeRowsPerPage={handleChangeRowsPerPage}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
                handleEditClick={handleFileDelete}
                handleDeleteSelected={handleDeleteSelected}
                projectName={selectedProject.name}
              />
            )}

            <div className="absolute top-2 left-200">
              <IconButton
                onClick={handleBack}
                sx={{
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                  padding: '10px',
                  boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)',
                }}
              >
                <ArrowBackIcon sx={{ fontSize: 30 }} />
              </IconButton>
            </div>
            {/* <Button
              onClick={handleBack}
              variant="contained"
              color="primary"
              size="large"
              sx={{
                position: "fixed",
                bottom: 25,
                left: 16,
                width: "100px",
                height: "55px",
                fontSize: "18px",
              }}
            ><ArrowBackIcon sx={{ marginRight: "3px" }} />
              Back
            </Button> */}
          </div>
        )}


        {!selectedProject && (<Fab
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
        </Fab>)}

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



        {/* Edit & Delete Project Modal */}
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
    </div>
  );
};

export default UploadDocument;


