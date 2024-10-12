
import React, { useState, useEffect } from "react";
import {
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { fetchAllCompanies,fetchClientCompanies } from "../../services/companyServices";
import { fetchUserCompletedFilesReport } from "../../services/reportServices";
import { exportToExcel } from "../../utils/exportExcel";
import { format } from "date-fns";
import FilterListOffRoundedIcon from "@mui/icons-material/FilterListOffRounded";
import { FilePageSum } from "../../utils/FilepageSum";

const UserReport = () => {
  const today = format(new Date().setHours(0, 0, 0, 0), "yyyy-MM-dd");
  // const oneDayBefore = new Date(today);
  // oneDayBefore.setDate(today.getDate() - 1);

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
    setCompletedDateRange({
      start: today,
      end: today,
    });
  };

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const companies = await fetchClientCompanies();
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
        const startDate = new Date(completedDateRange.start).setHours(
          0,
          0,
          0,
          0
        );
        const endDate = new Date(completedDateRange.end).setHours(0, 0, 0, 0);
        const data = await fetchUserCompletedFilesReport(
          selectedCompany,
          startDate,
          endDate
        );
        console.log(startDate);
        console.log(endDate);


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

  const totals = FilePageSum(filteredDetails);

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
        <table className="min-w-full bg-white border  my-10">
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
                  {data.totalFiles}
                </td>
                <td className="whitespace-nowrap px-6 py-2 font-medium text-center">
                  {data.totalPages}
                </td>
              </tr>
            ))}
            {/* Add the totals row */}
            <tr className="bg-gray-200 font-bold">
              <td className="whitespace-nowrap px-6 py-2 text-center">
                Totals
              </td>
              <td className="whitespace-nowrap px-6 py-2 text-center">
                {totals.totalFiles}
              </td>
              <td className="whitespace-nowrap px-6 py-2 text-center">
                {totals.totalPages}
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserReport;



// import React, { useState, useEffect } from "react";
// import {
//   fetchCompanyProjects,
//   fetchProjectFiles,
//   fetchUserNameById,
//   fetchClientCompanies,
// } from "../../utils/firestoreUtil";
// import {
//   MenuItem,
//   IconButton,
//   Select,
//   Button,
//   Collapse,
//   TextField,
//   FormControl,
//   InputLabel,
// } from "@mui/material";

// import { exportToExcel } from "../../utils/exportExcel";
// import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
// import ReplyIcon from "@mui/icons-material/Reply";
// import UserCompFileReport from "./UserCompFileReport";
// import FilterListOffRoundedIcon from "@mui/icons-material/FilterListOffRounded";
// import {fetchUserDetailedReport } from "../../services/reportServices";

// const UserReport = () => {
//   const [companies, setCompanies] = useState([]);
//   const [selectedCompany, setSelectedCompany] = useState("");
//   const [reportData, setReportData] = useState([]);
//   const [filteredData, setFilteredData] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [assignedDateRange, setAssignedDateRange] = useState({
//     start: "",
//     end: "",
//   });
//   const [completedDateRange, setCompletedDateRange] = useState({
//     start: "",
//     end: "",
//   });
//   // const [showFilters, setShowFilters] = useState(false);
//   const [showDetailedReport, setShowDetailedReport] = useState(true);

//   const toggleReport = () => {
//     setShowDetailedReport(!showDetailedReport);
//   };

//   const clearFilters = () => {
//     setAssignedDateRange({
//       start: "",
//       end: "",
//     });
//     setCompletedDateRange({
//       start: "",
//       end: "",
//     });
//   };

//   useEffect(() => {
//     const fetchCompanies = async () => {
//       try {
//         const companies = await fetchClientCompanies();
//         setCompanies(companies);
//       } catch (error) {
//         console.error("Error fetching companies:", error);
//       }
//     };
//     fetchCompanies();
//   }, []);



//   const handleCompanyChange = (event) => {
//     setSelectedCompany(event.target.value);
//   };


//   useEffect(() => {
//     if (selectedCompany) {
//       const fetchDetails = async () => {
//         setIsLoading(true);
//         try {
//           // const assignedStartDate = new Date(assignedDateRange.start);
//           // const assignedEndDate = new Date(assignedDateRange.end);

//           // const completedStartDate = new Date(completedDateRange.start);
//           // const completedEndDate = new Date(completedDateRange.end);
         
//           const details = await fetchUserDetailedReport(selectedCompany);
//           console.log(details);
//           setReportData(details);
//           setFilteredData(details);
//         } catch (error) {
//           console.error("Error fetching detailed file report:", error);
//         } finally {
//           setIsLoading(false);
//         }
//       };
//       fetchDetails();
//     }
//   }, [selectedCompany]);

//   // useEffect(() => {
//   //   applyFilters();
//   // }, [filters, fileDetails]);

//   // const handleCompanyChange = async (event) => {
//   //   const companyId = event.target.value;
//   //   setSelectedCompany(companyId);

//   //   if (companyId) {
//   //     setIsLoading(true);
//   //     try {
//         // const projects = await fetchCompanyProjects(companyId);
//         // let allFiles = [];

//         // // Fetch all files from all projects
//         // for (const project of projects) {
//         //   const projectFiles = await fetchProjectFiles(project.id);
//         //   allFiles = [...allFiles, ...projectFiles];
//         // }

//         // // Group files by assigned and completed dates
//         // const groupedData = await allFiles.reduce(async (accPromise, file) => {
//         //   const acc = await accPromise;

//         //   const assignedDate = file.kyro_assignedDate
//         //     ? file.kyro_assignedDate : null;
//         //   const completedDate = file.kyro_completedDate
//         //     ? file.kyro_completedDate
//         //     : null;
//         //   let userName = file.kyro_assignedTo || null;

//         //   if (userName) {
//         //     userName = await fetchUserNameById(userName);
//         //   }

//         //   if (assignedDate) {
//         //     if (!acc[assignedDate])
//         //       acc[assignedDate] = {
//         //         assignedFilesCount: 0,
//         //         assignedPageCount: 0,
//         //         completedFilesCount: 0,
//         //         completedPageCount: 0,
//         //         userName,
//         //       };
//         //     acc[assignedDate].assignedFilesCount += 1;
//         //     acc[assignedDate].assignedPageCount += file.pageCount || 0;
//         //   }

//         //   if (completedDate) {
//         //     if (!acc[completedDate])
//         //       acc[completedDate] = {
//         //         assignedFilesCount: 0,
//         //         assignedPageCount: 0,
//         //         completedFilesCount: 0,
//         //         completedPageCount: 0,
//         //         userName,
//         //       };
//         //     acc[completedDate].completedFilesCount += 1;
//         //     acc[completedDate].completedPageCount += file.pageCount || 0;
//         //   }

//         //   return acc;
//         // }, Promise.resolve({}));

//         // // Format the grouped data into an array
//         // const formattedData = Object.keys(groupedData).map((date) => ({
//         //   assignedDate: date, // Assign the correct date here
//         //   assignedFilesCount: groupedData[date].assignedFilesCount || 0,
//         //   assignedPageCount: groupedData[date].assignedPageCount || 0,
//         //   completedDate: date, // Assign the correct date here
//         //   completedFilesCount: groupedData[date].completedFilesCount || 0,
//         //   completedPageCount: groupedData[date].completedPageCount || 0,
//         //   userName: groupedData[date].userName,
//         // }));

//   //       setReportData(formattedData);
//   //       setFilteredData(formattedData);
//   //     } catch (err) {
//   //       setError(err.message);
//   //     } finally {
//   //       setIsLoading(false);
//   //     }
//   //   }
//   // };

//   const handleDateFilterChange = () => {
//     let filtered = reportData;

//     if (assignedDateRange.start && assignedDateRange.end) {
//       filtered = filtered.filter((data) => {
//         const assignedDate = new Date(data.assignedDate);
//         return (
//           assignedDate >= new Date(assignedDateRange.start) &&
//           assignedDate <= new Date(assignedDateRange.end)
//         );
//       });
//     }

//     if (completedDateRange.start && completedDateRange.end) {
//       filtered = filtered.filter((data) => {
//         const completedDate = new Date(data.completedDate);
//         return (
//           completedDate >= new Date(completedDateRange.start) &&
//           completedDate <= new Date(completedDateRange.end)
//         );
//       });
//     }

//     setFilteredData(filtered);
//   };

//   return (
//     <div className="container mx-auto p-4">
//       <button
//         className={`fixed animate-bounce right-6 top-11 px-6 py-3 text-white rounded-full flex items-center shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out transform hover:-translate-y-1 cursor-pointer ${showDetailedReport
//           ? "bg-gradient-to-l from-blue-500 to-purple-500"
//           : // : 'bg-green-500 border border-green-700'
//           "bg-gradient-to-r from-blue-500 to-purple-500"
//           }`}
//         onClick={toggleReport}
//       >
//         {showDetailedReport ? (
//           <>
//             {/* <Dashboard className="mr-2" /> */}
//             User Detailed Report
//             <ReplyIcon className="ml-2 scale-x-[-1]" />
//           </>
//         ) : (
//           <>
//             {/* <Description className="mr-2" /> */}
//             <ReplyIcon className="mr-2" />
//             User Report
//           </>
//         )}
//       </button>
//       {showDetailedReport ? (
//         <div className="w-full">
//           <UserCompFileReport />
//         </div>
//       ) : (
//         <div className="p-4">
//           <h1 className="text-2xl font-bold mb-4">Detailed User Report</h1>

//           {error && <div className="text-red-500 mb-4">{error}</div>}
//           <div className="mb-4 flex justify-between items-center w-full mt-14">
//             <FormControl sx={{ width: "30%" }}>
//               <InputLabel id="select-company-label">
//                 Select a Company
//               </InputLabel>
//               <Select
//                 labelId="select-company-label"
//                 id="select-company"
//                 value={selectedCompany}
//                 label="Select a Company"
//                 onChange={handleCompanyChange}
//               >
//                 <MenuItem value="" disabled>
//                   Select a Company
//                 </MenuItem>
//                 {companies.map((company) => (
//                   <MenuItem key={company.id} value={company.id}>
//                     {company.name}
//                   </MenuItem>
//                 ))}
//               </Select>
//             </FormControl>

//             {/* <div className="grid grid-cols-1 "> */}
//             <div className="flex flex-wrap space-x-8 justify-center -mt-6">
//               <div className="flex flex-col">
//                 <label
//                   className="block text-gray-700 text-sm font-bold mb-2 text-center"
//                   htmlFor="assignedDateRange"
//                 >
//                   Assigned Date Range
//                 </label>
//                 <div className="flex space-x-2">
//                   <input
//                     type="date"
//                     name="assignedStartDate"
//                     value={assignedDateRange.start}
//                     onChange={(e) =>
//                       setAssignedDateRange({
//                         ...assignedDateRange,
//                         start: e.target.value,
//                       })
//                     }
//                     className="block w-full pl-3 pr-3 py-2 border border-dashed border-[#02bbcc] rounded-3xl leading-5 backdrop-blur-sm shadow-md bg-white/30 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//                   />
//                   <input
//                     type="date"
//                     name="assignedEndDate"
//                     value={assignedDateRange.end}
//                     onChange={(e) =>
//                       setAssignedDateRange({
//                         ...assignedDateRange,
//                         end: e.target.value,
//                       })
//                     }
//                     className="block w-full pl-3 pr-3 py-2 border border-dashed border-[#02bbcc] rounded-3xl leading-5 backdrop-blur-sm shadow-md bg-white/30 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//                   />
//                 </div>
//               </div>

//               <div className="flex flex-col">
//                 <label
//                   className="block text-gray-700 text-sm font-bold mb-2 text-center"
//                   htmlFor="deliveryDateRange"
//                 >
//                   Delivery Date Range
//                 </label>
//                 <div className="flex space-x-2">
//                   <input
//                     type="date"
//                     name="deliveryStartDate"
//                     value={completedDateRange.start}
//                     onChange={(e) =>
//                       setCompletedDateRange({
//                         ...completedDateRange,
//                         start: e.target.value,
//                       })
//                     }
//                     className="block w-full pl-3 pr-3 py-2 border border-dashed border-[#02bbcc] rounded-3xl leading-5 backdrop-blur-sm shadow-md bg-white/30 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//                   />
//                   <input
//                     type="date"
//                     name="deliveryEndDate"
//                     value={completedDateRange.end}
//                     onChange={(e) =>
//                       setCompletedDateRange({
//                         ...completedDateRange,
//                         end: e.target.value,
//                       })
//                     }
//                     className="block w-full pl-3 pr-3 py-2 border border-dashed border-[#02bbcc] rounded-3xl leading-5 backdrop-blur-sm shadow-md bg-white/30 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//                   />
//                 </div>
//               </div>
//             </div>
//             {/* </div> */}
//             <div className="mt-4 my-auto flex flex-col gap-4">
//               <button
//               onClick={clearFilters}
//               className="my-auto py-2 rounded-3xl bg-[#e3d2fa] hover:bg-[#ffe0e3] hover:shadow-md"
//                         >
//               <FilterListOffRoundedIcon className="mr-2" />
//               Clear Filters
//                         </button>
//               <Button
//                 variant="outlined"
//                 onClick={() =>
//                   exportToExcel(filteredData, "detailed_user_Report")
//                 }
//               >
//                 Export to XLS
//               </Button>
//             </div>
//           </div>

//           {isLoading ? (
//             <div>Loading...</div>
//           ) : (
//             <div className="rounded-lg border border-gray-200">
//               <div className="overflow-x-auto rounded-t-lg rounded-b-lg">
//                 <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
//                   <thead>
//                     <tr className="bg-[#6c7ae0] text-white">
//                       <th className="whitespace-nowrap px-6 py-2 font-medium">
//                         Assigned Date
//                       </th>
//                       <th className="whitespace-nowrap px-6 py-2 font-medium">
//                         Assigned Files
//                       </th>
//                       <th className="whitespace-nowrap px-6 py-2 font-medium">
//                         Assigned Pages
//                       </th>
//                       <th className="whitespace-nowrap px-6 py-2 font-medium">
//                         Completed Date
//                       </th>
//                       <th className="whitespace-nowrap px-6 py-2 font-medium">
//                         Completed Files
//                       </th>
//                       <th className="whitespace-nowrap px-6 py-2 font-medium">
//                         Completed Pages
//                       </th>
//                       <th className="whitespace-nowrap px-6 py-2 font-medium">
//                         User Name
//                       </th>
//                     </tr>
//                   </thead>
//                   <tbody className="divide-y divide-gray-200 ">
//                     {filteredData.map((data, index) => (
//                       <tr
//                         key={index}
//                         className="even:bg-[#f0f2ff] odd:bg-white hover:bg-[#b6bffa]"
//                       >
//                         <td className="whitespace-nowrap px-6 py-2 font-medium">
//                           {data.assignedDate}
//                         </td>
//                         <td className="whitespace-nowrap px-6 py-2 font-medium">
//                           {data.assignedFiles}
//                         </td>
//                         <td className="whitespace-nowrap px-6 py-2 font-medium">
//                           {data.assignedPages}
//                         </td>
//                         <td className="whitespace-nowrap px-6 py-2 font-medium">
//                           {data.completedDate}
//                         </td>
//                         <td className="whitespace-nowrap px-6 py-2 font-medium">
//                           {data.completedFiles}
//                         </td>
//                         <td className="whitespace-nowrap px-6 py-2 font-medium">
//                           {data.completedPages}
//                         </td>
//                         <td className="whitespace-nowrap px-6 py-2 font-medium">
//                           {data.userName}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default UserReport;



