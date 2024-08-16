import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './utils/firebase';
import Login from './pages/auth/Login';
import DashboardWrapper from './components/DashboardWrapper';
import FileStatusManager from './components/FileStatusManager';
import KyroInstance from './components/Kyrotics/KyroInstance';
import CompanyInstance from './components/ClientCompany/CompanyInstance';
import Editor from './components/Editor';
import UserWorkspace from './components/ClientCompany/UserFileFlow';
import { AuthProvider } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import PrivateRoute from './components/common/PrivateRoute';
import FileReportUser from './components/reports/UserCompFileReport';

const App = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const token = await user.getIdTokenResult();
        user.roleName = token.claims.roleName;
        user.companyId = token.claims.companyId;
        setUser(user);
        setRole(user.roleName);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="*" element={<Navigate to="/" />} />
          <Route path="/" element={<Login />} />
          <Route path="/report" element={<FileReportUser />} />
          <Route path="/home" element={
            <PrivateRoute user={user} role={role} allowedRoles={['user', 'admin', 'superAdmin', 'QA']}>
              <DashboardWrapper />
            </PrivateRoute>} />
          <Route path="/kyro/:companyId/*" element={
            <PrivateRoute user={user} role={role} allowedRoles={['user', 'admin', 'superAdmin', 'QA']}>
              <KyroInstance role={role} />
            </PrivateRoute>} />
          <Route path="/company/:companyId/*" element={
            <PrivateRoute user={user} role={role} allowedRoles={['user', 'admin', 'superAdmin']}>
              <CompanyInstance role={role} />
            </PrivateRoute>} />
          <Route path="/editor/:projectId/:documentId" element={
            <PrivateRoute user={user} role={role} allowedRoles={['user', 'admin', 'QA', 'superAdmin']} >
              <Editor />
            </PrivateRoute>} />
          <Route path="/myWork" element={
            <PrivateRoute user={user} role={role} allowedRoles={['user']}>
              <UserWorkspace />
            </PrivateRoute>} />
          <Route path="/status" element={
            <PrivateRoute user={user} role={role} allowedRoles={['admin', 'superAdmin']}>
              <FileStatusManager />
            </PrivateRoute>} />
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
};

export default App;
