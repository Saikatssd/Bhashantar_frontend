// // src/components/FileStatusManager.js

import React, { useState, useEffect } from 'react';
import {
  fetchProjectFiles,
  fetchAllCompanies,
  fetchCompanyProjects,
  fetchProjects,
  updateFileStatusNumber,
} from '../utils/firestoreUtil';
import {
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  List,
  ListItem,
  ListItemText,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

const statusLabels = {
  0: 'Delete Upload files(Client)-0',
  1: 'ML Processing - 1',
  2: 'Ready-for-work - 2',
  3: 'InProgress - 3',
  4: 'Completed - 4',
  5: 'Ready-for-work (Client) - 5',
  6: 'InProgress (Client) - 6',
  7: 'Completed (Client) - 7',
  8: 'Downloaded - 8',
};

const FileStatusManager = () => {
  const [companies, setCompanies] = useState([]);
  const [projects, setProjects] = useState([]);
  const [files, setFiles] = useState([]);
  const [filterCompany, setFilterCompany] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filteredFiles, setFilteredFiles] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const companies = await fetchAllCompanies();
        setCompanies(companies);
      } catch (error) {
        console.error('Error fetching companies:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchProjectsAndFiles = async () => {
      try {
        let companyProjects = [];
        if (filterCompany) {
          companyProjects = await fetchCompanyProjects(filterCompany);
        } else {
          companyProjects = await fetchProjects();
        }
        setProjects(companyProjects);

        const projectFilesPromises = companyProjects.map((project) =>
          fetchProjectFiles(project.id)
        );
        const projectFiles = (await Promise.all(projectFilesPromises)).flat();
        setFiles(projectFiles);
        setFilteredFiles(projectFiles);
      } catch (error) {
        console.error('Error fetching projects or files:', error);
      }
    };

    fetchProjectsAndFiles();
  }, [filterCompany]);

  useEffect(() => {
    setFilteredFiles(
      files.filter(
        (file) =>
          (filterProject ? file.projectId === filterProject : true) &&
          (filterStatus ? file.status === Number(filterStatus) : true)
      )
    );
  }, [filterProject, filterStatus, files]);

  const handleStatusChange = async (fileId, newStatus) => {
    try {
      await updateFileStatusNumber(filterProject, fileId, newStatus);
      const updatedFiles = files.map((file) =>
        file.id === fileId ? { ...file, status: newStatus } : file
      );
      setFiles(updatedFiles);
      setFilteredFiles(
        updatedFiles.filter(
          (file) =>
            (filterProject ? file.projectId === filterProject : true) &&
            (filterStatus ? file.status === Number(filterStatus) : true)
        )
      );
    } catch (error) {
      console.error('Error updating file status:', error);
    }
  };

  const handleBulkStatusChange = async () => {
    try {
      for (const fileId of selectedFiles) {
        await updateFileStatusNumber(filterProject, fileId, newStatus);
      }
      const updatedFiles = files.map((file) =>
        selectedFiles.includes(file.id) ? { ...file, status: Number(newStatus) } : file
      );
      setFiles(updatedFiles);
      setFilteredFiles(
        updatedFiles.filter(
          (file) =>
            (filterProject ? file.projectId === filterProject : true) &&
            (filterStatus ? file.status === Number(filterStatus) : true)
        )
      );
      setSelectedFiles([]);
      setDialogOpen(false);
    } catch (error) {
      console.error('Error updating file statuses:', error);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedFiles(filteredFiles.map((file) => file.id));
    } else {
      setSelectedFiles([]);
    }
  };

  const handleFileSelect = (fileId) => {
    setSelectedFiles((prevSelected) =>
      prevSelected.includes(fileId)
        ? prevSelected.filter((id) => id !== fileId)
        : [...prevSelected, fileId]
    );
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">File Status Manager</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <FormControl fullWidth>
          <InputLabel>Company</InputLabel>
          <Select
            value={filterCompany}
            onChange={(e) => {
              setFilterCompany(e.target.value);
              setFilterProject('');
            }}
          >
            <MenuItem value="">All Companies</MenuItem>
            {companies.map((company) => (
              <MenuItem key={company.id} value={company.id}>
                {company.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth>
          <InputLabel>Project</InputLabel>
          <Select
            value={filterProject}
            onChange={(e) => setFilterProject(e.target.value)}
            disabled={!filterCompany && companies.length > 0}
          >
            <MenuItem value="">All Projects</MenuItem>
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

      <div className="mb-4">
        <Button
          variant="contained"
          color="primary"
          onClick={() => setDialogOpen(true)}
          disabled={selectedFiles.length === 0}
        >
          Update Status for Selected Files
        </Button>
      </div>

      <List>
        <ListItem>
          <Checkbox
            checked={selectedFiles.length === filteredFiles.length}
            onChange={handleSelectAll}
          />
          <ListItemText primary="Select All" />
        </ListItem>
        {filteredFiles.length > 0 ? (
          filteredFiles.map((file) => {
            const project = projects.find((p) => p.id === file.projectId);
            return (
              <ListItem
                key={file.id}
                className="bg-white shadow-md rounded mb-2 p-2"
              >
                <Checkbox
                  checked={selectedFiles.includes(file.id)}
                  onChange={() => handleFileSelect(file.id)}
                />
                <ListItemText
                  primary={file.name}
                  secondary={`Status: ${file.status
                    }, Project: ${project ? project.name : 'Unknown'}`}
                />
                <div className="flex space-x-2">
                  {Object.keys(statusLabels).map((status) => (
                    <Button
                      key={status}
                      variant={
                        file.status === Number(status) ? 'contained' : 'outlined'
                      }
                      onClick={() => handleStatusChange(file.id, Number(status))}
                    >
                      {status}
                    </Button>
                  ))}
                </div>
              </ListItem>
            );
          })
        ) : (
          <ListItem>
            <ListItemText primary="No files found for the selected filters." />
          </ListItem>
        )}
      </List>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Update Status</DialogTitle>
        <DialogContent>
          <DialogContentText className="pb-3">
            Select the new status for the selected files.
          </DialogContentText>
          <FormControl fullWidth>
            <InputLabel>New Status</InputLabel>
            <Select
              value={newStatus}
              onChange={(e) => setNewStatus(Number(e.target.value))}
            >
              {Object.entries(statusLabels).map(([value, label]) => (
                <MenuItem key={value} value={value}>
                  {value}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={handleBulkStatusChange}
            color="primary"
            disabled={!newStatus}
          >
            Update Status
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default FileStatusManager;
