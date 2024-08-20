// // //status notation
// // //0-->client End for delete //1-->Ml
// // //(KyroticsSide) 2-->Ready-for-work//3-->Assigned to User//4-->completed
// // //(ClientSide)4-->Ready-for-work//5-->Assigned to User//6-->completed //7-->Downloaded

import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { fetchProjectFiles } from '../services/projectServices'
import { formatDate } from "../utils/formatDate";
import { fetchCompanyProjects } from './companyServices';
import { fetchUserNameById } from '../utils/firestoreUtil';
import { parse } from 'date-fns'


export const fetchProjectDetails = async (companyId) => {
    try {
        const projects = await fetchCompanyProjects(companyId);
        const projectDetails = await Promise.all(
            projects.map(async (project) => {
                const files = await fetchProjectFiles(project.id);
                const totalFiles = files.length;
                const completedFiles = files.filter((file) => file.status >= 5);
                const completedFileCount = completedFiles.length;
                const readyForWorkFiles = files.filter(
                    (file) => file.status == 2
                ).length;

                const inProgressFiles = files.filter(
                    (file) => file.status == 3 || file.status == 4
                ).length;
                // const kyroCompletedDates = completedFiles.map(file => file.kyro_completedDate);
                // const completedFilePageCount = completedFiles.map(file => file.pageCount);
                // const completedFilePageCount = completedFiles.reduce((total, file) => total + (file.pageCount || 0), 0);

                return {
                    // id: project.id,
                    name: project.name,
                    totalFiles,
                    readyForWorkFiles,
                    inProgressFiles,
                    completedFileCount,
                    // kyroCompletedDates,
                    // completedFilePageCount
                };
            })
        );
        return projectDetails;
    } catch (error) {
        console.error("Error fetching project details:", error);
        throw new Error("Error fetching project details");
    }
};


export const fetchClientProjectDetails = async (companyId) => {
    try {
        const projects = await fetchCompanyProjects(companyId);
        const projectDetails = await Promise.all(
            projects.map(async (project) => {
                const files = await fetchProjectFiles(project.id);
                const totalFiles = files.length;
                const completedFiles = files.filter((file) => file.status == 7);
                const completedFileCount = completedFiles.length;
                const readyForWorkFiles = files.filter(
                    (file) => file.status == 5
                ).length;

                const inProgressFiles = files.filter(
                    (file) => file.status == 6
                ).length;

                return {
                    // id: project.id,
                    name: project.name,
                    totalFiles,
                    readyForWorkFiles,
                    inProgressFiles,
                    completedFileCount,
                    // kyroCompletedDates,
                    // completedFilePageCount
                };
            })
        );
        return projectDetails;
    } catch (error) {
        console.error("Error fetching project details:", error);
        throw new Error("Error fetching project details");
    }
};



export const fetchDetailedFileReport = async (companyId) => {
    try {

        const statusLabel = {
            1: "ML",
            2: "NotStarted",
            3: "InProgress",
            4: "Completed",
            5: "Delivered",
            6: "Delivered",
            7: "Delivered",
            8: "Delivered",
        };

        const projects = await fetchCompanyProjects(companyId);
        const detailedFileReport = await Promise.all(
            projects.map(async (project) => {
                const files = await fetchProjectFiles(project.id);
                const filteredFiles = files.filter((file) => file.status >= 1)
                const filesWithAssigneeNames = await Promise.all(filteredFiles.map(async (file) => {
                    const assigneeName = file.kyro_assignedTo ? await fetchUserNameById(file.kyro_assignedTo) : '';
                    return {
                        fileName: file.name,
                        status: statusLabel[file.status],
                        pageCount: file.pageCount,
                        uploadedDate: file.uploadedDate,
                        assignedDate: file.kyro_assignedDate,
                        deliveryDate: file.kyro_deliveredDate,
                        assigneeName,
                        projectName: project.name,
                    };
                }));
                return filesWithAssigneeNames;
            })
        );
        return detailedFileReport.flat();
    } catch (error) {
        console.error('Error fetching detailed file report:', error);
        throw new Error('Error fetching detailed file report');
    }
};

export const fetchClientDetailedFileReport = async (companyId) => {
    try {
        const projects = await fetchCompanyProjects(companyId);
        const detailedFileReport = await Promise.all(
            projects.map(async (project) => {
                const files = await fetchProjectFiles(project.id);
                const filteredFiles = files.filter((file) => file.status >= 5)
                const filesWithAssigneeNames = await Promise.all(filteredFiles.map(async (file) => {
                    const assigneeName = file.client_assignedTo ? await fetchUserNameById(file.client_assignedTo) : '';
                    return {
                        fileName: file.name,
                        status: file.status,
                        pageCount: file.pageCount,
                        uploadedDate: file.uploadedDate,
                        assignedDate: file.client_assignedDate,
                        deliveryDate: file.client_downloadedDate,
                        assigneeName,
                        projectName: project.name,
                    };
                }));
                return filesWithAssigneeNames;
            })
        );
        return detailedFileReport.flat();
    } catch (error) {
        console.error('Error fetching detailed file report:', error);
        throw new Error('Error fetching detailed file report');
    }
};


export const fetchReportDetails = async (companyId, startDate, endDate) => {
    try {
        const projects = await fetchCompanyProjects(companyId);
        const allDetails = [];

        for (const project of projects) {
            const files = await fetchProjectFiles(project.id);

            const filteredFiles = files.filter((file) => {
                const deliveredDate = file.kyro_deliveredDate ? parse(file.kyro_deliveredDate, "dd/MM/yyyy", new Date()) : null;
                console.log(deliveredDate);

                return deliveredDate >= startDate && deliveredDate <= endDate;
            });

            const dateMap = filteredFiles.reduce((acc, file) => {
                const date = file.kyro_deliveredDate;
                console.log(date)
                if (!acc[date]) {
                    acc[date] = { date, fileCount: 0, pageCount: 0 };
                }
                acc[date].fileCount += 1;
                acc[date].pageCount += file.pageCount || 0;
                return acc;
            }, {});

            allDetails.push(...Object.values(dateMap));
        }

        return allDetails;
    } catch (error) {
        console.error("Error fetching report details:", error);
        throw new Error("Error fetching report details");
    }
};


export const fetchUserCompletedFilesReport = async (companyId, startDate, endDate) => {
    const projects = await fetchCompanyProjects(companyId);
    const userFiles = {};

    for (const project of projects) {
        const files = await fetchProjectFiles(project.id);

        // Filter files based on the completed date range
        const filteredFiles = files.filter((file) => {
            const completedDate = file.kyro_completedDate ? parse(file.kyro_completedDate, "dd/MM/yyyy", new Date()) : null;

            // Filter based on completedDate within the range
            return completedDate && completedDate >= startDate && completedDate <= endDate;
        });

        // Process filtered files
        for (const file of filteredFiles) {
            const userName = file.kyro_assignedTo ? await fetchUserNameById(file.kyro_assignedTo) : 'Unknown';

            // Skip if userName is 'Unknown'
            if (userName === 'Unknown') {
                continue;
            }

            if (!userFiles[userName]) {
                userFiles[userName] = { fileCount: 0, pageCount: 0 };
            }

            userFiles[userName].fileCount += 1;
            userFiles[userName].pageCount += file.pageCount || 0;
        }
    }

    // Convert userFiles object to an array of objects
    const formattedData = Object.keys(userFiles).map(userName => ({
        userName,
        fileCount: userFiles[userName].fileCount,
        totalPages: userFiles[userName].pageCount,
    }));

    return formattedData;
};


export const fetchUserDetailedReport = async (companyId) => {
    try {
        // Step 1: Fetch all projects for the company
        const projects = await fetchCompanyProjects(companyId);

        const allFiles = [];

        // Step 2: Fetch files for each project
        for (const project of projects) {
            const projectFiles = await fetchProjectFiles(project.id);
            allFiles.push(...projectFiles);
        }

        const reportData = {};

        // Helper function to add files and pages to the group
        const addToGroup = (groupKey, file) => {
            if (!reportData[groupKey]) {
                reportData[groupKey] = {
                    AssignedDate: 'N/A',
                    AssignedFiles: 0,
                    AssignedPages: 0,
                    CompletedDate: 'N/A',
                    CompletedFiles: 0,
                    CompletedPages: 0,
                    userName: 'N/A'
                };
            }
            if (file.kyro_assignedDate) {
                reportData[groupKey].AssignedDate = formatDate(file.kyro_assignedDate);
                reportData[groupKey].AssignedFiles += 1;
                reportData[groupKey].AssignedPages += file.pageCount || 0;
                reportData[groupKey].userName = file.kyro_assignedTo;
            }
            if (file.kyro_completedDate) {
                reportData[groupKey].CompletedDate = formatDate(file.kyro_completedDate);
                reportData[groupKey].CompletedFiles += 1;
                reportData[groupKey].CompletedPages += file.pageCount || 0;
                reportData[groupKey].userName = file.kyro_assignedTo;
            }
        };

        // Step 3: Iterate over each file and group by date
        allFiles.forEach((file) => {
            const assignedKey = file.kyro_assignedDate ? formatDate(file.kyro_assignedDate) : null;
            const completedKey = file.kyro_completedDate ? formatDate(file.kyro_completedDate) : null;

            // Create group keys
            const groupKey = `${assignedKey || 'N/A'}-${completedKey || 'N/A'}`;

            // Add file to the appropriate group
            addToGroup(groupKey, file);
        });

        // Convert the grouped data object into an array
        const groupedReportData = Object.keys(reportData).map((key) => {
            const data = reportData[key];
            return {
                assignedDate: data.AssignedDate,
                assignedFiles: data.AssignedFiles,
                assignedPages: data.AssignedPages,
                completedDate: data.CompletedDate,
                completedFiles: data.CompletedFiles,
                completedPages: data.CompletedPages,
                userName: data.userName,
            };
        });

        return groupedReportData;
    } catch (error) {
        console.error("Error fetching company report data:", error);
        throw new Error("Error fetching company report data");
    }
};


export const fetchUserCompletedDetailedFileReport = async (companyId) => {
    try {
        const projectsSnapshot = await db.collection("projects").where("companyId", "==", companyId).get();
        let allFiles = [];

        for (const projectDoc of projectsSnapshot.docs) {
            const projectFilesSnapshot = await db
                .collection("files")
                .where("projectId", "==", projectDoc.id)
                .get();

            allFiles = [...allFiles, ...projectFilesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))];
        }

        const groupedData = await allFiles.reduce(async (accPromise, file) => {
            const acc = await accPromise;

            const assignedDate = file.kyro_assignedDate ? file.kyro_assignedDate : null;
            const completedDate = file.kyro_completedDate ? file.kyro_completedDate : null;
            let userName = file.kyro_assignedTo || null;

            if (userName) {
                userName = await fetchUserNameById(userName); // Ensure this function exists and is correct
            }

            if (assignedDate) {
                if (!acc[assignedDate]) {
                    acc[assignedDate] = {
                        assignedFilesCount: 0,
                        assignedPageCount: 0,
                        completedFilesCount: 0,
                        completedPageCount: 0,
                        userName,
                    };
                }
                acc[assignedDate].assignedFilesCount += 1;
                acc[assignedDate].assignedPageCount += file.pageCount || 0;
            }

            if (completedDate) {
                if (!acc[completedDate]) {
                    acc[completedDate] = {
                        assignedFilesCount: 0,
                        assignedPageCount: 0,
                        completedFilesCount: 0,
                        completedPageCount: 0,
                        userName,
                    };
                }
                acc[completedDate].completedFilesCount += 1;
                acc[completedDate].completedPageCount += file.pageCount || 0;
            }

            return acc;
        }, Promise.resolve({}));

        const formattedData = Object.keys(groupedData).map((date) => ({
            assignedDate: date,
            assignedFilesCount: groupedData[date].assignedFilesCount || 0,
            assignedPageCount: groupedData[date].assignedPageCount || 0,
            completedDate: date,
            completedFilesCount: groupedData[date].completedFilesCount || 0,
            completedPageCount: groupedData[date].completedPageCount || 0,
            userName: groupedData[date].userName,
        }));

        return formattedData;
    } catch (err) {
        throw new Error("Failed to fetch report data: " + err.message);
    }
};