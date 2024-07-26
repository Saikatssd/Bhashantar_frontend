import { server } from '../../main'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import { Link } from 'react-router-dom';

const SuperAdminHome = () => {
    const [companies, setCompanies] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newCompanyName, setNewCompanyName] = useState('');

    const createCompany = async () => {
        try {
            const response = await axios.post(`${server}/api/company/createCompany`, {
                name: newCompanyName,
            }, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            setCompanies([...companies, response.data]);
            setIsModalOpen(false);
            setNewCompanyName('');
        } catch (err) {
            console.error('Error creating company:', err);
        }
    };

    useEffect(() => {
        const fetchCompanies = async () => {
            setIsLoading(true);
            try {
                const response = await axios.get(`${server}/api/company`);
                setCompanies(response.data);
            } catch (err) {
                setError(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCompanies();
    }, []);

    return (
        <div className="flex justify-center items-center p-20">
            {isLoading && <p>Loading companies...</p>}
            {error && <p>Error fetching companies: {error.message}</p>}
            {!isLoading && !error && (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-4 p-4">
                    {companies.map((company) => (
                        <Link to={`/company/${company.id}`} key={company.id}>
                            <div
                                className="company-box relative p-6 max-w-sm bg-gradient-to-r from-purple-600 via-indigo-500 to-blue-500 rounded-lg shadow-lg transition-transform transform hover:scale-105"
                            >
                                <div className="folder-tab bg-white p-2 rounded-t-lg absolute -top-3 -left-3"></div>
                                <div className="p-4 text-center text-white text-lg font-semibold">
                                    {company.name}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            <Fab
                variant="extended"
                color="info"
                size="large"
                sx={{ position: 'fixed', bottom: 25, right: 16, width: '250px', height: '70px', fontSize: '18px' }}
                onClick={() => setIsModalOpen(true)}
            >
                <AddIcon sx={{ mr: 1 }} />
                New Company
            </Fab>

            {isModalOpen && (
                <Dialog className="relative z-10" open={isModalOpen} onClose={() => setIsModalOpen(false)}>
                    <DialogBackdrop
                        transition
                        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in"
                    />

                    <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
                        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                            <DialogPanel
                                transition
                                className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all data-[closed]:translate-y-4 data-[closed]:opacity-0 data-[enter]:duration-300 data-[leave]:duration-200 data-[enter]:ease-out data-[leave]:ease-in sm:my-8 sm:w-full sm:max-w-lg data-[closed]:sm:translate-y-0 data-[closed]:sm:scale-95"
                            >
                                <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                    <div className="sm:flex sm:items-start">
                                        <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                                            <DialogTitle as="h3" className="text-base font-semibold leading-6 text-gray-900">
                                                Create New Company
                                            </DialogTitle>
                                            <div className="mt-2">
                                                <input
                                                    type="text"
                                                    className="mt-4 p-4 block rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                                    placeholder="New Company Name"
                                                    value={newCompanyName}
                                                    onChange={(e) => setNewCompanyName(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                    <button
                                        type="button"
                                        className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                                        onClick={createCompany}
                                    >
                                        Create
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                        onClick={() => setIsModalOpen(false)}
                                        data-autofocus
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </DialogPanel>
                        </div>
                    </div>
                </Dialog>
            )}
        </div>
    );
};

export default SuperAdminHome;
