import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { server } from "../../main";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import { Link, useParams, Route, Routes } from 'react-router-dom';
import FolderIcon from '@mui/icons-material/Folder';


const ClientProjects = () => {
  const { companyId } = useParams();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
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
  //       console.error('Error creating project:', err);
  //     }
  //   };

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
              <Link to={`/kyro/${companyId}/project/${project.id}`} key={project.id}>
                {/* <div
                  className="folder p-6 max-w-sm bg-[#90ebf5] rounded-t-lg border-t-8 border-[#03518a] shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="folder-tab bg-[#03518a] p-2 rounded-t-lg"></div>
                  <div className="p-4 text-center">
                    {project.name}
                  </div>
                </div> */}
                <FolderIcon color="info" sx={{ fontSize: 130 }} className='hover:text-sky-500 hover:scale-110 ease-in duration-1000' />
                <div className="p-1 text-center">
                  {project.name}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientProjects;
