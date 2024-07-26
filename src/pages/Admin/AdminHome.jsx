// src/pages/Admin/AdminHome.jsx

import React from 'react';
import Sidebar from '../../components/ClientCompany/Sidebar';

const AdminHome = ({ companyId }) => {
  return (
    <div className="flex">
      <Sidebar companyId={companyId} role={'admin'} />
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold">Admin Home for Company: {companyId}</h1>
      </div>
    </div>
  );
};

export default AdminHome;
