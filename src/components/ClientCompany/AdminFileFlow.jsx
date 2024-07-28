

import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import TabPanel from '../TabPanel.jsx';
import { fetchProjectFiles, fetchProjectName, fetchUserNameById, updateFileStatus, updateFileStatusNumber, exportFiles } from '../../utils/firestoreUtil.jsx';
import { useParams } from 'react-router-dom';
import UserSelectModal from '../UserSelectModal.jsx';
import { auth } from '../../utils/firebase.jsx';
import TableAdmin from '../Table/TableAdmin.jsx';
import Table from '../Table/Table.jsx';
import CompletedTable from '../Table/CompletedTable.jsx';
import { server } from '../../main.jsx'
import axios from 'axios';

const columnsReadyForWork = [
    { id: 'slNo', label: 'Sl. No', minWidth: 50 },
    { id: 'name', label: 'File Name', minWidth: 170 },
    { id: 'pageCount', label: 'Page Count', minWidth: 100 },
    { id: 'kyro_completedDate', label: 'Uploaded At', minWidth: 170 },
    { id: 'edit', label: 'Actions', minWidth: 100 },
];

const columnsInProgress = [
    { id: 'slNo', label: 'Sl. No.', minWidth: 50 },
    { id: 'name', label: 'File Name', minWidth: 100 },
    { id: 'pageCount', label: 'Page Count', minWidth: 100 },
    { id: 'client_assignedDate', label: 'Assigned Date', minWidth: 100 },
    { id: 'client_assignedTo', label: 'Assigned To', minWidth: 150 },
    { id: 'edit', label: '', minWidth: 100, align: 'right' },
];

const columnsCompleted = [
    { id: 'slNo', label: 'Sl. No.', minWidth: 50 },
    { id: 'name', label: 'File Name', minWidth: 100 },
    { id: 'pageCount', label: 'Page Count', minWidth: 100 },
    // { id: 'projectName', label: 'Project Name', minWidth: 150 },
    { id: 'client_completedDate', label: 'Completed Date', minWidth: 100 },
    { id: 'client_assignedTo', label: 'Completed By', minWidth: 150 },
    { id: 'download', label: '', minWidth: 100, align: 'right' },

];


const columnsDownloaded = [
    { id: 'slNo', label: 'Sl. No.', minWidth: 50 },
    { id: 'name', label: 'File Name', minWidth: 100 },
    { id: 'pageCount', label: 'Page Count', minWidth: 100 },
    { id: 'client_downloadedDate', label: 'Download Date', minWidth: 100 },
    { id: 'client_assignedTo', label: 'Completed By', minWidth: 150 },
];

const AdminFileFlow = () => {
    const { projectId } = useParams();
    const [files, setFiles] = useState([]);
    const [tabValue, setTabValue] = useState(0);
    const [companyId, setCompanyId] = useState('');
    const [readyForWorkFiles, setReadyForWorkFiles] = useState([]);
    const [inProgressFiles, setInProgressFiles] = useState([]);
    const [completedFiles, setCompletedFiles] = useState([]);
    const [downloadedFiles, setDownloadedFiles] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [openModal, setOpenModal] = useState(false);
    const [selectedFileId, setSelectedFileId] = useState(null);
    const [projectName, setProjectName] = useState('');
    const [selectedRows, setSelectedRows] = useState([]);

    const [role, setRole] = useState('');

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                const token = await user.getIdTokenResult();
                // console.log(token)
                user.roleName = token.claims.roleName;
                user.companyId = token.claims.companyId;

                setRole(user.roleName);
                setCompanyId(user.companyId);
            }
        });
        return () => unsubscribe();
    }, []);



    useEffect(() => {
        const getFiles = async () => {
            if (!companyId || !projectId) return;
            setIsLoading(true);
            try {
                const projectFiles = await fetchProjectFiles(projectId);
                const projectName = await fetchProjectName(projectId);

                const fetchFileUsers = async (files) => {
                    return await Promise.all(files.map(async (file) => {
                        const assignedUser = file.client_assignedTo ? await fetchUserNameById(file.client_assignedTo) : null;
                        // const completedUser = file.assignedTo ? await fetchUserNameById(file.assignedTo) : null;
                        return {
                            ...file,
                            client_assignedTo: assignedUser,
                            // completedBy: completedUser
                        };
                    }));
                };

                // const readyForWork = await fetchFileUsers(projectFiles.filter(file => file.status === 4));
                // const inProgress = await fetchFileUsers(projectFiles.filter(file => file.status === 5));
                // const completed = await fetchFileUsers(projectFiles.filter(file => file.status === 6));
                // const downloaded = await fetchFileUsers(projectFiles.filter(file => file.status === 7));

                const readyForWork = await fetchFileUsers(projectFiles.filter(file => file.status === 5));
                const inProgress = await fetchFileUsers(projectFiles.filter(file => file.status === 6));
                const completed = await fetchFileUsers(projectFiles.filter(file => file.status === 7));
                const downloaded = await fetchFileUsers(projectFiles.filter(file => file.status === 8));

                setReadyForWorkFiles(readyForWork.map((file, index) => ({ ...file, slNo: index + 1 })));
                setInProgressFiles(inProgress.map((file, index) => ({ ...file, slNo: index + 1 })));
                setCompletedFiles(completed.map((file, index) => ({ ...file, slNo: index + 1 })));
                setDownloadedFiles(downloaded.map((file, index) => ({ ...file, slNo: index + 1 })));

                setProjectName(projectName);

            } catch (err) {
                console.error('Error fetching files:', err);
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };

        getFiles();
    }, [companyId, projectId]);

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(+event.target.value);
        setPage(0);
    };

    const handleOpenModal = (id) => {
        setSelectedFileId(id);
        setOpenModal(true);
    };

    const handleCloseModal = () => {
        setOpenModal(false);
        setSelectedFileId(null);
    };

    const handleAssignToUser = async (userId) => {
        try {
            await updateFileStatus(projectId, selectedFileId, { status: 6, client_assignedTo: userId, client_assignedDate: new Date().toISOString() });

            // await updateFileStatus(projectId, selectedFileId, 5, userId);
            setReadyForWorkFiles(files.filter(file => file.id !== selectedFileId));
            handleCloseModal();
        } catch (err) {
            console.error('Error updating file status:', err);
            setError(err);
        }
    };



    // const handleDownload = async (fileId, fileName) => {
    //     try {
    //         await exportFiles(projectId, fileId, fileName);
    //         await updateFileStatusNumber(projectId, selectedFileId, 8);

    //     } catch (err) {
    //         console.error('Error downloading file:', err);
    //         setError(err);
    //     }
    // };
    const handleDownload = async (projectId, fileId, fileName) => {
        try {
            console.log("url", `${server}/api/document/${projectId}/${fileId}/exportDoc`)
            // Send a request to the backend to trigger the file export
            const response = await axios({
                url: `${server}/api/document/${projectId}/${fileId}/exportDoc`, // Replace with your actual API endpoint
                method: 'GET',
                responseType: 'blob', // Important for binary data
            });

            // Create a URL for the downloaded data
            const url = window.URL.createObjectURL(new Blob([response.data]));

            // Create a link element and set the download attribute
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', fileName.replace('.pdf', '.zip')); // Use the correct file extension

            // Append the link to the document and click it to start the download
            document.body.appendChild(link);
            link.click();

            // Clean up by removing the link and revoking the object URL
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            // Optionally, update the file status
            await updateFileStatus(projectId, fileId, { status: 8, client_downloadedDate: new Date().toISOString() });


        } catch (err) {
            console.error('Error downloading file:', err);
            setError(err); // Assuming setError is a state function for displaying errors
        }
    };

    // const handleDownloadSelected = async () => {
    //     for (const fileId of selectedRows) {
    //         handleDownload(projectId, fileId,fileName);
    //         await updateFileStatus(projectId, fileId, { status: 8, client_downloadedDate: new Date().toISOString() });
    //     }
    //     setSelectedRows([]);
    //     const updatedFiles = await fetchProjectFiles(projectId);
    //     setFiles(updatedFiles);
    //     navigate(-1);

    // };
    const handleDownloadSelected = async () => {
        try {
            for (const { id, name } of selectedRows) {
                await handleDownload(projectId, id, name);
            }
            setSelectedRows([]);
        } catch (err) {
            console.error('Error downloading selected files:', err);
        }
    };


    if (isLoading) {
        return <CircularProgress />;
    }

    if (error) {
        return <Typography color="error">Error: {error.message}</Typography>;
    }

    return (
        <Box>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }} className="backdrop-blur-sm shadow-xl z-20">
                <Tabs value={tabValue} onChange={handleTabChange} aria-label="basic tabs example" centered>
                    <Tab label="Ready for Work" />
                    <Tab label="Work in Progress" />
                    <Tab label="Completed" />
                    <Tab label="Downloaded" />
                </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
                <TableAdmin
                    columns={columnsReadyForWork}
                    rows={readyForWorkFiles}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    handleChangePage={handleChangePage}
                    handleEditClick={handleOpenModal}
                    handleChangeRowsPerPage={handleChangeRowsPerPage}
                    projectName={projectName}
                />
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
                <Table
                    columns={columnsInProgress}
                    rows={inProgressFiles}
                    page={page}
                    projectName={projectName}
                    rowsPerPage={rowsPerPage}
                    handleChangePage={handleChangePage}
                    handleChangeRowsPerPage={handleChangeRowsPerPage}
                />
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
                <CompletedTable
                    columns={columnsCompleted}
                    rows={completedFiles}
                    page={page}
                    projectName={projectName}
                    rowsPerPage={rowsPerPage}
                    selectedRows={selectedRows}
                    setSelectedRows={setSelectedRows}
                    handleChangePage={handleChangePage}
                    handleChangeRowsPerPage={handleChangeRowsPerPage}
                    handleEditClick={handleDownload}
                    handleDownloadSelected={handleDownloadSelected}

                />
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
                <Table
                    columns={columnsDownloaded}
                    rows={downloadedFiles}
                    page={page}
                    projectName={projectName}
                    rowsPerPage={rowsPerPage}
                    handleChangePage={handleChangePage}
                    handleChangeRowsPerPage={handleChangeRowsPerPage}
                />
            </TabPanel>
            <UserSelectModal
                open={openModal}
                handleClose={handleCloseModal}
                handleAssign={handleAssignToUser}
                companyId={companyId}
            />
        </Box>
    );
};

export default AdminFileFlow;
