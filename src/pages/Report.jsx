import {
  fetchAllCompanies,
  fetchDetailedFileReport,
} from "../utils/firestoreUtil";
import { formatDate } from "../utils/formatDate";
import React, { useState, useEffect } from "react";
import { exportToExcel } from "../utils/exportExcel";
import SearchIcon from "@mui/icons-material/Search";
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
  TablePagination,
  InputAdornment,
} from "@mui/material";

const columns = [
  { id: "slNo", label: "Sl No", minWidth: 10 },
  { id: "fileName", label: "File Name", minWidth: 190 },
  { id: "status", label: "Status", minWidth: 60 },
  { id: "pageCount", label: "Page Count", minWidth: 70 },
  { id: "uploadedDate", label: "Uploaded Date", minWidth: 90 },
  { id: "assignedDate", label: "Assigned Date", minWidth: 130 },
  { id: "deliveryDate", label: "Delivery Date", minWidth: 130 },
  { id: "assigneeName", label: "Assignee Name", minWidth: 130 },
  { id: "projectName", label: "Project Name", minWidth: 130 },
];

const Report = () => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [fileDetails, setFileDetails] = useState([]);
  const [filteredDetails, setFilteredDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({
    searchQuery: "",
    assignedDate: "",
    status: "",
    deliveryDate: "",
  });
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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
          const details = await fetchDetailedFileReport(selectedCompany);
          setFileDetails(details);
          setFilteredDetails(details);
        } catch (error) {
          console.error("Error fetching detailed file report:", error);
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
        (filters.searchQuery
          ? file.fileName
              .toLowerCase()
              .includes(filters.searchQuery.toLowerCase()) ||
            file.assigneeName
              .toLowerCase()
              .includes(filters.searchQuery.toLowerCase()) ||
            file.projectName
              .toLowerCase()
              .includes(filters.searchQuery.toLowerCase())
          : true) &&
        (filters.assignedDate
          ? formatDate(file.assignedDate) === formatDate(filters.assignedDate)
          : true) &&
        (filters.status ? file.status === Number(filters.status) : true) &&
        (filters.deliveryDate
          ? formatDate(file.deliveryDate) === formatDate(filters.deliveryDate)
          : true)
      );
    });
    setFilteredDetails(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }));
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <div className="p-4">
      <FormControl sx={{ width: "30%" }}>
        <InputLabel id="select-company-label">Select Company</InputLabel>
        <Select
          labelId="select-company-label"
          id="select-company"
          value={selectedCompany}
          label="Select a Company"
          onChange={(e) => setSelectedCompany(e.target.value)}
        >
          {companies.map((company) => (
            <MenuItem key={company.id} value={company.id}>
              {company.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <div className="grid grid-cols-2 gap-4 mb-4 pt-5">
      </div>

      <div className="flex justify-between pb-10">
        <div className="relative w-60">
          <div className="absolute z-10 left-0 p-3 -mt-1 flex m-auto pointer-events-none">
            <SearchIcon className="w-5 text-gray-500" />
          </div>
          <input
            type="text"
            name="searchQuery"
            placeholder="Search User, File, Projects"
            value={filters.searchQuery}
            onChange={handleFilterChange}
            className="block w-full pl-10 pr-3 py-2 border border-[#02bbcc] rounded-3xl leading-5 backdrop-blur-sm shadow-md bg-white/30 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div className="relative w-40">
          <input
            type="text"
            name="status"
            placeholder="Status"
            value={filters.status}
            onChange={handleFilterChange}
            className="block w-full pl-3 pr-3 py-2 border border-[#02bbcc] rounded-3xl leading-5 backdrop-blur-sm shadow-md bg-white/30 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

      <div className="relative w-40 -mt-7">
        <label className="block text-gray-700 text-sm font-bold mb-2 text-center" htmlFor="assignedDate">
          Assigned Date
        </label>
        <input
          type="date"
          name="assignedDate"
          value={filters.assignedDate}
          onChange={handleFilterChange}
          className="block w-full pl-3 pr-3 py-2 border border-dashed border-[#02bbcc] rounded-3xl leading-5 backdrop-blur-sm shadow-md bg-white/30 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <div className="relative w-40 -mt-7">
        <label className="block text-gray-700 text-sm font-bold mb-2 text-center" htmlFor="deliveryDate">
          Delivery Date
        </label>
        <input
          type="date"
          name="deliveryDate"
          value={filters.deliveryDate}
          onChange={handleFilterChange}
          className="block w-full pl-3 pr-3 py-2 border border-dashed border-[#02bbcc] rounded-3xl leading-5 backdrop-blur-sm shadow-md bg-white/30 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

        <Button
          variant="outlined"
          onClick={() => exportToExcel(filteredDetails, "detailed_file_report")}
          className="mb-4"
        >
          Export to Excel
        </Button>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <Paper sx={{ width: "100%", overflow: "hidden", borderRadius: 2 }}>
  <TableContainer sx={{ maxHeight: 700 }}>
    <Table stickyHeader aria-label="sticky table">
      <TableHead>
        <TableRow>
          {columns.map((column) => (
            <TableCell
              key={column.id}
              style={{ minWidth: column.minWidth, backgroundColor: "#6c7ae0", color: "#ffffff" }}
            >
              {column.label}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {filteredDetails
          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
          .map((file, index) => (
            <TableRow
              hover
              role="checkbox"
              tabIndex={-1}
              key={index}
              sx={{
                backgroundColor: index % 2 === 0 ? "#f0f2ff" : "inherit",
              }}
            >
              <TableCell align="center">{index + 1}</TableCell>
              <TableCell>{file.fileName}</TableCell>
              <TableCell align="center">{file.status}</TableCell>
              <TableCell align="center">{file.pageCount}</TableCell>
              <TableCell align="center">
                {formatDate(file.uploadedDate)}
              </TableCell>
              <TableCell align="center">
                {formatDate(file.assignedDate)}
              </TableCell>
              <TableCell align="center">
                {formatDate(file.deliveryDate)}
              </TableCell>
              <TableCell>{file.assigneeName}</TableCell>
              <TableCell>{file.projectName}</TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  </TableContainer>
  <TablePagination
    rowsPerPageOptions={[10, 25, 100]}
    component="div"
    count={filteredDetails.length}
    rowsPerPage={rowsPerPage}
    page={page}
    onPageChange={handleChangePage}
    onRowsPerPageChange={handleChangeRowsPerPage}
  />
</Paper>

      )}
    </div>
  );
};

export default Report;
