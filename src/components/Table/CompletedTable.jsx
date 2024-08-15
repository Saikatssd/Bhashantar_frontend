import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TablePagination from "@mui/material/TablePagination";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import MuiTable from "@mui/material/Table";
import Checkbox from "@mui/material/Checkbox";
import DownloadIcon from "@mui/icons-material/Download";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { fetchProjectFilesCount, fetchTotalPagesInProject } from "../../utils/firestoreUtil";



function CompletedTable({
  columns,
  rows = [],
  page,
  rowsPerPage,
  handleChangePage,
  handleChangeRowsPerPage,
  selectedRows,
  setSelectedRows,
  handleDownloadSelected,
  handleDownload,
  projectName,
  projectId,
  status,
}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const [currentFile, setCurrentFile] = useState(null);
  const [selectedAnchorEl, setSelectedAnchorEl] = useState(null);
  const [fileCount, setFileCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [count, pages] = await Promise.all([
          fetchProjectFilesCount(status, projectId),
          fetchTotalPagesInProject(status, projectId),
        ]);
        setFileCount(count);
        setTotalPages(pages);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (projectId && status) {
      fetchData();
    }
  }, [projectId, status]);

  const handleCheckboxClick = (event, id) => {
    if (event.target.checked) {
      setSelectedRows([...selectedRows, id]);
    } else {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    }
  };

  const handleMenuOpen = (event, file) => {
    setAnchorEl(event.currentTarget);
    setCurrentFile(file);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setCurrentFile(null);
  };

  const handleSelectedMenuOpen = (event) => {
    setSelectedAnchorEl(event.currentTarget);
  };

  const handleSelectedMenuClose = () => {
    setSelectedAnchorEl(null);
  };

  const handleDownloadClick = (format) => {
    if (currentFile) {
      handleDownload(currentFile.projectId, currentFile.id, format);
    }
    handleMenuClose();
  };

  const handleDownloadSelectedClick = (format) => {
    handleDownloadSelected(format);
    handleSelectedMenuClose();
  };

  return (
    <div>
      <h2 className="text-center py-4 font-bold text-2xl">
        {projectName}
        {!loading && (
          <span className="ml-4 text-lg font-normal text-gray-600">
            ({fileCount} files, {totalPages} pages)
          </span>
        )}
      </h2>
      <div className="flex justify-between items-center mb-4 px-4">
        <Button
          variant="contained"
          color="primary"
          onClick={handleSelectedMenuOpen}
          disabled={selectedRows.length === 0}
        >
          <DownloadIcon className="text-white text-lg mx-1" />
          Download Selected
        </Button>
        <Menu
          anchorEl={selectedAnchorEl}
          open={Boolean(selectedAnchorEl)}
          onClose={handleSelectedMenuClose}
        >
          <MenuItem onClick={() => handleDownloadSelectedClick("pdf")}>
            Download as PDF
          </MenuItem>
          <MenuItem onClick={() => handleDownloadSelectedClick("word")}>
            Download as Word
          </MenuItem>
        </Menu>
      </div>
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: 700 }}>
          <MuiTable stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={
                      selectedRows.length > 0 &&
                      selectedRows.length < rows.length
                    }
                    checked={
                      rows.length > 0 && selectedRows.length === rows.length
                    }
                    onChange={(event) => {
                      if (event.target.checked) {
                        setSelectedRows(rows.map((row) => row.id));
                      } else {
                        setSelectedRows([]);
                      }
                    }}
                  />
                </TableCell>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align || "left"}
                    style={{ minWidth: column.minWidth }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedRows.includes(row.id)}
                        onChange={(event) => handleCheckboxClick(event, row.id)}
                      />
                    </TableCell>
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell
                          key={column.id}
                          align={column.align || "left"}
                        >
                          {column.id === "download" ? (
                            <div>
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={(event) => handleMenuOpen(event, row)}
                              >
                                Download
                              </Button>
                              <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleMenuClose}
                              >
                                <MenuItem
                                  onClick={() => handleDownloadClick("pdf")}
                                >
                                  PDF
                                </MenuItem>
                                <MenuItem
                                  onClick={() => handleDownloadClick("word")}
                                >
                                  Word
                                </MenuItem>
                              </Menu>
                            </div>
                          ) : value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
            </TableBody>
          </MuiTable>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  );
}

CompletedTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      minWidth: PropTypes.number.isRequired,
      align: PropTypes.string,
    })
  ).isRequired,
  rows: PropTypes.array,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  handleChangePage: PropTypes.func.isRequired,
  selectedRows: PropTypes.array.isRequired,
  setSelectedRows: PropTypes.func.isRequired,
  handleChangeRowsPerPage: PropTypes.func.isRequired,
  handleDownloadSelected: PropTypes.func.isRequired,
  projectName: PropTypes.string.isRequired,
  handleDownload: PropTypes.func.isRequired,
};

CompletedTable.defaultProps = {
  rows: [],
};

export default CompletedTable;
