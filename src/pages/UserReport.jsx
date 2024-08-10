import React, { useState, useEffect } from 'react';
import { fetchCompanyProjects, fetchProjectFiles, fetchUserNameById, fetchAllCompanies } from '../utils/firestoreUtil';
import { MenuItem, Select, Button, TextField } from '@mui/material';
import { formatDate } from '../utils/formatDate';
import { exportToExcel } from '../utils/exportExcel';

const UserReport = () => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [reportData, setReportData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [assignedDateRange, setAssignedDateRange] = useState({ start: '', end: '' });
  const [completedDateRange, setCompletedDateRange] = useState({ start: '', end: '' });


  useEffect(() => {
    const fetchCompanies = async () => {
      const companiesData = await fetchAllCompanies();
      setCompanies(companiesData);
    };
    fetchCompanies();
  }, []);



  const handleCompanyChange = async (event) => {
    const companyId = event.target.value;
    setSelectedCompany(companyId);

    if (companyId) {
      setIsLoading(true);
      try {
        const projects = await fetchCompanyProjects(companyId);
        let allFiles = [];

        // Fetch all files from all projects
        for (const project of projects) {
          const projectFiles = await fetchProjectFiles(project.id);
          allFiles = [...allFiles, ...projectFiles];
        }

        // Group files by assigned and completed dates
        const groupedData = await allFiles.reduce(async (accPromise, file) => {
          const acc = await accPromise;

          const assignedDate = file.kyro_assignedDate ? formatDate(file.kyro_assignedDate) : null;
          const completedDate = file.kyro_completedDate ? formatDate(file.kyro_completedDate) : null;
          let userName = file.kyro_assignedTo || null;

          if (userName) {
            userName = await fetchUserNameById(userName);
          }

          if (assignedDate) {
            if (!acc[assignedDate]) acc[assignedDate] = {
              assignedFilesCount: 0,
              assignedPageCount: 0,
              completedFilesCount: 0,
              completedPageCount: 0,
              userName
            };
            acc[assignedDate].assignedFilesCount += 1;
            acc[assignedDate].assignedPageCount += file.pageCount || 0;
          }

          if (completedDate) {
            if (!acc[completedDate]) acc[completedDate] = {
              assignedFilesCount: 0,
              assignedPageCount: 0,
              completedFilesCount: 0,
              completedPageCount: 0,
              userName
            };
            acc[completedDate].completedFilesCount += 1;
            acc[completedDate].completedPageCount += file.pageCount || 0;
          }

          return acc;
        }, Promise.resolve({}));

        // Format the grouped data into an array
        const formattedData = Object.keys(groupedData).map(date => ({
          assignedDate: date,  // Assign the correct date here
          assignedFilesCount: groupedData[date].assignedFilesCount || 0,
          assignedPageCount: groupedData[date].assignedPageCount || 0,
          completedDate: date,  // Assign the correct date here
          completedFilesCount: groupedData[date].completedFilesCount || 0,
          completedPageCount: groupedData[date].completedPageCount || 0,
          userName: groupedData[date].userName,
        }));

        setReportData(formattedData);
        setFilteredData(formattedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };



  const handleDateFilterChange = () => {
    let filtered = reportData;

    if (assignedDateRange.start && assignedDateRange.end) {
      filtered = filtered.filter(data => {
        const assignedDate = new Date(data.assignedDate);
        return assignedDate >= new Date(assignedDateRange.start) && assignedDate <= new Date(assignedDateRange.end);
      });
    }

    if (completedDateRange.start && completedDateRange.end) {
      filtered = filtered.filter(data => {
        const completedDate = new Date(data.completedDate);
        return completedDate >= new Date(completedDateRange.start) && completedDate <= new Date(completedDateRange.end);
      });
    }

    setFilteredData(filtered);
  };

 

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Report</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="mb-4">
        <Select
          fullWidth
          value={selectedCompany}
          onChange={handleCompanyChange}
          displayEmpty
          variant="outlined"
          className="mb-4"
        >
          <MenuItem value="" disabled>Select a Company</MenuItem>
          {companies.map(company => (
            <MenuItem key={company.id} value={company.id}>{company.name}</MenuItem>
          ))}
        </Select>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4">
        <TextField
          label="Assigned Date Range Start"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={assignedDateRange.start}
          onChange={(e) => setAssignedDateRange({ ...assignedDateRange, start: e.target.value })}
          fullWidth
        />
        <TextField
          label="Assigned Date Range End"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={assignedDateRange.end}
          onChange={(e) => setAssignedDateRange({ ...assignedDateRange, end: e.target.value })}
          fullWidth
        />
        <TextField
          label="Completed Date Range Start"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={completedDateRange.start}
          onChange={(e) => setCompletedDateRange({ ...completedDateRange, start: e.target.value })}
          fullWidth
        />
        <TextField
          label="Completed Date Range End"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={completedDateRange.end}
          onChange={(e) => setCompletedDateRange({ ...completedDateRange, end: e.target.value })}
          fullWidth
        />
      </div>

      <Button variant="contained" color="primary" onClick={handleDateFilterChange} className="mb-4">Apply Filters</Button>

      <Button variant="contained" color="secondary" onClick={() =>
        exportToExcel(filteredData, "User_Report")
      } className="mb-4 ml-4">Export to Excel</Button>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Assigned Date</th>
              <th className="py-2 px-4 border-b">Assigned Files Count</th>
              <th className="py-2 px-4 border-b">Assigned Page Count</th>
              <th className="py-2 px-4 border-b">Completed Date</th>
              <th className="py-2 px-4 border-b">Completed Files Count</th>
              <th className="py-2 px-4 border-b">Completed Page Count</th>
              <th className="py-2 px-4 border-b">User Name</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((data, index) => (
              <tr key={index}>
                <td className="py-2 px-4 border-b">{data.assignedDate}</td>
                <td className="py-2 px-4 border-b">{data.assignedFilesCount}</td>
                <td className="py-2 px-4 border-b">{data.assignedPageCount}</td>
                <td className="py-2 px-4 border-b">{data.completedDate}</td>
                <td className="py-2 px-4 border-b">{data.completedFilesCount}</td>
                <td className="py-2 px-4 border-b">{data.completedPageCount}</td>
                <td className="py-2 px-4 border-b">{data.userName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserReport;
