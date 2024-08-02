// // import React from 'react'
// // import KyroSidebar from '../../components/Kyrotics/KyroSidebar'

// // export default function KyroticsAdminHome({companyId}) {
// //     return (
// //         <div className="flex">
// //             <KyroSidebar companyId={companyId} role={'admin'} />
// //             <div className="flex-1 p-4">
// //                 <h1 className="text-2xl font-bold">Admin Home for Company: {companyId}</h1>
// //             </div>
// //         </div>
// //     )
// // }

// import React, { useEffect, useState } from 'react';
// import axios from 'axios';
// import KyroSidebar from '../../components/Kyrotics/KyroSidebar'
// import {server} from '../../main'
// import { fetchCompanyProjects, fetchProjectFilesCount, fetchTotalPagesInProject } from '../../utils/firestoreUtil'; // Update the import path

// const KyroticsAdminHome = ({ userCompanyId }) => {
//     const [companies, setCompanies] = useState([]);
//     const [selectedCompanyId, setSelectedCompanyId] = useState(null);
//     const [projects, setProjects] = useState([]);
//     const [projectData, setProjectData] = useState([]);
//     const [isLoading, setIsLoading] = useState(false);
//     const [error, setError] = useState(null);

//     useEffect(() => {
//         const fetchCompanies = async () => {
//             setIsLoading(true);
//             try {
//                 const response = await axios.get(`${server}/api/company`);
//                 const filteredCompanies = response.data.filter(company => company.id !== userCompanyId);
//                 setCompanies(filteredCompanies);
//             } catch (err) {
//                 setError(err);
//             } finally {
//                 setIsLoading(false);
//             }
//         };
//         fetchCompanies();
//     }, [userCompanyId]);

//     const handleCompanyChange = async (event) => {
//         const companyId = event.target.value;
//         setSelectedCompanyId(companyId);
//         if (companyId) {
//             const fetchedProjects = await fetchCompanyProjects(companyId);
//             setProjects(fetchedProjects);
//         }
//     };

//     useEffect(() => {
//         const fetchProjectData = async () => {
//             const data = await Promise.all(projects.map(async (project, index) => {
//                 const fileCount = await fetchProjectFilesCount(2, project.id); // Assuming status 2 for completed files
//                 const pageCount = await fetchTotalPagesInProject(2, project.id); // Assuming status 0 for total pages
//                 return {
//                     slNo: index + 1,
//                     projectName: project.name,
//                     fileCount: fileCount,
//                     pageCount: pageCount,
//                     uploadedDate: project.uploadedDate, // Assuming uploadedDate is a Firestore Timestamp
//                     completedFiles: fileCount,
//                 };
//             }));
//             setProjectData(data);
//         };

//         if (projects.length > 0) {
//             fetchProjectData();
//         }
//     }, [projects]);

//     return (
//         <div>
//             <KyroSidebar companyId={userCompanyId} role={'admin'} />
//             {error && <p>Error: {error.message}</p>}
//             <select onChange={handleCompanyChange} value={selectedCompanyId || ''}>
//                 <option value="" disabled>Select a company</option>
//                 {companies.map(company => (
//                     <option key={company.id} value={company.id}>
//                         {company.name}
//                     </option>
//                 ))}
//             </select>
//             {isLoading ? (
//                 <p>Loading...</p>
//             ) : (
//                 <table>
//                     <thead>
//                         <tr>
//                             <th>Sl No</th>
//                             <th>Project Name</th>
//                             <th>File Count</th>
//                             <th>Page Count</th>
//                             <th>Uploaded Date</th>
//                             <th>Completed Files</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {projectData.map((project, index) => (
//                             <tr key={index}>
//                                 <td>{project.name}</td>
//                                 <td>{project.name}</td>
//                                 <td>{project.fileCount}</td>
//                                 <td>{project.pageCount}</td>
//                                 <td>{project.uploadedDate}</td>
//                                 <td>{project.completedFiles}</td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             )}
//         </div>
//     );
// };

// export default KyroticsAdminHome;

// KyroAdminHome.jsx

import React, { useState, useEffect } from "react";
import {
  fetchAllCompanies,
  fetchProjectDetails,
} from "../../utils/firestoreUtil";
import { Button, MenuItem, Select, CircularProgress, FormControl, InputLabel } from "@mui/material";
import { exportToExcel } from "../../utils/exportExcel";
import KyroSidebar from "../../components/Kyrotics/KyroSidebar";

const KyroAdminHome = ({ companyId }) => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [projectDetails, setProjectDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const companies = await fetchAllCompanies();
        setCompanies(companies);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
    };
    fetchCompanies();
  }, []);

  useEffect(() => {
    if (selectedCompany) {
      const fetchDetails = async () => {
        setIsLoading(true);
        try {
          const details = await fetchProjectDetails(selectedCompany);
          setProjectDetails(details);
        } catch (error) {
          console.error("Error fetching project details:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchDetails();
    }
  }, [selectedCompany]);

  const handleCompanyChange = (event) => {
    setSelectedCompany(event.target.value);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <div className="flex">
      <KyroSidebar companyId={companyId} role={"admin"} />
      <div className="p-8">
        <div className="mb-4 flex space-x-14">
        <FormControl sx={{width:'30%'}}>
    <InputLabel id="select-company-label">Select a Company</InputLabel>
    <Select
      labelId="select-company-label"
      id="select-company"
      value={selectedCompany}
      label="Select a Company"
      onChange={handleCompanyChange}
    >
      <MenuItem value="" disabled>
        Select a Company
      </MenuItem>
      {companies.map((company) => (
        <MenuItem key={company.id} value={company.id}>
          {company.name}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
          <div className="mt-4">
              <Button
                variant="contained"
                
                onClick={() => exportToExcel(projectDetails)}
                sx={{backgroundColor: '#5b68c7'}}
              >
                Export to XLS
              </Button>
            </div>
        </div>
        

        {isLoading ? (
          <CircularProgress />
        ) : (
          <div>
            <div className="rounded-lg border border-gray-200">
  <div className="overflow-x-auto rounded-t-lg rounded-b-lg">
    <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
      <thead className="">
        <tr className="bg-[#6c7ae0] text-white">
          <th className="whitespace-nowrap px-6 py-2 font-medium">Sl No</th>
          <th className="whitespace-nowrap px-6 py-2 font-medium">Project Name</th>
          <th className="whitespace-nowrap px-6 py-2 font-medium">File Count</th>
          <th className="whitespace-nowrap px-6 py-2 font-medium">Not Started</th>
          <th className="whitespace-nowrap px-6 py-2 font-medium">In Progress</th>
          <th className="whitespace-nowrap px-6 py-2 font-medium">Completed Files</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 ">
        {projectDetails.map((project, index) => (
          <tr key={project.id} className="even:bg-[#f0f2ff] odd:bg-white hover:bg-[#b6bffa]">
            <td className="whitespace-nowrap px-6 py-2 text-center text-gray-900">{index + 1}</td>
            <td className="whitespace-nowrap px-6 py-2 text-left text-gray-900">{project.name}</td>
            <td className="whitespace-nowrap px-6 py-2 text-center text-gray-700">{project.totalFiles}</td>
            <td className="whitespace-nowrap px-6 py-2 text-center text-gray-700">{project.ReadyForWorkFiles}</td>
            <td className="whitespace-nowrap px-6 py-2 text-center text-gray-700">{project.inProgressFiles}</td>
            <td className="whitespace-nowrap px-6 py-2 text-center text-gray-700">{project.completedFiles}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</div>


            
          </div>
        )}
      </div>
    </div>
  );
};

export default KyroAdminHome;
