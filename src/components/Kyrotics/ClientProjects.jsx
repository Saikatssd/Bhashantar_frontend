import { useState, useEffect } from 'react'
import axios from 'axios'
import { server } from '../../main'
import { Link, useParams } from 'react-router-dom'
import FolderIcon from '@mui/icons-material/Folder'
import Loader from '../common/Loader'

const Loader2 = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <Loader/>
  </div>
)

function ClientProjects() {
  const { companyId } = useParams()
  const [projects, setProjects] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true)
      try {
        const response = await axios.get(
          `${server}/api/project/${companyId}/getprojects`
        )
        setProjects(response.data)
      } catch (err) {
        setError(err)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProjects()
  }, [companyId])

  return (
    <div className="min-h-screen">
      {isLoading && <Loader2 />}
      
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="text-center text-red-600 p-4 rounded-lg bg-red-50">
            Error fetching projects: {error.message}
          </div>
        )}
        
        {!isLoading && !error && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {projects.map((project) => (
              <Link
                to={`/kyro/${companyId}/project/${project.id}`}
                key={project.id}
                className="group"
              >
               <div className="flex flex-col items-center p-6 rounded-xl hover:backdrop-blur-sm hover:bg-white/30 hover:border hover:border-white/40 hover:shadow-lg hover:shadow-xl transition-all duration-300">
                  <FolderIcon
                    color="info"
                    sx={{ fontSize: 130 }}
                    className="transform group-hover:scale-110 transition-transform duration-300 ease-in-out"
                  />
                  <h3 className="mt-3 text-lg font-medium text-gray-800 text-center break-words max-w-[200px]">
                    {project.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ClientProjects