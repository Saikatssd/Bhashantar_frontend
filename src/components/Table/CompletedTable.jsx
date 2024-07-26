// import React from "react";
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

// function CompletedTable({
//     columns,
//     rows = [],
//     page,
//     rowsPerPage,
//     handleChangePage,
//     handleChangeRowsPerPage,
//     handleDownloadClick,
// }) {
//     return (
//         <div>
//             <Paper sx={{ width: "100%", overflow: "hidden" }}>
//                 <TableContainer sx={{ maxHeight: 700 }}>
//                     <MuiTable stickyHeader aria-label="sticky table">
//                         <TableHead>
//                             <TableRow>
//                                 {columns.map((column) => (
//                                     <TableCell
//                                         key={column.id}
//                                         align={column.align || "left"}
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
//                                                 <TableCell
//                                                     key={column.id}
//                                                     align={column.align || "left"}
//                                                 >
//                                                     {column.id === "download" ? (
//                                                         <div>
//                                                             <Button
//                                                                 variant="contained"
//                                                                 color="primary"
//                                                                 onClick={() => handleDownloadClick(row.id, 'pdf')}
//                                                                 sx={{ marginRight: "5px" }}
//                                                             >
//                                                                 PDF
//                                                             </Button>
//                                                             <Button
//                                                                 variant="contained"
//                                                                 color="primary"
//                                                                 onClick={() => handleDownloadClick(row.id, 'doc')}
//                                                             >
//                                                                 DOC
//                                                             </Button>
//                                                         </div>
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

// CompletedTable.propTypes = {
//     columns: PropTypes.arrayOf(
//         PropTypes.shape({
//             id: PropTypes.string.isRequired,
//             label: PropTypes.string.isRequired,
//             minWidth: PropTypes.number.isRequired,
//             align: PropTypes.string,
//         })
//     ).isRequired,
//     rows: PropTypes.array,
//     page: PropTypes.number.isRequired,
//     rowsPerPage: PropTypes.number.isRequired,
//     handleChangePage: PropTypes.func.isRequired,
//     handleChangeRowsPerPage: PropTypes.func.isRequired,
//     handleDownloadClick: PropTypes.func.isRequired,
// };

// CompletedTable.defaultProps = {
//     rows: [],
// };

// export default CompletedTable;



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
import Checkbox from "@mui/material/Checkbox";
// import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import DownloadIcon from '@mui/icons-material/Download';
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return !isNaN(date.getTime()) ? date.toLocaleDateString() : 'Invalid Date';
};

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
    handleEditClick,
    projectName,
}) {

    const handleCheckboxClick = (event, id) => {
        if (event.target.checked) {
            setSelectedRows([...selectedRows, id]);
        } else {
            setSelectedRows(selectedRows.filter(rowId => rowId !== id));
        }
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
            </h2>
            <div className="flex justify-between items-center mb-4 px-4">

                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleDownloadSelected}
                    disabled={selectedRows.length === 0}
                >
                    <DownloadIcon  className="text-white text-lg mx-1"/>
                    Download Selected
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
                                                                onClick={() =>
                                                                    handleEditClick &&
                                                                    handleEditClick(row.projectId, row.id, row.name)
                                                                }
                                                            >
                                                                Download
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
    setSelectedRows: PropTypes.func.isRequired, handleChangeRowsPerPage: PropTypes.func.isRequired,
    handleDownloadSelected: PropTypes.func.isRequired,
    projectName: PropTypes.string.isRequired,
};

CompletedTable.defaultProps = {
    rows: [],
    handleEditClick: null,
};

export default CompletedTable;
