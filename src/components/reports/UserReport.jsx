import React, { useState, useEffect } from "react";
import {
  fetchCompanyProjects,
  fetchProjectFiles,
  fetchUserNameById,
  fetchAllCompanies,
} from "../../utils/firestoreUtil";
import {
  MenuItem,
  IconButton,
  Select,
  Button,
  Collapse,
  TextField,
  FormControl,
  InputLabel,
} from "@mui/material";

import { exportToExcel } from "../../utils/exportExcel";
import FilterAltRoundedIcon from "@mui/icons-material/FilterAltRounded";
import ReplyIcon from "@mui/icons-material/Reply";
import UserCompFileReport from "./UserCompFileReport";

const UserReport = () => {
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [reportData, setReportData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [assignedDateRange, setAssignedDateRange] = useState({
    start: "",
    end: "",
  });
  const [completedDateRange, setCompletedDateRange] = useState({
    start: "",
    end: "",
  });
  // const [showFilters, setShowFilters] = useState(false);
  const [showDetailedReport, setShowDetailedReport] = useState(true);

  const toggleReport = () => {
    setShowDetailedReport(!showDetailedReport);
  };

  useEffect(() => {
    const fetchCompanies = async () => {
      const companiesData = await fetchAllCompanies();
      setCompanies(companiesData);
    };
    fetchCompanies();
  }, []);

  const handleCompanyChange = async (event) => {
    const companyId = event.target.value;
    setSelectedCompany(companyId);

    if (companyId) {
      setIsLoading(true);
      try {
        const projects = await fetchCompanyProjects(companyId);
        let allFiles = [];

        // Fetch all files from all projects
        for (const project of projects) {
          const projectFiles = await fetchProjectFiles(project.id);
          allFiles = [...allFiles, ...projectFiles];
        }

        // Group files by assigned and completed dates
        const groupedData = await allFiles.reduce(async (accPromise, file) => {
          const acc = await accPromise;

          const assignedDate = file.kyro_assignedDate
            ? file.kyro_assignedDate : null;
          const completedDate = file.kyro_completedDate
            ? file.kyro_completedDate
            : null;
          let userName = file.kyro_assignedTo || null;

          if (userName) {
            userName = await fetchUserNameById(userName);
          }

          if (assignedDate) {
            if (!acc[assignedDate])
              acc[assignedDate] = {
                assignedFilesCount: 0,
                assignedPageCount: 0,
                completedFilesCount: 0,
                completedPageCount: 0,
                userName,
              };
            acc[assignedDate].assignedFilesCount += 1;
            acc[assignedDate].assignedPageCount += file.pageCount || 0;
          }

          if (completedDate) {
            if (!acc[completedDate])
              acc[completedDate] = {
                assignedFilesCount: 0,
                assignedPageCount: 0,
                completedFilesCount: 0,
                completedPageCount: 0,
                userName,
              };
            acc[completedDate].completedFilesCount += 1;
            acc[completedDate].completedPageCount += file.pageCount || 0;
          }

          return acc;
        }, Promise.resolve({}));

        // Format the grouped data into an array
        const formattedData = Object.keys(groupedData).map((date) => ({
          assignedDate: date, // Assign the correct date here
          assignedFilesCount: groupedData[date].assignedFilesCount || 0,
          assignedPageCount: groupedData[date].assignedPageCount || 0,
          completedDate: date, // Assign the correct date here
          completedFilesCount: groupedData[date].completedFilesCount || 0,
          completedPageCount: groupedData[date].completedPageCount || 0,
          userName: groupedData[date].userName,
        }));

        setReportData(formattedData);
        setFilteredData(formattedData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDateFilterChange = () => {
    let filtered = reportData;

    if (assignedDateRange.start && assignedDateRange.end) {
      filtered = filtered.filter((data) => {
        const assignedDate = new Date(data.assignedDate);
        return (
          assignedDate >= new Date(assignedDateRange.start) &&
          assignedDate <= new Date(assignedDateRange.end)
        );
      });
    }

    if (completedDateRange.start && completedDateRange.end) {
      filtered = filtered.filter((data) => {
        const completedDate = new Date(data.completedDate);
        return (
          completedDate >= new Date(completedDateRange.start) &&
          completedDate <= new Date(completedDateRange.end)
        );
      });
    }

    setFilteredData(filtered);
  };

  return (
    <div className="container mx-auto p-4">
      <button
        className={`fixed animate-bounce right-6 top-11 px-6 py-3 text-white rounded-full flex items-center shadow-md hover:shadow-lg transition-shadow duration-300 ease-in-out transform hover:-translate-y-1 cursor-pointer ${showDetailedReport
          ? "bg-gradient-to-l from-blue-500 to-purple-500"
          : // : 'bg-green-500 border border-green-700'
          "bg-gradient-to-r from-blue-500 to-purple-500"
          }`}
        onClick={toggleReport}
      >
        {showDetailedReport ? (
          <>
            {/* <Dashboard className="mr-2" /> */}
            User Detailed Report
            <ReplyIcon className="ml-2 scale-x-[-1]" />
          </>
        ) : (
          <>
            {/* <Description className="mr-2" /> */}
            <ReplyIcon className="mr-2" />
            User Report
          </>
        )}
      </button>
      {showDetailedReport ? (
        <div className="w-full">
          <UserCompFileReport />
        </div>
      ) : (
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Detailed User Report</h1>

          {error && <div className="text-red-500 mb-4">{error}</div>}
          <div className="mb-4 flex justify-between items-center w-full mt-14">
            <FormControl sx={{ width: "30%" }}>
              <InputLabel id="select-company-label">
                Select a Company
              </InputLabel>
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

            {/* <div className="grid grid-cols-1 "> */}
            <div className="flex flex-wrap space-x-8 justify-center -mt-6">
              <div className="flex flex-col">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2 text-center"
                  htmlFor="assignedDateRange"
                >
                  Assigned Date Range
                </label>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    name="assignedStartDate"
                    value={assignedDateRange.start}
                    onChange={(e) =>
                      setAssignedDateRange({
                        ...assignedDateRange,
                        start: e.target.value,
                      })
                    }
                    className="block w-full pl-3 pr-3 py-2 border border-dashed border-[#02bbcc] rounded-3xl leading-5 backdrop-blur-sm shadow-md bg-white/30 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                  <input
                    type="date"
                    name="assignedEndDate"
                    value={assignedDateRange.end}
                    onChange={(e) =>
                      setAssignedDateRange({
                        ...assignedDateRange,
                        end: e.target.value,
                      })
                    }
                    className="block w-full pl-3 pr-3 py-2 border border-dashed border-[#02bbcc] rounded-3xl leading-5 backdrop-blur-sm shadow-md bg-white/30 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2 text-center"
                  htmlFor="deliveryDateRange"
                >
                  Delivery Date Range
                </label>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    name="deliveryStartDate"
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
                    name="deliveryEndDate"
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
            {/* </div> */}

            <Button
              variant="outlined"
              onClick={() =>
                exportToExcel(filteredData, "detailed_user_Report")
              }
            >
              Export to XLS
            </Button>
          </div>

          <Button
            variant="contained"
            color="primary"
            onClick={handleDateFilterChange}
            className="mb-4"
          >
            Apply Filters
          </Button>

          {isLoading ? (
            <div>Loading...</div>
          ) : (
            <div className="rounded-lg border border-gray-200">
              <div className="overflow-x-auto rounded-t-lg rounded-b-lg">
                <table className="min-w-full divide-y-2 divide-gray-200 bg-white text-sm">
                  <thead>
                    <tr className="bg-[#6c7ae0] text-white">
                      <th className="whitespace-nowrap px-6 py-2 font-medium">
                        Assigned Date
                      </th>
                      <th className="whitespace-nowrap px-6 py-2 font-medium">
                        Assigned Files Count
                      </th>
                      <th className="whitespace-nowrap px-6 py-2 font-medium">
                        Assigned Page Count
                      </th>
                      <th className="whitespace-nowrap px-6 py-2 font-medium">
                        Completed Date
                      </th>
                      <th className="whitespace-nowrap px-6 py-2 font-medium">
                        Completed Files Count
                      </th>
                      <th className="whitespace-nowrap px-6 py-2 font-medium">
                        Completed Page Count
                      </th>
                      <th className="whitespace-nowrap px-6 py-2 font-medium">
                        User Name
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 ">
                    {filteredData.map((data, index) => (
                      <tr
                        key={index}
                        className="even:bg-[#f0f2ff] odd:bg-white hover:bg-[#b6bffa]"
                      >
                        <td className="whitespace-nowrap px-6 py-2 font-medium">
                          {data.assignedDate}
                        </td>
                        <td className="whitespace-nowrap px-6 py-2 font-medium">
                          {data.assignedFilesCount}
                        </td>
                        <td className="whitespace-nowrap px-6 py-2 font-medium">
                          {data.assignedPageCount}
                        </td>
                        <td className="whitespace-nowrap px-6 py-2 font-medium">
                          {data.completedDate}
                        </td>
                        <td className="whitespace-nowrap px-6 py-2 font-medium">
                          {data.completedFilesCount}
                        </td>
                        <td className="whitespace-nowrap px-6 py-2 font-medium">
                          {data.completedPageCount}
                        </td>
                        <td className="whitespace-nowrap px-6 py-2 font-medium">
                          {data.userName}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserReport;
