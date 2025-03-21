
import React, { useState, useEffect } from "react";
import {
  fetchProjectFiles,
  fetchProjects,
  updateFileStatusNumber,
} from "../utils/firestoreUtil";
import {
  fetchClientCompanies,
  fetchCompanyProjects,
} from "./../services/companyServices";
import {
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Checkbox,
  ListItem,
  ListItemText
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Loader from "./common/Loader";

const statusLabels = {
  0: "Delete Upload files(Client)-0",
  1: "ML Processing - 1",
  2: "Ready-for-work - 2",
  3: "InProgress - 3",
  4: "Completed - 4",
  5: "Ready-for-work (Client) - 5",
  6: "InProgress (Client) - 6",
  7: "Completed (Client) - 7",
  8: "Downloaded - 8",
};

const FileStatusManager = () => {
  const [companies, setCompanies] = useState([]);
  const [projects, setProjects] = useState([]);
  const [files, setFiles] = useState([]);
  const [filterCompany, setFilterCompany] = useState(null);
  const [filterProject, setFilterProject] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const companies = await fetchClientCompanies();
        setCompanies(companies);
      } catch (error) {
        console.error("Error fetching companies:", error);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (filterCompany) {
      const fetchProjectsAndFiles = async () => {
        setLoading(true);
        try {
          const companyProjects = await fetchCompanyProjects(filterCompany);
          setProjects(companyProjects);
          if (filterProject) {
            const projectFiles = await fetchProjectFiles(filterProject);
            setFiles(projectFiles);
          }
        } catch (error) {
          console.error("Error fetching projects or files:", error);
        }
        setLoading(false);
      };
      fetchProjectsAndFiles();
    }
  }, [filterCompany, filterProject]);

  const handleStatusChangeDialogOpen = (file) => {
    setSelectedFile(file);
    setSelectedStatus(Number(file.status));
    setDialogOpen(true);
  };

  const handleStatusChangeDialogClose = () => {
    setDialogOpen(false);
    setSelectedFile(null);
    setSelectedStatus(null);
  };

  const handleStatusSave = async () => {
    try {
      if (selectedFile) {
        await updateFileStatusNumber(
          filterProject,
          selectedFile.id,
          Number(selectedStatus)
        );
        setFiles((prevFiles) =>
          prevFiles.map((file) =>
            file.id === selectedFile.id
              ? { ...file, status: Number(selectedStatus) }
              : file
          )
        );
        handleStatusChangeDialogClose();
      }
    } catch (error) {
      console.error("Error updating file status:", error);
    }
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredFiles = files.filter((file) =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto p-8 h-screen overflow-y-auto">
      <h1 className="text-2xl font-bold mb-4">File Status Manager</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <FormControl fullWidth>
          <InputLabel>Organisation</InputLabel>
          <Select
            value={filterCompany}
            onChange={(e) => {
              setFilterCompany(e.target.value);
              setFilterProject("");
            }}
          >
            <MenuItem value="">All Organisations</MenuItem>
            {companies.map((company) => (
              <MenuItem key={company.id} value={company.id}>
                {company.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Judgement</InputLabel>
          <Select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            disabled={!filterCompany}
          >
            <MenuItem value="">All Judgements</MenuItem>
            {projects.map((project) => (
              <MenuItem key={project.id} value={project.id}>
                {project.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Status</InputLabel>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <MenuItem value="">All Statuses</MenuItem>
            {Object.entries(statusLabels).map(([value, label]) => (
              <MenuItem key={value} value={value}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>

      <div className="relative w-60 mb-4">
        <div className="absolute z-10 left-0 p-3 -mt-1 flex m-auto pointer-events-none">
          <SearchIcon className="w-5 text-gray-500" />
        </div>
        <input
          type="text"
          name="searchQuery"
          placeholder="Search File by name"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-[#02bbcc] rounded-3xl leading-5 backdrop-blur-sm shadow-md bg-white/30 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {loading ? (
        <Loader />
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox />
                </TableCell>
                <TableCell>File Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Project</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredFiles
                .filter(
                  (file) =>
                    filterStatus === "" ||
                    file.status.toString() === filterStatus
                )
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((file) => (
                  <TableRow key={file.id}>
                    <TableCell padding="checkbox">
                      <Checkbox />
                    </TableCell>
                    <TableCell>{file.name}</TableCell>
                    <TableCell>{statusLabels[file.status]}</TableCell>
                    <TableCell>
                      {projects.find((project) => project.id === file.projectId)
                        ?.name || "Unknown"}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        onClick={() => handleStatusChangeDialogOpen(file)}
                      >
                        Change Status
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredFiles.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handlePageChange}
            onRowsPerPageChange={handleRowsPerPageChange}
          />
        </TableContainer>
      )}
      {filteredFiles.length <= 0 && (
        <marquee behavior="alternate" scrollAmount="12" direction="right" className="m-20 text-xl">
          Choose the Organisation and Judgement first to view the files.
        </marquee>
      )}



      <Dialog open={dialogOpen} onClose={handleStatusChangeDialogClose}>
        <DialogTitle>Change File Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(Number(e.target.value))}
            >
              {Object.entries(statusLabels).map(([value, label]) => (
                <MenuItem key={value} value={Number(value)}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleStatusChangeDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleStatusSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default FileStatusManager;
