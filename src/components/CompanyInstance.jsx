import React from 'react';
import { useParams, Route, Routes } from 'react-router-dom';
import Sidebar from './ClientCompany/Sidebar';
import ProjectList from '../pages/ProjectList';
import PermissionsManage from '../pages/PemissionManage';
import RoleManage from '../pages/RoleManage';
import UserManage from '../pages/UserManage';
import UploadDocument from '../components/ClientCompany/UploadDocument';
import AdminFileFlow from './ClientCompany/AdminFileFlow';
import Profile from '../pages/Profile';
import UserFileFlow from './ClientCompany/UserFileFlow';
import UserFileAssign from './ClientCompany/UserFileAssign';


const CompanyInstance = ({ role }) => {
  const { companyId } = useParams();

  return (
    <div className="flex">
      <Sidebar companyId={companyId} role={role} />
      <div className="flex-grow">
        <Routes>
          <Route path="/profile" element={<Profile />} />
          <Route path="/myWork" element={<UserFileFlow />} />


          <Route path="project" element={<ProjectList />} />
          {role === 'user' && (
            <>
              <Route path="/project/:projectId" element={<UserFileAssign />} />
            </>
          )}


          {role !== 'user' && (
            <>
              {/* <Route path="project/:projectId" element={<AdminDocs />} /> */}
              <Route path="project/:projectId" element={<AdminFileFlow />} />
              <Route path="uploadDocument" element={<UploadDocument />} />
              <Route path="permissionManage" element={<PermissionsManage />} />
              <Route path="roleManage" element={<RoleManage />} />
              <Route path="userManage" element={<UserManage companyId={companyId} />} />


            </>
          )}
        </Routes>
      </div>
    </div>
  );
};

export default CompanyInstance;

