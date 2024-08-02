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
import KyroSidebar from '../../components/Kyrotics/KyroSidebar';
import { server } from '../../main';
import {
   Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { fetchCompanyProjects, fetchProjectFilesCount, fetchProjectName, fetchTotalPagesInProject } from '../../utils/firestoreUtil'; // Update the import path

const columns = [
    { id: 'slNo', label: 'Sl No', align:'center', minWidth: 100 },
    { id: 'projectName', label: 'Project Name',align:'left', minWidth: 170 },
    { id: 'fileCount', label: 'File Count',align:'center', minWidth: 100 },
    { id: 'pageCount', label: 'Page Count',align:'center', minWidth: 170 },
    { id: 'uploadedDate', label: 'Uploaded Date',align:'center', minWidth: 170 },
    { id: 'completedFiles', label: 'Completed Files',align:'center', minWidth: 170 }
];

const KyroticsAdminHome = ({ userCompanyId }) => {
    const [companies, setCompanies] = useState([]);
    const [selectedCompanyId, setSelectedCompanyId] = useState(null);
    const [projects, setProjects] = useState([]);
    const [projectData, setProjectData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

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
                const projectName = await fetchProjectName(project.id);
                const fileCount = await fetchProjectFilesCount(2, project.id); // Assuming status 2 for completed files
                const pageCount = await fetchTotalPagesInProject(2, project.id);
                return {
                    slNo: index + 1,
                    projectName: projectName,
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

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh' }}>
            <KyroSidebar companyId={userCompanyId} role={'admin'} />
            <div style={{ flex: 1, padding: '20px' }}>
                {error && <p>Error: {error.message}</p>}
                <Box sx={{ minWidth: 120, marginBottom: 2 }}>
                    <FormControl fullWidth>
                        <InputLabel id="company-select-label">Select a company</InputLabel>
                        <Select
                            labelId="company-select-label"
                            id="company-select"
                            value={selectedCompanyId || ''}
                            label="Select a company"
                            onChange={handleCompanyChange}
                        >
                            <MenuItem value="" disabled>Select a company</MenuItem>
                            {companies.map(company => (
                                <MenuItem key={company.id} value={company.id}>
                                    {company.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
                {isLoading ? (
                    <p>Loading...</p>
                ) : (
                    <Paper sx={{ width: '100%', overflow: 'hidden', marginTop: '20px' }}>
                        <TableContainer sx={{ maxHeight: 440 }}>
                            <Table stickyHeader aria-label="sticky table">
                                <TableHead>
                                    <TableRow>
                                        {columns.map((column) => (
                                            <TableCell
                                                key={column.id}
                                                align={column.align}
                                                style={{ minWidth: column.minWidth }}
                                            >
                                                {column.label}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {projectData
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((row, index) => (
                                            <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                                                {columns.map((column) => {
                                                    const value = row[column.id];
                                                    return (
                                                        <TableCell key={column.id} align={column.align}>
                                                            {column.format && typeof value === 'number'
                                                                ? column.format(value)
                                                                : value}
                                                        </TableCell>
                                                    );
                                                })}
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                        <TablePagination
                            rowsPerPageOptions={[10, 25, 100]}
                            component="div"
                            count={projectData.length}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </Paper>
                )}
            </div>
        </div>
    );
};

export default KyroticsAdminHome;
