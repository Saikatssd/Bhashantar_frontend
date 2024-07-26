import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { auth } from './utils/firebase';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './components/PrivateRoute';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Profile from './pages/Profile';
import CompanyInstance from './components/CompanyInstance';
import Editor from './components/Editor'
import DashboardWrapper from './components/DashboardWrapper';
import UserHomeKyrotics from './pages/Users/KyroticsUserHome';
import KyroInstance from './components/KyroInstance';
import UserWorkspace from './components/ClientCompany/UserFileFlow';
import FileStatusManager from './components/FileStatusManager';
// import OfficeEditor from './components/OfficeEditor';

const App = () => {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const token = await user.getIdTokenResult();
        // console.log(token)
        user.roleName = token.claims.roleName;
        user.companyId = token.claims.companyId;
        setUser(user);
        // console.log(user)
        setRole(user.roleName);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // const handleLogout = () => {
  //   auth.signOut().then(() => {
  //     setUser(null);
  //   });
  // };

  return (
    <AuthProvider>
      <Router>
        <Routes>

        <Route path="/status" element={<FileStatusManager  />} />

          <Route path="/" element={<Login />} />
          {/* <Route path="/userKyro" element={<UserHomeKyrotics />} /> */}
          <Route path="/home" element={<DashboardWrapper />} />
          <Route path="/register" element={<Register />} />
          {/* <Route path="/profile" element={<Profile />} /> */}
          <Route path="/kyro/:companyId/*" element={<KyroInstance role={role} />} />
          {/* <Route path="/superAdmin" element={<SuperAdminHome />} /> */}
          <Route path="/company/:companyId/*" element={<CompanyInstance role={role} />} />
          <Route path='/editor/:projectId/:documentId' element={<Editor />} />
          <Route path="/myWork" element={<UserWorkspace />} />

          {/* <Route path="/project/:projectId" element={<ProjectFiles />} /> */}
          {/* <Route path="/dashboard" element={<PrivateRoute user={user}><Dashboard role={role} onLogout={handleLogout} /></PrivateRoute>} /> */}
        </Routes>
        <Toaster />
      </Router>
    </AuthProvider>
  );
};

export default App;
