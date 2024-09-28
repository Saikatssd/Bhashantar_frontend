import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth } from "../utils/firebase";
import UserHome from "../pages/Users/UserHome";
import AdminHome from "../pages/Admin/AdminHome";
import SuperAdminHome from "../pages/SuperAdmin/SuperAdminHome";
import QAHome from "../pages/QA/QAHome";
import KyroticsUserHome from "../pages/Users/KyroticsUserHome";
import KyroticsAdminHome from "../pages/Admin/KyroticsAdminHome";
import { fetchCompanyNameByCompanyId } from "../services/companyServices";

const DashboardWrapper = () => {
  // console.log("dashboard ");

  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [role, setRole] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [companyName, setCompanyName] = useState()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const token = await user.getIdTokenResult();
        // console.log("token",token);
        // user.name = tokens.claims.name;
        user.roleName = token.claims.roleName;
        user.companyId = token.claims.companyId;
        setUser(user);
        setUserId(token.claims.user_id);
        // console.log("uid",userId)
        // console.log(user)
        setRole(user.roleName);
        setCompanyId(user.companyId);
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);


  useEffect(() => {
    const fetchCompanyName = async () => {
      const companyName = await fetchCompanyNameByCompanyId(companyId)
      setCompanyName(companyName);
    }
    fetchCompanyName()
  });

//   // Component useEffect
// useEffect(() => {
//   const fetchCompanyName = async () => {
//     try {
//       if (!userCompanyId) {
//         throw new Error("Invalid userCompanyId");
//       }

//       const companyName = await fetchCompanyNameByCompanyId(userCompanyId);
//       setCompanyName(companyName);
//     } catch (error) {
//       console.error("Error fetching company name:", error);
//     }
//   };

//   fetchCompanyName();
// }, [userCompanyId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" />;
  }

  if (companyName === "Kyrotics") {
    if (role === "user") {
      return <KyroticsUserHome userId={userId} userCompanyId={companyId} />;
    }
    if (role === "admin") {
      return <KyroticsAdminHome companyId={companyId} role={role} />;
    }
    if (role === "QA") {
      return <QAHome userId={userId} companyId={companyId} />;
    }
  }


  if (role === "user") {
    return <UserHome userId={userId} companyId={companyId} />;
  }
  if (role === "admin") {
    return <AdminHome companyId={companyId} role={'admin'} />;
  }
  if (role === "superAdmin") {
    return <SuperAdminHome />;
  }

  return <Navigate to="/dashboard" />;
};

export default DashboardWrapper;
