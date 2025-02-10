//import { useState, useEffect } from 'react'
// import axios from 'axios'
// import { server } from '../main'
// import { Link, useParams } from 'react-router-dom'
// import FolderIcon from '@mui/icons-material/Folder'
// import Loader from '../components/common/Loader'

// const Loader2 = () => (
//   <div className="fixed inset-0 flex items-center justify-center">
//     <Loader />
//   </div>
// )

// function ProjectList() {
//   const { companyId } = useParams()
//   const [projects, setProjects] = useState([])
//   const [isLoading, setIsLoading] = useState(false)
//   const [error, setError] = useState(null)

//   useEffect(() => {
//     const fetchProjects = async () => {
//       setIsLoading(true)
//       try {
//         const response = await axios.get(
//           `${server}/api/project/${companyId}/getprojects`
//         )
//         setProjects(response.data)
//       } catch (err) {
//         setError(err)
//       } finally {
//         setIsLoading(false)
//       }
//     }
//     fetchProjects()
//   }, [companyId])

//   return (
//     <div className="h-screen overflow-y-auto">
//       {isLoading && <Loader2 />}

//       <div className="container mx-auto px-4 py-8">
//         {error && (
//           <div className="text-center text-red-600 p-4 rounded-lg bg-red-50">
//             Error fetching projects: {error.message}
//           </div>
//         )}

//         {!isLoading && !error && (
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
//             {projects.map((project) => (
//               <Link
//                 to={`/company/${companyId}/project/${project.id}`}
//                 className="flex flex-col items-center"
//               >
//                 <div className="flex flex-col items-center p-5 rounded-xl hover:backdrop-blur-sm hover:bg-white/30 hover:border hover:border-white/40 hover:shadow-lg hover:shadow-xl transition-all duration-300">
//                   <FolderIcon
//                     color="info"
//                     sx={{ fontSize: 130 }}
//                     className="transform group-hover:scale-110 transition-transform duration-300 ease-in-out"
//                   />
//                   <h3 className="mt-3 text-lg font-medium text-gray-800 text-center break-words max-w-[200px]">
//                     {project.name}
//                   </h3>
//                 </div>
//               </Link>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

// export default ProjectList

import { useState, useEffect } from "react";
import axios from "axios";
import { server } from "../main";
import { useParams, useSearchParams } from "react-router-dom";
import Loader from "../components/common/Loader";
import FolderIcon from "@mui/icons-material/Folder";
import FolderView from "../components/common/FolderView";
import { useAuth } from "../context/AuthContext";
import { kyroCompanyId } from "../services/companyServices";
import { getQuarter } from "date-fns";
import { GridIcon, ListIcon } from "lucide-react";

const Loader2 = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <Loader />
  </div>
);

function ProjectList() {
  const { companyId } = useParams();
  const [searchParams] = useSearchParams();
  const superAdminCompanyId = searchParams.get("superAdminCompanyId");
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const { currentUser } = useAuth();
  const [kyroId, setKyroId] = useState("");
  const [isGridView, setIsGridView] = useState(true);
  // console.log("superAdminCompanyId", superAdminCompanyId);
  useEffect(() => {
    const getKyroId = async () => {
      const id = await kyroCompanyId();

      setKyroId(id);
    };
    getKyroId();
  }, [currentUser]);

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

  return (
    <div className="h-screen overflow-y-auto backdrop-blur-sm bg-white/30">
      <div className="max-w-[80vw] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {isLoading && <Loader2 />}
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
                  onClick={() => handleProjectClick(project)}
                >
                  <div className={`p-6 ${!isGridView && "flex items-center"}`}>
                    <div
                      className={`flex ${
                        isGridView ? "items-start" : "items-center"
                      } ${!isGridView && "w-full"} space-x-4`}
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
          </>
        )}

        {selectedProject && (
          <FolderView project={selectedProject} onBack={handleBack} superAdminCompanyId={superAdminCompanyId}/>
        )}
      </div>
    </div>
  );
}

export default ProjectList;
