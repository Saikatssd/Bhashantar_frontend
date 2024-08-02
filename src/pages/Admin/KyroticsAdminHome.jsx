// import React from 'react'
// import KyroSidebar from '../../components/Kyrotics/KyroSidebar'

// export default function KyroticsAdminHome({companyId}) {
//     return (
//         <div className="flex">
//             <KyroSidebar companyId={companyId} role={'admin'} />
//             <div className="flex-1 p-4">
//                 <h1 className="text-2xl font-bold">Admin Home for Company: {companyId}</h1>
//             </div>
//         </div>
//     )
// }

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import KyroSidebar from '../../components/Kyrotics/KyroSidebar'
import {server} from '../../main'
import { fetchCompanyProjects, fetchProjectFilesCount, fetchTotalPagesInProject } from '../../utils/firestoreUtil'; // Update the import path

const KyroticsAdminHome = ({ userCompanyId }) => {
    const [companies, setCompanies] = useState([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState(null);
    const [projects, setProjects] = useState([]);
    const [projectData, setProjectData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCompanies = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`${server}/api/company`);
                const filteredCompanies = response.data.filter(company => company.id !== userCompanyId);
                setCompanies(filteredCompanies);
            } catch (err) {
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCompanies();
    }, [userCompanyId]);

    const handleCompanyChange = async (event) => {
        const companyId = event.target.value;
        setSelectedCompanyId(companyId);
        if (companyId) {
            const fetchedProjects = await fetchCompanyProjects(companyId);
            setProjects(fetchedProjects);
        }
    };

    useEffect(() => {
        const fetchProjectData = async () => {
            const data = await Promise.all(projects.map(async (project, index) => {
                const fileCount = await fetchProjectFilesCount(2, project.id); // Assuming status 2 for completed files
                const pageCount = await fetchTotalPagesInProject(2, project.id); // Assuming status 0 for total pages
                return {
                    slNo: index + 1,
                    projectName: project.name,
                    fileCount: fileCount,
                    pageCount: pageCount,
                    uploadedDate: project.uploadedDate, // Assuming uploadedDate is a Firestore Timestamp
                    completedFiles: fileCount,
                };
            }));
            setProjectData(data);
        };

        if (projects.length > 0) {
            fetchProjectData();
        }
    }, [projects]);

    return (
        <div>
            <KyroSidebar companyId={userCompanyId} role={'admin'} />
            {error && <p>Error: {error.message}</p>}
            <select onChange={handleCompanyChange} value={selectedCompanyId || ''}>
                <option value="" disabled>Select a company</option>
                {companies.map(company => (
                    <option key={company.id} value={company.id}>
                        {company.name}
                    </option>
                ))}
            </select>
            {isLoading ? (
                <p>Loading...</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Sl No</th>
                            <th>Project Name</th>
                            <th>File Count</th>
                            <th>Page Count</th>
                            <th>Uploaded Date</th>
                            <th>Completed Files</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projectData.map((project, index) => (
                            <tr key={index}>
                                <td>{project.name}</td>
                                <td>{project.name}</td>
                                <td>{project.fileCount}</td>
                                <td>{project.pageCount}</td>
                                <td>{project.uploadedDate}</td>
                                <td>{project.completedFiles}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default KyroticsAdminHome;
