import { fetchAllCompanies, fetchProjectDetails } from '../utils/firestoreUtil';
import React, { useState, useEffect } from 'react';
import { TextField, Button, CircularProgress, MenuItem, Select, InputLabel, FormControl } from '@mui/material';


const Report = () => {
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [projectDetails, setProjectDetails] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const companies = await fetchAllCompanies();
                setCompanies(companies);
            } catch (error) {
                console.error('Error fetching companies:', error);
            }
        };
        fetchCompanies();
    }, []);

    useEffect(() => {
        if (selectedCompany && startDate && endDate) {
            setLoading(true);
            const fetchDetails = async () => {
                try {
                    const details = await fetchProjectDetails(selectedCompany);
                    const filteredData = details.filter((project) => {
                        const completedDate = new Date(project.kyro_completedDate);
                        return (
                            completedDate >= new Date(startDate) &&
                            completedDate <= new Date(endDate) &&
                            project.status >= 5
                        );
                    });
                    setProjectDetails(filteredData);
                } catch (error) {
                    console.error('Error fetching project details:', error);
                } finally {
                    setLoading(false);
                }
            };
            fetchDetails();
        }
    }, [selectedCompany, startDate, endDate]);

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Report</h1>
            <div className="mb-6 flex space-x-4">
                <FormControl fullWidth variant="outlined" className="mb-4">
                    <InputLabel>Company</InputLabel>
                    <Select
                        value={selectedCompany}
                        onChange={(e) => setSelectedCompany(e.target.value)}
                        label="Company"
                    >
                        {companies.map((company) => (
                            <MenuItem key={company.id} value={company.id}>
                                {company.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <div>
                    <label htmlFor="start-date" className="block mb-2 text-sm font-medium text-gray-700">
                        Start Date
                    </label>
                    <input
                        id="start-date"
                        type="date"
                        className="block w-full p-2.5 border border-gray-300 rounded-lg"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />
                </div>
                <div>
                    <label htmlFor="end-date" className="block mb-2 text-sm font-medium text-gray-700">
                        End Date
                    </label>
                    <input
                        id="end-date"
                        type="date"
                        className="block w-full p-2.5 border border-gray-300 rounded-lg"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />
                </div>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={() => { }}
                    disabled={!startDate || !endDate || !selectedCompany}
                >
                    Fetch Data
                </Button>
            </div>
            {loading ? (
                <div className="flex justify-center">
                    <CircularProgress />
                </div>
            ) : (
                <table className="min-w-full bg-white shadow-md rounded-lg">
                    <thead className="bg-blue-500 text-white">
                        <tr>
                            <th className="py-3 px-6">Completed Date</th>
                            <th className="py-3 px-6">File Count</th>
                            <th className="py-3 px-6">Page Count</th>
                            <th className="py-3 px-6">Project Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projectDetails.map((project, index) => (
                            <tr
                                key={index}
                                className={`${index % 2 === 0 ? 'bg-gray-100' : 'bg-white'
                                    }`}
                            >
                                <td className="py-3 px-6">
                                    {new Date(project.kyro_completedDate).toLocaleDateString()}
                                </td>
                                <td className="py-3 px-6">{project.fileCount}</td>
                                <td className="py-3 px-6">{project.pageCount}</td>
                                <td className="py-3 px-6">{project.projectName}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default Report;
