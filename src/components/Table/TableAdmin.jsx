// import React, { useState, useEffect } from "react";
// import PropTypes from "prop-types";
// import TableCell from "@mui/material/TableCell";
// import TableRow from "@mui/material/TableRow";
// import TableContainer from "@mui/material/TableContainer";
// import TableHead from "@mui/material/TableHead";
// import TableBody from "@mui/material/TableBody";
// import TablePagination from "@mui/material/TablePagination";
// import Button from "@mui/material/Button";
// import Paper from "@mui/material/Paper";
// import MuiTable from "@mui/material/Table";
// import { fetchProjectFilesCount, fetchTotalPagesInProject } from "../../utils/firestoreUtil";

// const formatDate = (dateString) => {
//   if (!dateString) return 'N/A';
//   const date = new Date(dateString);
//   return !isNaN(date.getTime()) ? date.toLocaleDateString() : 'Invalid Date';
// };

// function TableAdmin({
//   columns,
//   rows = [],
//   page,
//   rowsPerPage,
//   handleChangePage,
//   handleChangeRowsPerPage,
//   handleEditClick,
//   selectedRows,
//   setSelectedRows,
//   projectName,
//   projectId,
//   status
// }) {
//   const [fileCount, setFileCount] = useState(0);
//   const [totalPages, setTotalPages] = useState(0);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true);
//       try {
//         const [count, pages] = await Promise.all([
//           fetchProjectFilesCount(status, projectId),
//           fetchTotalPagesInProject(status, projectId)
//         ]);
//         setFileCount(count);
//         setTotalPages(pages);
//       } catch (error) {
//         console.error(error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (projectId && status) {
//       fetchData();
//     }
//   }, [projectId, status]);

//   return (
//     <div>
//       <h2 className="text-center py-4 font-bold text-2xl">
//         {projectName}
//         {!loading && (
//           <span className="ml-4 text-lg font-normal text-gray-600">
//             ({fileCount} files, {totalPages} pages)
//           </span>
//         )}
//       </h2>
//       <Paper sx={{ width: "100%", overflow: "hidden" }}>
//         <TableContainer sx={{ maxHeight: 700 }}>
//           <MuiTable stickyHeader aria-label="sticky table">
//             <TableHead>
//               <TableRow>
//                 {columns.map((column) => (
//                   <TableCell
//                     key={column.id}
//                     align={column.align || "left"}
//                     style={{ minWidth: column.minWidth }}
//                   >
//                     {column.label}
//                   </TableCell>
//                 ))}
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {rows
//                 .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
//                 .map((row, index) => (
//                   <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
//                     {columns.map((column) => {
//                       const value = row[column.id];
//                       return (
//                         <TableCell
//                           key={column.id}
//                           align={column.align || "left"}
//                         >
//                           {column.id === "edit" ? (
//                             <div>
//                               <Button
//                                 variant="contained"
//                                 color="primary"
//                                 onClick={() =>
//                                   handleEditClick &&
//                                   handleEditClick(row.id, row.name)
//                                 }
//                               >
//                                 Assign
//                               </Button>
//                             </div>
//                           ) : column.id.endsWith('Date') && value ? (
//                             formatDate(value)
//                           ) : (
//                             value
//                           )}
//                         </TableCell>
//                       );
//                     })}
//                   </TableRow>
//                 ))}
//             </TableBody>
//           </MuiTable>
//         </TableContainer>
//         <TablePagination
//           rowsPerPageOptions={[10, 25, 100]}
//           component="div"
//           count={rows.length}
//           rowsPerPage={rowsPerPage}
//           page={page}
//           onPageChange={handleChangePage}
//           onRowsPerPageChange={handleChangeRowsPerPage}
//         />
//       </Paper>
//     </div>
//   );
// }

// TableAdmin.propTypes = {
//   columns: PropTypes.arrayOf(
//     PropTypes.shape({
//       id: PropTypes.string.isRequired,
//       label: PropTypes.string.isRequired,
//       minWidth: PropTypes.number.isRequired,
//       align: PropTypes.string,
//     })
//   ).isRequired,
//   rows: PropTypes.array,
//   page: PropTypes.number.isRequired,
//   rowsPerPage: PropTypes.number.isRequired,
//   handleChangePage: PropTypes.func.isRequired,
//   handleChangeRowsPerPage: PropTypes.func.isRequired,
//   handleEditClick: PropTypes.func,
//   projectName: PropTypes.string.isRequired,
//   projectId: PropTypes.string.isRequired,
//   status: PropTypes.string.isRequired,
// };

// TableAdmin.defaultProps = {
//   rows: [],
//   handleEditClick: null,
// };

// export default TableAdmin;


import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableBody from "@mui/material/TableBody";
import TablePagination from "@mui/material/TablePagination";
import Checkbox from "@mui/material/Checkbox";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import MuiTable from "@mui/material/Table";
import { fetchProjectFilesCount, fetchTotalPagesInProject } from "../../utils/firestoreUtil";

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

function TableAdmin({
  columns,
  rows = [],
  page,
  rowsPerPage,
  handleChangePage,
  handleChangeRowsPerPage,
  handleEditClick,
  // handleAssignSelected,
  selectedRows,
  setSelectedRows,
  projectName,
  projectId,
  status
}) {
  const [fileCount, setFileCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [count, pages] = await Promise.all([
          fetchProjectFilesCount(status, projectId),
          fetchTotalPagesInProject(status, projectId)
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
      setSelectedRows(selectedRows.filter(rowId => rowId !== id));
    }
  };

  const selectedRowsData = rows.filter(row => selectedRows.includes(row.id));
  const totalSelectedPages = calculateTotalPages(selectedRowsData);

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
        {selectedRows.length > 0 && (
          <span>{selectedRows.length} selected, {totalSelectedPages} pages</span>
        )}
        <Button
          variant="contained"
          color="primary"
          onClick={() => { handleEditClick()}}
          disabled={selectedRows.length === 0}
        >
          Assign Selected
        </Button>

      </div>
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: 700 }}>
          <MuiTable stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selectedRows.length > 0 && selectedRows.length < rows.length}
                    checked={rows.length > 0 && selectedRows.length === rows.length}
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
                .map((row) => (
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
                                Assign
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
          count={selectedRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  );
}

TableAdmin.propTypes = {
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
  selectedRows: PropTypes.array.isRequired,
  setSelectedRows: PropTypes.func.isRequired,
  projectName: PropTypes.string.isRequired,
  projectId: PropTypes.string.isRequired,

};

TableAdmin.defaultProps = {
  rows: [],
  handleEditClick: null,
};

export default TableAdmin;
