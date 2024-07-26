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

// function Table({
//     columns,
//     rows = [],
//     page,
//     rowsPerPage,
//     handleChangePage,
//     handleChangeRowsPerPage,
// }) {
//     const navigate = useNavigate();

//     const handleEditClick = (projectId, documentId) => {
//         console.log('Navigating to editor with project ID:', projectId);
//         console.log('Navigating to editor with document ID:', documentId);
//         navigate(`/editor/${projectId}/${documentId}`);
//     };

//     return (
//         <div>
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
//                                                     ) : column.id === 'uploadedAt' && value ? (
//                                                         new Date(value).toString() !== 'Invalid Date' ? (
//                                                             new Date(value).toLocaleString()
//                                                         ) : (
//                                                             'Invalid Date'
//                                                         )
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



import React from 'react';
import PropTypes from 'prop-types';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TablePagination from '@mui/material/TablePagination';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import MuiTable from '@mui/material/Table';
import { useNavigate } from 'react-router-dom';

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return !isNaN(date.getTime()) ? date.toLocaleDateString() : 'Invalid Date';
};

function Table({
    columns,
    rows = [],
    page,
    rowsPerPage,
    handleChangePage,
    handleChangeRowsPerPage,
    projectName
}) {
    const navigate = useNavigate();

    const handleEditClick = (projectId, documentId) => {
        console.log('Navigating to editor with project ID:', projectId);
        console.log('Navigating to editor with document ID:', documentId);
        navigate(`/editor/${projectId}/${documentId}`);
    };

    return (
        <div>
            <h2 style={{ textAlign: "center", padding: "16px", fontWeight: "bold", fontSize: "24px" }}>
                {projectName}
            </h2>
            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                <TableContainer sx={{ maxHeight: 700 }}>
                    <MuiTable stickyHeader aria-label="sticky table">
                        <TableHead>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableCell
                                        key={column.id}
                                        align={column.align || 'left'}
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
                                        {columns.map((column) => {
                                            const value = row[column.id];
                                            return (
                                                <TableCell key={column.id} align={column.align || 'left'}>
                                                    {column.id === 'edit' ? (
                                                        <Button
                                                            variant="contained"
                                                            color="primary"
                                                            onClick={() => handleEditClick(row.projectId, row.id)}
                                                        >
                                                            Edit
                                                        </Button>
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
            // Add other fields that are part of the rows data
        })
    ),
    page: PropTypes.number.isRequired,
    rowsPerPage: PropTypes.number.isRequired,
    handleChangePage: PropTypes.func.isRequired,
    handleChangeRowsPerPage: PropTypes.func.isRequired,
};

Table.defaultProps = {
    rows: [],
};

export default Table;

