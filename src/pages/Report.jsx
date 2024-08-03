import { fetchAllCompanies, fetchReportDetails } from '../utils/firestoreUtil';
import React, { useState, useEffect } from 'react';
import { TextField, Button, CircularProgress } from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import * as XLSX from 'xlsx';

const Report = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState("");
  const [reportDetails, setReportDetails] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

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
    if (selectedCompany && startDate && endDate) {
      const fetchDetails = async () => {
        setIsLoading(true);
        try {
          const details = await fetchReportDetails(selectedCompany, startDate, endDate);
          setReportDetails(details);
        } catch (error) {
          console.error("Error fetching report details:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchDetails();
    }
  }, [selectedCompany, startDate, endDate]);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(reportDetails);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
    XLSX.writeFile(workbook, "report.xlsx");
  };

  return (
    <div className="p-6">
      <h1 className='p-4 text-2xl font-bold font-serif text-center tracking-wider leading-6'>DAILY REPORT</h1>
      <div className="mb-4">
        <label htmlFor="company" className="block text-sm font-medium text-gray-700">Select Company</label>
        <select
          id="company"
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
        >
          <option value="">Select a company</option>
          {companies.map(company => (
            <option key={company.id} value={company.id}>{company.name}</option>
          ))}
        </select>
      </div>

      <div className='flex space-x-4'>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Start Date</label>
          <DatePicker
            selected={startDate}
            onChange={(date) => setStartDate(date)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">End Date</label>
          <DatePicker
            selected={endDate}
            onChange={(date) => setEndDate(date)}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <CircularProgress />
        </div>
      ) : (
        <>
          <table className="min-w-full divide-y divide-gray-200 mb-4">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File Count</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Page Count</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportDetails.map((detail, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">{detail.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{detail.fileCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{detail.pageCount}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <Button variant="contained" color="primary" onClick={exportToExcel}>
            Export to XLS
          </Button>
        </>
      )}
    </div>
  );
};

export default Report;
