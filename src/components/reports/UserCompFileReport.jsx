// import React, { useState, useEffect } from 'react';
// import { Button, TextField, FormControl, InputLabel, Select, MenuItem, Collapse, IconButton } from '@mui/material';
// import { fetchAllCompanies, fetchCompanyProjects, fetchProjectFiles, fetchUserNameById } from '../../utils/firestoreUtil';
// import { formatDate } from '../../utils/formatDate';
// import FilterAltRoundedIcon from '@mui/icons-material/FilterAltRounded';
// import { exportToExcel } from '../../utils/exportExcel';

// const UserCompFileReport = () => {
//   const [companies, setCompanies] = useState([]);
//   const [selectedCompany, setSelectedCompany] = useState('');
//   const [projects, setProjects] = useState([]);
//   const [fileDetails, setFileDetails] = useState([]);
//   const [filteredDetails, setFilteredDetails] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState('');
//   const [completedDateRange, setCompletedDateRange] = useState({ start: '', end: '' });

//   useEffect(() => {
//     const fetchCompanies = async () => {
//       try {
//         const companies = await fetchAllCompanies();
//         setCompanies(companies);
//       } catch (error) {
//         console.error("Error fetching companies:", error);
//       }
//     };
//     fetchCompanies();
//   }, []);

//   useEffect(() => {
//     if (selectedCompany) {
//       const fetchDetails = async () => {
//         setIsLoading(true);
//         try {
//           const projects = await fetchCompanyProjects(selectedCompany);
//           setProjects(projects);

//           let allFiles = [];
//           for (const project of projects) {
//             const projectFiles = await fetchProjectFiles(project.id);
//             allFiles = [...allFiles, ...projectFiles];
//           }

//           const userFiles = {};
//           for (const file of allFiles) {
//             const completedDate = file.kyro_completedDate ? formatDate(file.kyro_completedDate) : null;
//             const userName = file.kyro_assignedTo ? await fetchUserNameById(file.kyro_assignedTo) : 'Unknown';

//             // Skip if userName is 'Unknown'
//             if (userName === 'Unknown') {
//               continue;
//             }

//             if (!userFiles[userName]) {
//               userFiles[userName] = { fileCount: 0, pageCount: 0 };
//             }

//             if (completedDate) {
//               userFiles[userName].fileCount += 1;
//               userFiles[userName].pageCount += file.pageCount || 0;
//             }
//           }

//           const formattedData = Object.keys(userFiles).map(userName => ({
//             userName,
//             fileCount: userFiles[userName].fileCount,
//             totalPages: userFiles[userName].pageCount,
//           }));

//           setFileDetails(formattedData);
//           setFilteredDetails(formattedData);
//         } catch (error) {
//           setError(error.message);
//         } finally {
//           setIsLoading(false);
//         }
//       };
//       fetchDetails();
//     }
//   }, [selectedCompany]);

//   const handleCompanyChange = (event) => {
//     setSelectedCompany(event.target.value);
//   };

//   const handleDateFilterChange = () => {
//     let filtered = fileDetails;

//     if (completedDateRange.start && completedDateRange.end) {
//       filtered = filtered.filter(data => {
//         const completedDate = new Date(data.completedDate);
//         return completedDate >= new Date(completedDateRange.start) && completedDate <= new Date(completedDateRange.end);
//       });
//     }

//     setFilteredDetails(filtered);
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <h1 className="text-2xl font-bold mb-4">User Report</h1>

//       {error && <div className="text-red-500 mb-4">{error}</div>}
//       <div className="mb-4 flex justify-between items-center w-full mt-14">
//           <FormControl sx={{ width: "30%" }} className="mb-4">
//             <InputLabel id="select-company-label">Select a Company</InputLabel>
//             <Select
//               labelId="select-company-label"
//               id="select-company"
//               value={selectedCompany}
//               label="Select a Company"
//               onChange={handleCompanyChange}
//             >
//               <MenuItem value="" disabled>Select a Company</MenuItem>
//               {companies.map(company => (
//                 <MenuItem key={company.id} value={company.id}>
//                   {company.name}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>
//           <div className="flex flex-wrap space-x-8 justify-center -mt-6">
//             <div className="flex flex-col">
//               <label
//                 className="block text-gray-700 text-sm font-bold mb-2 text-center"
//                 htmlFor="deliveryDateRange"
//               >
//                 Date Range
//               </label>
//               <div className="flex space-x-2">
//                 <input
//                   type="date"
//                   name="deliveryStartDate"
//                   value={completedDateRange.start}
//                   onChange={(e) => setCompletedDateRange({ ...completedDateRange, start: e.target.value })}
//                   className="block w-full pl-3 pr-3 py-2 border border-dashed border-[#02bbcc] rounded-3xl leading-5 backdrop-blur-sm shadow-md bg-white/30 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//                 />
//                 <input
//                   type="date"
//                   name="deliveryEndDate"
//                   value={completedDateRange.end}
//                   onChange={(e) => setCompletedDateRange({ ...completedDateRange, end: e.target.value })}
//                   className="block w-full pl-3 pr-3 py-2 border border-dashed border-[#02bbcc] rounded-3xl leading-5 backdrop-blur-sm shadow-md bg-white/30 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//                 />
//               </div>
//             </div>
//         </div>
//         <Button
//           variant="outlined"
//           onClick={() =>
//             exportToExcel(filteredDetails, "User_Report")
//           }
//         >
//           Export to XLS
//         </Button>
//       </div>

//       <Button variant="contained" color="primary" onClick={handleDateFilterChange} className="mb-4">Apply Filters</Button>

//       {isLoading ? (
//         <div>Loading...</div>
//       ) : (
//         <table className="min-w-full bg-white border my-10">
//           <thead>
//             <tr className="bg-[#6c7ae0] text-white">
//               <th className="whitespace-nowrap px-6 py-2 font-medium">User Name</th>
//               <th className="whitespace-nowrap px-6 py-2 font-medium">Completed Files</th>
//               <th className="whitespace-nowrap px-6 py-2 font-medium">Completed Pages</th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-200 ">
//             {filteredDetails.map((data, index) => (
//               <tr key={index} className="even:bg-[#f0f2ff] odd:bg-white hover:bg-[#b6bffa]">
//                 <td className="whitespace-nowrap px-6 py-2 font-medium  text-center">{data.userName}</td>
//                 <td className="whitespace-nowrap px-6 py-2 font-medium text-center">{data.fileCount}</td>
//                 <td className="whitespace-nowrap px-6 py-2 font-medium text-center">{data.totalPages}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}
//     </div>
//   );
// };

// export default UserCompFileReport;

import React, { useState, useEffect } from "react";
import {
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { fetchAllCompanies } from "../../utils/firestoreUtil";
import { fetchUserCompletedFilesReport } from "../../services/reportServices";
import { exportToExcel } from "../../utils/exportExcel";
import { format } from "date-fns";
import FilterListOffRoundedIcon from "@mui/icons-material/FilterListOffRounded";

const UserCompFileReport = () => {
  const today = format(new Date(), "yyyy-MM-dd");

  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [fileDetails, setFileDetails] = useState([]);
  const [filteredDetails, setFilteredDetails] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [completedDateRange, setCompletedDateRange] = useState({
    start: today,
    end: today,
  });

  const clearFilters = () => {
    setCompletedDateRange( {start: today,
      end: today,});
  };

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
    const fetchDetails = async () => {
      if (
        !selectedCompany ||
        !completedDateRange.start ||
        !completedDateRange.end
      )
        return;

      setIsLoading(true);
      try {
        const startDate = new Date(completedDateRange.start);
        const endDate = new Date(completedDateRange.end);
        const data = await fetchUserCompletedFilesReport(
          selectedCompany,
          startDate,
          endDate
        );

        setFileDetails(data);
        setFilteredDetails(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
  }, [selectedCompany, completedDateRange]);

  const handleCompanyChange = (event) => {
    setSelectedCompany(event.target.value);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">User Report</h1>

      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="mb-4 flex justify-between items-center w-full mt-14">
        <FormControl sx={{ width: "30%" }} className="mb-4">
          <InputLabel id="select-company-label">Select a Company</InputLabel>
          <Select
            labelId="select-company-label"
            id="select-company"
            value={selectedCompany}
            label="Select a Company"
            onChange={handleCompanyChange}
          >
            <MenuItem value="" disabled>
              Select a Company
            </MenuItem>
            {companies.map((company) => (
              <MenuItem key={company.id} value={company.id}>
                {company.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <div className="flex flex-wrap space-x-8 justify-center -mt-6">
          <div className="flex flex-col">
            <label
              className="block text-gray-700 text-sm font-bold mb-2 text-center"
              htmlFor="completedDateRange"
            >
              Date Range
            </label>
            <div className="flex space-x-2">
              <input
                type="date"
                name="completedStartDate"
                value={completedDateRange.start}
                onChange={(e) =>
                  setCompletedDateRange({
                    ...completedDateRange,
                    start: e.target.value,
                  })
                }
                className="block w-full pl-3 pr-3 py-2 border border-dashed border-[#02bbcc] rounded-3xl leading-5 backdrop-blur-sm shadow-md bg-white/30 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              <input
                type="date"
                name="completedEndDate"
                value={completedDateRange.end}
                onChange={(e) =>
                  setCompletedDateRange({
                    ...completedDateRange,
                    end: e.target.value,
                  })
                }
                className="block w-full pl-3 pr-3 py-2 border border-dashed border-[#02bbcc] rounded-3xl leading-5 backdrop-blur-sm shadow-md bg-white/30 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
        <div className="mt-4 my-auto flex flex-col gap-4">
          <button
            onClick={clearFilters}
            className="my-auto py-2 rounded-3xl bg-[#e3d2fa] hover:bg-[#ffe0e3] hover:shadow-md"
          >
            <FilterListOffRoundedIcon className="mr-2" />
            Clear Filters
          </button>
          <Button
            variant="outlined"
            onClick={() => exportToExcel(filteredDetails, "User_Report")}
          >
            Export to XLS
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div>Loading...</div>
      ) : (
        <table className="min-w-full bg-white border my-10">
          <thead>
            <tr className="bg-[#6c7ae0] text-white">
              <th className="whitespace-nowrap px-6 py-2 font-medium">
                User Name
              </th>
              <th className="whitespace-nowrap px-6 py-2 font-medium">
                Completed Files
              </th>
              <th className="whitespace-nowrap px-6 py-2 font-medium">
                Completed Pages
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 ">
            {filteredDetails.map((data, index) => (
              <tr
                key={index}
                className="even:bg-[#f0f2ff] odd:bg-white hover:bg-[#b6bffa]"
              >
                <td className="whitespace-nowrap px-6 py-2 font-medium  text-center">
                  {data.userName}
                </td>
                <td className="whitespace-nowrap px-6 py-2 font-medium text-center">
                  {data.fileCount}
                </td>
                <td className="whitespace-nowrap px-6 py-2 font-medium text-center">
                  {data.totalPages}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserCompFileReport;
