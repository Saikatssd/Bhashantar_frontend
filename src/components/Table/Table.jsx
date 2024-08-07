import React, { useEffect, useState } from "react";
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
import { useNavigate } from "react-router-dom";
import { formatDate } from "../../utils/formatDate";
import SearchIcon from "@mui/icons-material/Search"; // Ensure you have the icon imported
import { fetchUserNameById } from "../../utils/firestoreUtil";

function Table({
  columns,
  rows = [],
  page,
  rowsPerPage,
  handleChangePage,
  handleChangeRowsPerPage,
  projectName,
//   fetchUserNameById, // pass this as a prop to the component
}) {
  const [filteredDetails, setFilteredDetails] = useState(rows);
  const [filters, setFilters] = useState({
    searchQuery: "",
  });
  const [userNames, setUserNames] = useState({});

  useEffect(() => {
    const fetchUserNames = async () => {
      const userIds = rows.map((row) => row.kyro_assignedTo);
      const userNameMap = {};
      for (const userId of userIds) {
        const userName = await fetchUserNameById(userId);
        userNameMap[userId] = userName;
      }
      setUserNames(userNameMap);
    };

    fetchUserNames();
  }, [rows]);

  useEffect(() => {
    applyFilters();
  }, [filters, rows, userNames]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prevFilters) => ({
      ...prevFilters,
      [name]: value,
    }));
  };

  const applyFilters = () => {
    const filtered = rows.filter((file) => {
      const userName = userNames[file.kyro_assignedTo] || "";
      return filters.searchQuery
        ? file.name.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
            userName.toLowerCase().includes(filters.searchQuery.toLowerCase())
        : true;
    });
    setFilteredDetails(filtered);
  };

  const navigate = useNavigate();

  const handleEditClick = (projectId, documentId) => {
    console.log("Navigating to editor with project ID:", projectId);
    console.log("Navigating to editor with document ID:", documentId);
    navigate(`/editor/${projectId}/${documentId}`);
  };

  const calculateTotalPages = (rows) => {
    return rows.reduce((total, row) => {
      return total + (row.pageCount || 0);
    }, 0);
  };

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

      <div className="relative w-60 mb-4">
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
              {filteredDetails
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell
                          key={column.id}
                          align={column.align || "left"}
                        >
                          {column.id === "edit" ? (
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() =>
                                handleEditClick(row.projectId, row.id)
                              }
                            >
                              Edit
                            </Button>
                          ) : column.id.endsWith("Date") && value ? (
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
          count={filteredDetails.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  );
}

Table.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      minWidth: PropTypes.number.isRequired,
      align: PropTypes.string,
    })
  ).isRequired,
  rows: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      projectId: PropTypes.string.isRequired,
    })
  ),
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  handleChangePage: PropTypes.func.isRequired,
  handleChangeRowsPerPage: PropTypes.func.isRequired,
  fetchUserNameById: PropTypes.func.isRequired, // Add this prop type
};

Table.defaultProps = {
  rows: [],
};

export default Table;

// import React from 'react';
// import PropTypes from 'prop-types';
// import TableCell from '@mui/material/TableCell';
// import TableRow from '@mui/material/TableRow';
// import TableContainer from '@mui/material/TableContainer';
// import TableHead from '@mui/material/TableHead';
// import TableBody from '@mui/material/TableBody';
// import TablePagination from '@mui/material/TablePagination';
// import Button from '@mui/material/Button';
// import Paper from '@mui/material/Paper';
// import MuiTable from '@mui/material/Table';
// import { useNavigate } from 'react-router-dom';
// import { formatDate } from '../../utils/formatDate';

// // const formatDate = (dateString) => {
// //     if (!dateString) return 'N/A';
// //     const date = new Date(dateString);
// //     return !isNaN(date.getTime()) ? date.toLocaleDateString() : 'Invalid Date';
// // };

// function Table({
//     columns,
//     rows = [],
//     page,
//     rowsPerPage,
//     handleChangePage,
//     handleChangeRowsPerPage,
//     projectName
// }) {

//     const navigate = useNavigate();

//     const handleEditClick = (projectId, documentId) => {
//         console.log('Navigating to editor with project ID:', projectId);
//         console.log('Navigating to editor with document ID:', documentId);
//         navigate(`/editor/${projectId}/${documentId}`);
//     };

//     const calculateTotalPages = (rows) => {
//         return rows.reduce((total, row) => {
//             return total + (row.pageCount || 0);
//         }, 0);
//     };
//     return (
//         <div>
//             <h2 style={{ textAlign: "center", padding: "16px", fontWeight: "bold", fontSize: "24px" }}>
//                 {projectName}
//                 <span className="ml-4 text-lg font-normal text-gray-600">
//                     ({rows.length} files, {calculateTotalPages(rows)} pages)
//                 </span>
//             </h2>

//             <Paper sx={{ width: '100%', overflow: 'hidden' }}>
//                 <TableContainer sx={{ maxHeight: 700 }}>
//                     <MuiTable stickyHeader aria-label="sticky table">
//                         <TableHead>
//                             <TableRow>
//                                 {columns.map((column) => (
//                                     <TableCell
//                                         key={column.id}
//                                         align={column.align || 'left'}
//                                         style={{ minWidth: column.minWidth }}
//                                     >
//                                         {column.label}
//                                     </TableCell>
//                                 ))}
//                             </TableRow>
//                         </TableHead>
//                         <TableBody>
//                             {rows
//                                 .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
//                                 .map((row) => (
//                                     <TableRow hover role="checkbox" tabIndex={-1} key={row.id}>
//                                         {columns.map((column) => {
//                                             const value = row[column.id];
//                                             return (
//                                                 <TableCell key={column.id} align={column.align || 'left'}>
//                                                     {column.id === 'edit' ? (
//                                                         <Button
//                                                             variant="contained"
//                                                             color="primary"
//                                                             onClick={() => handleEditClick(row.projectId, row.id)}
//                                                         >
//                                                             Edit
//                                                         </Button>
//                                                     ) : column.id.endsWith('Date') && value ? (
//                                                         formatDate(value)
//                                                     ) : (
//                                                         value
//                                                     )}
//                                                 </TableCell>
//                                             );
//                                         })}
//                                     </TableRow>
//                                 ))}
//                         </TableBody>
//                     </MuiTable>
//                 </TableContainer>
//                 <TablePagination
//                     rowsPerPageOptions={[10, 25, 100]}
//                     component="div"
//                     count={rows.length}
//                     rowsPerPage={rowsPerPage}
//                     page={page}
//                     onPageChange={handleChangePage}
//                     onRowsPerPageChange={handleChangeRowsPerPage}
//                 />
//             </Paper>
//         </div>
//     );
// }

// Table.propTypes = {
//     columns: PropTypes.arrayOf(
//         PropTypes.shape({
//             id: PropTypes.string.isRequired,
//             label: PropTypes.string.isRequired,
//             minWidth: PropTypes.number.isRequired,
//             align: PropTypes.string,
//         })
//     ).isRequired,
//     rows: PropTypes.arrayOf(
//         PropTypes.shape({
//             id: PropTypes.string.isRequired,
//             projectId: PropTypes.string.isRequired,
//             // Add other fields that are part of the rows data
//         })
//     ),
//     page: PropTypes.number.isRequired,
//     rowsPerPage: PropTypes.number.isRequired,
//     handleChangePage: PropTypes.func.isRequired,
//     handleChangeRowsPerPage: PropTypes.func.isRequired,
// };

// Table.defaultProps = {
//     rows: [],
// };

// export default Table;
