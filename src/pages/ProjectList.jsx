import { useState, useEffect } from "react";
import axios from "axios";
import { server } from "../main";
import { useParams, useSearchParams } from "react-router-dom";
import Loader from "../components/common/Loader";
import NotificationBadge from "../components/common/NotificationBadge";
import FolderIcon from "@mui/icons-material/Folder";
import FolderView from "../components/common/FolderView";
import { useAuth } from "../context/AuthContext";
import { kyroCompanyId } from "../services/companyServices";
import { fetchProjectsWithNotifications } from "../services/projectServices";
import { getQuarter } from "date-fns";
import { GridIcon, ListIcon, Search, XCircle } from "lucide-react";
import useDebounce from "../hooks/useDebounce";

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
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 250);
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
        // Use the new function that includes notification counts
        const projectsWithNotifications = await fetchProjectsWithNotifications(
          companyId
        );
        setProjects(projectsWithNotifications);
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

  const displayedProjects = projects.filter((project) => {
    if (!debouncedSearch) return true;
    const q = debouncedSearch.trim().toLowerCase();
    return (project?.name || "").toLowerCase().includes(q);
  });

  const sortedProjects = [...displayedProjects].sort((a, b) => {
    const aCount = typeof a?.notificationCount === "number" ? a.notificationCount : 0;
    const bCount = typeof b?.notificationCount === "number" ? b.notificationCount : 0;
    return bCount - aCount;
  });

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
            {/* Search + View toggle */}
            <div className="flex flex-col justify-between sm:flex-row sm:items-center gap-3 mb-4">
              <div className="relative flex-1 max-w-2xl mt-6">
                <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search projects by name..."
                  aria-label="Search projects"
                  className="block w-full pl-10 pr-3 py-2 border border-[#02bbcc] rounded-3xl leading-5 backdrop-blur-sm shadow-md bg-white/30 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"

                  // className="w-full pl-10 pr-10 py-2 rounded-lg border border-white/60 bg-white/70 backdrop-blur-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 placeholder:text-gray-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setSearchQuery("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <XCircle size={18} />
                  </button>
                )}
              </div>

              {projects.length > 0 && (
                <div className="flex justify-end gap-2">
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
            </div>

            <div
              className={`mt-10 ${
                isGridView
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "flex flex-col gap-4 max-w-6xl mx-auto"
              }`}
            >
              {sortedProjects.map((project) => (
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
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {project.name}
                          </h3>
                          <NotificationBadge
                            count={project.notificationCount}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {projects.length > 0 && displayedProjects.length === 0 && (
                <div className="col-span-full text-center text-gray-500 py-8">
                  No projects match your search.
                </div>
              )}
            </div>
          </>
        )}

        {selectedProject && (
          <FolderView
            project={selectedProject}
            onBack={handleBack}
            superAdminCompanyId={superAdminCompanyId}
          />
        )}
      </div>
    </div>
  );
}

export default ProjectList;
