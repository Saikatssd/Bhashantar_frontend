import React, { useState, useEffect } from "react";
import axios from "axios";
import { server } from "../../main";

import { Link, useParams } from "react-router-dom";
import FolderIcon from "@mui/icons-material/Folder";

const ClientProjects = () => {
  const { companyId } = useParams();
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

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

  return (
    <div className="flex">
      <div className="flex justify-center items-center p-20">
        {isLoading && <p>Loading projects...</p>}
        {error && <p>Error fetching projects: {error.message}</p>}
        {!isLoading && !error && (
          <div className="flex flex-wrap gap-20">
            {projects.map((project) => (
              <div
                key={project.id}
                className="relative flex flex-col items-center"
              >
                <Link
                  to={`/kyro/${companyId}/project/${project.id}`}
                  key={project.id}
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
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientProjects;
