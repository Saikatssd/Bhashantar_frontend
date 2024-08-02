import React from "react";
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


// const formatDate = (dateString) => {
//   const date = new Date(dateString);
//   return date.toString() !== 'Invalid Date' ? date.toLocaleDateString() : 'Invalid Date';
// };

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return !isNaN(date.getTime()) ? date.toLocaleDateString() : 'Invalid Date';
};

const calculateTotalPages = (rows) => {
  return rows.reduce((total, row) => {
      return total + (row.pageCount || 0);
  }, 0);
};


function TableUpload({
  columns,
  rows = [],
  page,
  rowsPerPage,
  handleChangePage,
  handleChangeRowsPerPage,
  handleEditClick,
  projectName,
}) {
  return (
    <div>
      <h2
        style={{
          textAlign: "center",
          padding: "16px",
          fontWeight: "bold",
          fontSize: "24px",
        }}
      >
        {projectName}
       <span className="ml-4 text-lg font-normal text-gray-600">
            ({rows.length} files, {calculateTotalPages(rows)} pages)
          </span>
      </h2>
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: 700 }}>
          <MuiTable stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
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
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell
                          key={column.id}
                          align={column.align || "left"}
                        >
                          {column.id === "edit" ? (
                            <div>
                             
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={() =>
                                  handleEditClick &&
                                  handleEditClick(row.id, row.name)
                                }
                              >
                                Delete
                              </Button>
                            </div>
                           ) : column.id.endsWith('Date') && value ? (
                            formatDate(value)
                        ) : (
                            value
                        )}
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

TableUpload.propTypes = {
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
  handleChangeRowsPerPage: PropTypes.func.isRequired,
  handleEditClick: PropTypes.func,
  projectName: PropTypes.string.isRequired,
};

TableUpload.defaultProps = {
  rows: [],
  handleEditClick: null,
};

export default TableUpload;
