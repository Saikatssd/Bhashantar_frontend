import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { server } from "../main";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import { Link, useParams } from 'react-router-dom';
import FolderIcon from '@mui/icons-material/Folder';

const ProjectList = () => {
  const { companyId } = useParams();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const newProject = async (e) => {
    try {
      const response = await axios.post(`${server}/api/project/createProject`, {
        name: newProjectName,
        companyId,
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });
      setProjects([...projects, response.data]);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error creating project:', err);
    }
  };

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

  return (
    <div className='flex'>
      <div className="flex justify-center items-center p-20">
        {isLoading && <p>Loading projects...</p>}
        {error && <p>Error fetching projects: {error.message}</p>}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 gap-20 md:grid-cols-4 p-4">
            {projects.map((project) => (
              <Link to={`/company/${companyId}/project/${project.id}`} key={project.id}>
                <FolderIcon color="info" sx={{ fontSize: 130 }} className='hover:text-sky-500 hover:scale-110 ease-in duration-1000' />
                {/* <div
                    className="folder p-6 max-w-sm bg-[#90ebf5] rounded-t-lg border-t-8 border-[#03518a] shadow-md hover:shadow-lg transition-shadow duration-300"
                  > */}
                {/* <div className="folder-tab bg-[#03518a] p-2 rounded-t-lg"></div> */}
                {/* </div> */}
                
                <div className="p-1 text-center ">
                  {project.name}
                </div>
              </Link>
            ))}
          </div>
        )}
        <Fab
          variant="extended"
          color="primary"
          size="large"
          sx={{ position: 'fixed', bottom: 40, right: 16, width: '220px', height: '75px', fontSize: '18px' }}
          onClick={() => setIsModalOpen(true)}
        >
          <AddIcon sx={{ mr: 1 }} />
          New Project
        </Fab>

        {isModalOpen && (
          <Dialog className="relative z-10" open={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <DialogBackdrop
              transition
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            />
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
              <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                <DialogPanel
                  transition
                  className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
                >
                  <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className="sm:flex sm:items-start">
                      <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                        <DialogTitle as="h3" className="text-base font-semibold leading-6 text-gray-900">
                          Create New Project
                        </DialogTitle>
                        <div className="mt-2">
                          <input
                            type="text"
                            className="mt-4 p-4 block rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            placeholder="New Project Name"
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                          />
                        </div>
                      </div>
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
                      data-autofocus
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

export default ProjectList;
