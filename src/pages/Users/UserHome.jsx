// src/pages/Users/UserHome.jsx

import React from 'react';
import Sidebar from '../../components/ClientCompany/Sidebar';

const UserHome = ({ companyId }) => {
    return (
        <div className="flex">
            <Sidebar companyId={companyId} role={'user'} />
            <div className="flex-1 p-4">
                <h1 className="text-2xl font-bold">User Home for Company: {companyId}</h1>
            </div>
        </div>
    );
};

export default UserHome;

