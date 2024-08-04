import { fetchAllCompanies, fetchDetailedFileReport } from '../utils/firestoreUtil';
import { formatDate } from '../utils/formatDate'
import React, { useState, useEffect } from 'react';
import { exportToExcel } from '../utils/exportExcel';

import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  TextField,
} from '@mui/material';



const Report = () => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [fileDetails, setFileDetails] = useState([]);
  const [filteredDetails, setFilteredDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    fileName: '',
    assignedDate: '',
    status: '',
    assignedName: '',
    deliveryDate: '',
    projectName: '',
  });

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
    if (selectedCompany) {
      const fetchDetails = async () => {
        setIsLoading(true);
        try {
          const details = await fetchDetailedFileReport(selectedCompany);
          setFileDetails(details);
          setFilteredDetails(details);
        } catch (error) {
          console.error('Error fetching detailed file report:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchDetails();
    }
  }, [selectedCompany]);

  useEffect(() => {
    applyFilters();
  }, [filters, fileDetails]);

  const applyFilters = () => {
    const filtered = fileDetails.filter((file) => {
      return (
        (filters.fileName ? file.fileName.toLowerCase().includes(filters.fileName.toLowerCase()) : true) &&
        (filters.assignedDate ? formatDate(file.assignedDate) === formatDate(filters.assignedDate) : true) &&
        (filters.status ? file.status === Number(filters.status) : true) &&
        (filters.assignedName ? file.assigneeName.toLowerCase().includes(filters.assignedName.toLowerCase()) : true) &&
        (filters.deliveryDate ? formatDate(file.deliveryDate) === formatDate(filters.deliveryDate) : true) &&
        (filters.projectName ? file.projectName.toLowerCase().includes(filters.projectName.toLowerCase()) : true)
      );
    });
    setFilteredDetails(filtered);
  };


  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  return (
    <div className="p-4">
      <FormControl fullWidth className="mb-4">
        <InputLabel>Select Company</InputLabel>
        <Select
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
        >
          {companies.map((company) => (
            <MenuItem key={company.id} value={company.id}>
              {company.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <TextField
          label="File Name"
          name="fileName"
          value={filters.fileName}
          onChange={handleFilterChange}
          fullWidth
        />
        <TextField
          label="Assigned Date"
          name="assignedDate"
          type="date"
          value={filters.assignedDate}
          onChange={handleFilterChange}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Status"
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          fullWidth
        />
        <TextField
          label="Assignee Name"
          name="assignedName"
          value={filters.assignedName}
          onChange={handleFilterChange}
          fullWidth
        />
        <TextField
          label="Delivery Date"
          name="deliveryDate"
          type="date"
          value={filters.deliveryDate}
          onChange={handleFilterChange}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Project Name"
          name="projectName"
          value={filters.projectName}
          onChange={handleFilterChange}
          fullWidth
        />
      </div>

      <Button
        variant="contained"
        color="primary"
        onClick={() =>
          exportToExcel(filteredDetails, "detailed_file_report")
        }
        className="mb-4"
      >
        Export to Excel
      </Button>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Sl No</TableCell>
                <TableCell>File Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Page Count</TableCell>
                <TableCell>Uploaded Date</TableCell>
                <TableCell>Assigned Date</TableCell>
                <TableCell>Delivery Date</TableCell>
                <TableCell>Assignee Name</TableCell>
                <TableCell>Project Name</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredDetails.map((file, index) => (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{file.fileName}</TableCell>
                  <TableCell>{file.status}</TableCell>
                  <TableCell>{file.pageCount}</TableCell>
                  <TableCell>{formatDate(file.uploadedDate)}</TableCell>
                  <TableCell>{formatDate(file.assignedDate)}</TableCell>
                  <TableCell>{formatDate(file.deliveryDate)}</TableCell>
                  <TableCell>{file.assigneeName}</TableCell>
                  <TableCell>{file.projectName}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </div>
  );
};

export default Report;
